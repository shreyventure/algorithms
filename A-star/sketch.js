var rows;
var cols;
var size = 10;

var grid = [];
var start;
var end = null;

var openSet = [];
var closeSet = [];

var foundPath = false;
var traverse = null;

var lines = [];

var fr = 300;
var wallsIntensity = 10;
// var wallsIntensity = 30;
var visualiseAlgo = true;

function setup() {
  createCanvas(500, 500);

  rows = Math.floor(width / size);
  cols = Math.floor(height / size);

  create();
  createWalls();
  frameRate(fr);
}

function draw() {
  background(50);
  show();
  if (openSet.length > 0) {
    var current = lowestFScore();
    if (current === end) {
      foundPath = true;
      traverse = end;
      openSet = [];
    } else {
      const index = openSet.indexOf(current);
      if (index > -1) {
        openSet.splice(index, 1);
      }

      var neighbours = getNeightbours(current);

      for (var i = 0; i < neighbours.length; i++) {
        if (!neighbours[i].isWall) {
          tentativeScore = 0;
          tentativeScore = current.GScore + 1;

          if (tentativeScore < neighbours[i].GScore) {
            neighbours[i].parent = current;
            current.visited = true;
            neighbours[i].GScore = tentativeScore;
            neighbours[i].FScore =
              neighbours[i].GScore + heuristics(neighbours[i]);

            if (!openSet.includes(neighbours[i])) {
              openSet.push(neighbours[i]);
            }
          }
        }
      }
    }
  } else if (foundPath === false) {
    console.log("Walls let me down. :(");
    textSize(30);
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    text("Walls let me down. :(", width * 0.5, 80);
    noLoop();
  }

  if (foundPath) {
    showLine();
    if (traverse === start) {
      console.log("Found the optimal path! :)");
      textSize(30);
      textAlign(CENTER, CENTER);
      fill(255);
      text("Found the optimal path! :)", width * 0.5, 80);
      noLoop();
      return;
    }

    lines.push([traverse, traverse.parent]);
    traverse = traverse.parent;
    if (traverse !== start) traverse.isPath = true;
  }
}

function lowestFScore() {
  var min = Infinity;
  var cell = null;
  for (var i = 0; i < openSet.length; i++) {
    if (openSet[i].FScore < min) {
      cell = openSet[i];
      min = openSet[i].FScore;
    }
  }
  return cell;
}

function create() {
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid.push(new Cell(i, j, false));
    }
  }

  // start = grid[floor(random(1, ((width / size) * width) / size))];
  start = grid[0];
  while (end === null) {
    newEnd =
      grid[grid.length - floor(random(1, ((width / size) * width) / size))];
    if (newEnd.isWall) end = null;
    else if (newEnd.isStart) end = null;
    else end = newEnd;
  }
  end = grid[grid.length - 1];
  start.isStart = true;
  start.GScore = 0;
  end.isEnd = true;
  start.FScore = heuristics(start);

  openSet = [start];
}

function heuristics(cell) {
  return sqrt(pow(end.i - cell.i, 2) + pow(end.j - cell.j, 2));
}

function createWalls() {
  for (var i = 0; i < rows; i++) {
    // wallsIntensity -= 0.1;
    for (var j = 0; j < cols; j++) {
      for (k = 0; k < wallsIntensity; k++)
        if (j === floor(random(width / size)))
          grid[floor(width / size) * i + j].isWall = grid[
            floor(width / size) * i + j
          ].isEnd
            ? false
            : grid[floor(width / size) * i + j].isStart
            ? false
            : true;
    }
  }
}

function showLine() {
  for (var i = 0; i < lines.length; i++) {
    stroke(123, 9, 225);
    strokeWeight(5);
    line(
      lines[i][0].i * size,
      lines[i][0].j * size,
      lines[i][1].i * size,
      lines[i][1].j * size
    );
  }
}

function show() {
  for (var index = 0; index < grid.length; index++) {
    var cell = grid[index];
    strokeWeight(5);
    stroke(cell.R, cell.G, cell.B);
    if (cell.visited && visualiseAlgo) stroke(197, 236, 7);

    if (cell.isStart) {
      strokeWeight(15);
      stroke(247, 211, 40);
    }

    if (cell.isEnd) {
      strokeWeight(15);
      stroke(91, 244, 239);
    }

    if (cell.isWall) stroke(200, 200, 200);

    point(cell.i * size, cell.j * size);
  }
}

function Cell(i, j, vis) {
  this.i = i;
  this.j = j;
  this.visited = false;
  this.isStart = false;
  this.isEnd = false;
  this.isPath = false;
  this.R = 50;
  this.G = 50;
  this.B = 50;
  this.parent = null;
  this.isWall = vis;

  this.GScore = Infinity;
  this.FScore = Infinity;
  this.H = null;
}

function getNeightbours(cell) {
  var i = cell.i;
  var j = cell.j;
  var neighbours = [];
  if (
    grid[floor(width / size) * (i + 1) + j] &&
    i + 1 >= 0 &&
    i + 1 < floor(width / size) &&
    j < floor(width / size) &&
    j >= 0
  ) {
    neighbours.push(grid[floor(width / size) * (i + 1) + j]);
  }
  if (
    grid[floor(width / size) * (i - 1) + j] &&
    i - 1 >= 0 &&
    i - 1 < floor(width / size) &&
    j < floor(width / size) &&
    j >= 0
  ) {
    neighbours.push(grid[floor(width / size) * (i - 1) + j]);
  }
  if (
    grid[floor(width / size) * i + (j + 1)] &&
    i >= 0 &&
    i < floor(width / size) &&
    j + 1 < floor(width / size) &&
    j + 1 >= 0
  ) {
    neighbours.push(grid[floor(width / size) * i + (j + 1)]);
  }
  if (
    grid[floor(width / size) * i + (j - 1)] &&
    i >= 0 &&
    i < floor(width / size) &&
    j - 1 < floor(width / size) &&
    j - 1 >= 0
  ) {
    neighbours.push(grid[floor(width / size) * i + (j - 1)]);
  }

  if (
    grid[floor(width / size) * (i - 1) + (j - 1)] &&
    i - 1 >= 0 &&
    i - 1 < floor(width / size) &&
    j - 1 < floor(width / size) &&
    j - 1 > 0
  ) {
    neighbours.push(grid[floor(width / size) * (i - 1) + (j - 1)]);
  }
  if (
    grid[floor(width / size) * (i - 1) + (j + 1)] &&
    i - 1 >= 0 &&
    i - 1 < floor(width / size) &&
    j + 1 < floor(width / size) &&
    j + 1 >= 0
  ) {
    neighbours.push(grid[floor(width / size) * (i - 1) + (j + 1)]);
  }
  if (
    grid[floor(width / size) * (i + 1) + (j - 1)] &&
    i + 1 >= 0 &&
    i + 1 < floor(width / size) &&
    j - 1 < floor(width / size) &&
    j - 1 > 0
  ) {
    neighbours.push(grid[floor(width / size) * (i + 1) + (j - 1)]);
  }
  if (
    grid[floor(width / size) * (i + 1) + (j + 1)] &&
    i + 1 >= 0 &&
    i + 1 < floor(width / size) &&
    j + 1 < floor(width / size) &&
    j + 1 >= 0
  ) {
    neighbours.push(grid[floor(width / size) * (i + 1) + (j + 1)]);
  }

  return neighbours;
}
