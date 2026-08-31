// A* pathfinding on an 8-connected grid.
//
// Interactive: the slider sets how dense the walls are, and clicking the
// canvas places the start, places the goal, or paints walls depending on the
// selected mode. Any edit resets the search so the old result never lingers.

var size = 10;
var cols, rows;

var grid = [];
var start = null;
var end = null;

var openSet = [];
var lines = [];
var traverse = null;

// idle | searching | tracing | done | failed
var state = "idle";

// The browser caps the draw loop at ~60fps, so expanding a single cell per
// frame made a full search take the better part of a minute. Expanding a
// handful per frame keeps the animation readable but finishes in a second or
// two.
var STEPS_PER_FRAME = 8;
var TRACE_PER_FRAME = 3;

var wallDensity = 0.12;
var mode = "wall"; // wall | start | goal
var visualiseAlgo = true;

// One source of truth for the palette: the canvas, the tool chips and the
// legend all read from here. Start used to be amber, which was almost the same
// hue as the lime "explored" cells - blue keeps the two clearly apart.
var COLOR = {
  start: [61, 155, 255],
  goal: [255, 91, 91],
  explored: [197, 236, 7],
  wall: [200, 200, 200],
  path: [123, 9, 225],
  empty: [50, 50, 50],
};

function css(c) {
  return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
}

// Cells are drawn as points centred on their coordinate, so without a margin
// the outermost row and column get clipped in half by the canvas edge. PAD is
// the minimum gutter; the grid is then centred in whatever space is left.
var PAD = 12;
var offsetX = 0;
var offsetY = 0;

var densitySlider, densityValue;
var runButton, randomButton;
var startButton, goalButton, wallButton;

// Click-and-drag wall painting. paintValue is decided on mouse-down so a drag
// consistently adds or removes, instead of flickering each cell it re-enters.
var paintValue = true;
var lastPainted = null;

// p5 has no SQRT2 constant of its own.
var SQRT2 = Math.SQRT2;

// Costs are irrational once diagonals are involved, so equal-cost paths can
// differ in the last bits of a float. Compare with a tolerance.
var EPS = 1e-9;

var NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

function setup() {
  // The canvas fills whatever the frame gives us, minus however tall the
  // control panel ends up - the panel wraps on narrow screens, so its height
  // has to be measured rather than assumed. Scaling the whole page down
  // instead would shrink the controls into illegibility on a phone.
  createCanvas(windowWidth, 100);
  buildControls();
  resizeCanvas(windowWidth, canvasHeight());

  cols = floor((width - 2 * PAD) / size) + 1;
  rows = floor((height - 2 * PAD) / size) + 1;
  offsetX = (width - (cols - 1) * size) / 2;
  offsetY = (height - (rows - 1) * size) / 2;

  buildGrid();
  setStart(cellAt(0, 0));
  setGoal(cellAt(cols - 1, rows - 1));
  generateWalls();
  frameRate(60);

  run();
}

function canvasHeight() {
  var panel = document.getElementById("panel");
  var free = windowHeight - (panel ? panel.offsetHeight : 0);
  // Keep enough grid to be worth looking at even on a short viewport.
  return max(200, free);
}

function draw() {
  background(50);
  show();
  showLine();

  for (var s = 0; s < STEPS_PER_FRAME && state === "searching"; s++) step();
  for (var t = 0; t < TRACE_PER_FRAME && state === "tracing"; t++) trace();

  drawStatus();
}

/* ---------------------------------------------------------------- grid --- */

function buildGrid() {
  grid = [];
  for (var i = 0; i < cols; i++)
    for (var j = 0; j < rows; j++) grid.push(new Cell(i, j));
}

// i is the column (x), j is the row (y).
function cellAt(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) return undefined;
  return grid[i * rows + j];
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.visited = false;
  this.isStart = false;
  this.isEnd = false;
  this.isWall = false;
  this.parent = null;
  this.R = 50;
  this.G = 50;
  this.B = 50;

  this.GScore = Infinity;
  this.FScore = Infinity;
}

function setStart(cell) {
  if (!cell || cell === end) return;
  if (start) start.isStart = false;
  start = cell;
  start.isStart = true;
  start.isWall = false;
}

function setGoal(cell) {
  if (!cell || cell === start) return;
  if (end) end.isEnd = false;
  end = cell;
  end.isEnd = true;
  end.isWall = false;
}

function generateWalls() {
  for (var k = 0; k < grid.length; k++) {
    var cell = grid[k];
    cell.isWall = cell !== start && cell !== end && random() < wallDensity;
  }
}

/* -------------------------------------------------------------- search --- */

function resetSearch() {
  for (var k = 0; k < grid.length; k++) {
    var cell = grid[k];
    cell.visited = false;
    cell.parent = null;
    cell.GScore = Infinity;
    cell.FScore = Infinity;
  }

  lines = [];
  traverse = null;

  start.GScore = 0;
  start.FScore = heuristics(start);
  openSet = [start];

  state = "idle";
}

function run() {
  resetSearch();
  state = "searching";
}

function step() {
  if (openSet.length === 0) {
    state = "failed";
    return;
  }

  var current = lowestFScore();

  if (current === end) {
    state = "tracing";
    traverse = end;
    openSet = [];
    return;
  }

  openSet.splice(openSet.indexOf(current), 1);
  current.visited = true;

  var neighbours = getNeighbours(current);
  for (var k = 0; k < neighbours.length; k++) {
    var neighbour = neighbours[k];
    if (neighbour.isWall) continue;

    // A diagonal step covers sqrt(2) of grid distance, not 1. Charging it the
    // same as an orthogonal step makes every mix of 42 diagonals and 35
    // straights tie at 77, so the search wanders (and draws paths that run
    // along an edge before cutting across) instead of following the direct
    // line.
    var diagonal =
      neighbour.i !== current.i && neighbour.j !== current.j;
    var tentative = current.GScore + (diagonal ? SQRT2 : 1);

    if (tentative < neighbour.GScore) {
      neighbour.parent = current;
      neighbour.GScore = tentative;
      neighbour.FScore = tentative + heuristics(neighbour);
      if (openSet.indexOf(neighbour) === -1) openSet.push(neighbour);
    }
  }
}

// Walks the parent chain back from the goal, one link per frame.
function trace() {
  if (traverse === start || !traverse.parent) {
    state = "done";
    return;
  }
  lines.push([traverse, traverse.parent]);
  traverse = traverse.parent;
}

// Octile costs make the total correct, but they leave enormous ties: every
// interleaving of the same number of diagonal and straight steps costs exactly
// the same. Picking arbitrarily among them draws a path that runs along one
// edge and then cuts across. So when two cells tie on f, expand the one nearer
// the straight start->goal line. This only orders cells that already have
// equal f, so the cheapest cost is never traded away - it just chooses the
// tied path that looks like the line.
function lowestFScore() {
  var best = null;
  var bestF = Infinity;
  var bestTie = Infinity;

  for (var i = 0; i < openSet.length; i++) {
    var cell = openSet[i];
    var f = cell.FScore;
    var tie = lineDeviation(cell);

    if (f < bestF - EPS) {
      best = cell;
      bestF = f;
      bestTie = tie;
    } else if (f < bestF + EPS && tie < bestTie) {
      best = cell;
      bestTie = tie;
      if (f < bestF) bestF = f;
    }
  }
  return best;
}

// |(cell - start) x (goal - start)|, which is proportional to the
// perpendicular distance from the straight start->goal line.
function lineDeviation(cell) {
  return abs(
    (cell.i - start.i) * (end.j - start.j) -
      (cell.j - start.j) * (end.i - start.i)
  );
}

// Octile distance: the exact cost of crossing an empty grid when a diagonal
// costs sqrt(2) and a straight costs 1 - take as many diagonals as the shorter
// axis allows, then go straight the rest of the way. Being exact on an open
// grid makes it admissible and consistent, so A* stays optimal; a Euclidean
// heuristic would overestimate here and quietly give up optimality.
function heuristics(cell) {
  var dx = abs(end.i - cell.i);
  var dy = abs(end.j - cell.j);
  return max(dx, dy) + (SQRT2 - 1) * min(dx, dy);
}

function getNeighbours(cell) {
  var neighbours = [];
  for (var k = 0; k < NEIGHBOURS.length; k++) {
    var neighbour = cellAt(cell.i + NEIGHBOURS[k][0], cell.j + NEIGHBOURS[k][1]);
    if (neighbour) neighbours.push(neighbour);
  }
  return neighbours;
}

/* --------------------------------------------------------------- input --- */

function cellUnderMouse() {
  if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height)
    return undefined;
  // Cells are drawn as points centred on their coordinate, so round to the
  // nearest one rather than flooring.
  return cellAt(
    constrain(Math.round((mouseX - offsetX) / size), 0, cols - 1),
    constrain(Math.round((mouseY - offsetY) / size), 0, rows - 1)
  );
}

function mousePressed() {
  var cell = cellUnderMouse();
  if (!cell) return;
  if (mode === "wall") paintValue = !cell.isWall;
  applyTo(cell);
}

function mouseDragged() {
  if (mode !== "wall") return;
  var cell = cellUnderMouse();
  if (!cell || cell === lastPainted) return;
  applyTo(cell);
}

function mouseReleased() {
  lastPainted = null;
}

function applyTo(cell) {
  lastPainted = cell;

  if (mode === "start") setStart(cell);
  else if (mode === "goal") setGoal(cell);
  else {
    if (cell === start || cell === end) return;
    cell.isWall = paintValue;
  }

  resetSearch();
}

/* ------------------------------------------------------------ controls --- */

// The panel sits in normal flow under the canvas and is laid out by CSS, so
// nothing here depends on hand-computed pixel positions.
function buildControls() {
  var panel = createDiv("");
  panel.id("panel");

  /* --- tools: what a click on the grid does --- */
  var tools = row(panel);
  caption("Click to place", tools);

  startButton = chip("Start point", COLOR.start, tools, function () {
    setMode("start");
  });
  goalButton = chip("Destination", COLOR.goal, tools, function () {
    setMode("goal");
  });
  wallButton = chip("Walls", COLOR.wall, tools, function () {
    setMode("wall");
  });

  createSpan("").addClass("spacer").parent(tools);

  runButton = action("Find path", tools, run, true);
  randomButton = action("Randomise walls", tools, function () {
    generateWalls();
    resetSearch();
  });

  /* --- wall density --- */
  var density = row(panel);
  caption("Wall density", density);

  densitySlider = createSlider(0, 90, wallDensity * 100, 1);
  densitySlider.parent(density);
  densitySlider.input(function () {
    wallDensity = densitySlider.value() / 100;
    densityValue.html(densitySlider.value() + "%");
    generateWalls();
    resetSearch();
  });

  densityValue = createSpan(densitySlider.value() + "%");
  densityValue.id("pct").parent(density);

  createSpan("Drag across the grid to draw several walls at once")
    .addClass("hint")
    .parent(density);

  /* --- colour key --- */
  var key = row(panel);
  caption("Colour key", key);

  legend("Start point", COLOR.start, key);
  legend("Destination", COLOR.goal, key);
  legend("Wall", COLOR.wall, key);
  legend("Explored", COLOR.explored, key);
  legend("Shortest path", COLOR.path, key, true);

  setMode(mode);
}

function row(parent) {
  return createDiv("").addClass("row").parent(parent);
}

function caption(txt, parent) {
  return createSpan(txt).addClass("caption").parent(parent);
}

function swatch(color, bar) {
  return (
    '<span class="swatch' +
    (bar ? " bar" : "") +
    '" style="background:' +
    css(color) +
    '"></span>'
  );
}

function chip(txt, color, parent, handler) {
  var b = createButton(swatch(color) + txt);
  b.addClass("chip").parent(parent);
  b.mousePressed(handler);
  return b;
}

function action(txt, parent, handler, primary) {
  var b = createButton(txt);
  b.addClass(primary ? "action primary" : "action").parent(parent);
  b.mousePressed(handler);
  return b;
}

function legend(txt, color, parent, bar) {
  return createSpan(swatch(color, bar) + txt)
    .addClass("legend")
    .parent(parent);
}

function setMode(next) {
  mode = next;
  toggleActive(startButton, mode === "start");
  toggleActive(goalButton, mode === "goal");
  toggleActive(wallButton, mode === "wall");
}

function toggleActive(b, on) {
  if (on) b.addClass("active");
  else b.removeClass("active");
}

/* --------------------------------------------------------------- paint --- */

function show() {
  for (var k = 0; k < grid.length; k++) {
    var cell = grid[k];

    strokeWeight(5);
    stroke(COLOR.empty);

    if (cell.visited && visualiseAlgo) stroke(COLOR.explored);
    if (cell.isWall) stroke(COLOR.wall);

    if (cell.isStart) {
      strokeWeight(15);
      stroke(COLOR.start);
    }
    if (cell.isEnd) {
      strokeWeight(15);
      stroke(COLOR.goal);
    }

    point(offsetX + cell.i * size, offsetY + cell.j * size);
  }
}

function showLine() {
  for (var i = 0; i < lines.length; i++) {
    stroke(COLOR.path);
    strokeWeight(5);
    line(
      offsetX + lines[i][0].i * size,
      offsetY + lines[i][0].j * size,
      offsetX + lines[i][1].i * size,
      offsetY + lines[i][1].j * size
    );
  }
}

function drawStatus() {
  if (state !== "done" && state !== "failed") return;

  var msg = state === "done" ? "Shortest path found" : "No path - too many walls";

  // Sits on top of the grid, so give it a backdrop to stay readable.
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);

  fill(40, 40, 40, 230);
  rectMode(CENTER);
  rect(width * 0.5, 32, textWidth(msg) + 28, 32, 8);
  rectMode(CORNER);

  if (state === "done") fill(255);
  else fill(255, 90, 90);
  text(msg, width * 0.5, 32);
}
