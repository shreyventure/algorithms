var cols, rows;
var w = 30;

var grid = [];

var current;

var stack = [];

var flag = 1;

var totalUnvisited;

function setup() {
  //createCanvas(600, 600);
  createCanvas(windowWidth, windowHeight);
  //   frameRate(20);
  cols = 20; //floor(width / w);
  rows = 20; //floor(height / w);
  totalUnvisited = cols * rows - 1;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      var cell = new Cell(i, j);
      grid.push(cell);
    }
  }

  current = grid[0];
  //   current = grid[floor(random(0, grid.length))];
}

function draw() {
  background(51);

  for (var i = 0; i < grid.length; i++) {
    grid[i].show();
  }

  current.visited = true;
  current.highlight(0, 0, 255, 100);

  var next = current.checkNeighbours();

  if (next) {
    next.visited = true;
    totalUnvisited -= 1;

    stack.push(current);

    removeWalls(current, next);

    current = next;
  } else if (stack.length > 0) {
    if (totalUnvisited === 0) {
      if (flag) {
        current.isLast = true;
        current.R = 200;
        current.G = 100;
        current.B = 0;
        flag = 0;
      }
    }
    var cell = stack.pop();
    current = cell;
  }

  if (totalUnvisited === 0) {
    current.isLast = true;
    current.R = 200;
    current.G = 255;
    current.B = 0;
  } // this give the answer
}

function removeWalls(current, next) {
  var x = current.i - next.i;
  var y = current.j - next.j;
  if (x === 1) {
    current.walls[3] = false;
    next.walls[1] = false;
  } else if (x === -1) {
    current.walls[1] = false;
    next.walls[3] = false;
  }

  if (y === 1) {
    current.walls[0] = false;
    next.walls[2] = false;
  } else if (y === -1) {
    current.walls[2] = false;
    next.walls[0] = false;
  }
}

function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) return -1;
  return i + j * cols;
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.visited = false;

  this.R = 255;
  this.G = 0;
  this.B = 255;
  this.A = 100;
  this.isLast = false;

  this.walls = [true, true, true, true];
  //           [top , right, bottom, left]

  this.show = function () {
    stroke(255);

    var x = this.i * w;
    var y = this.j * w;
    if (this.walls[0]) line(x, y, x + w, y);
    if (this.walls[1]) line(x + w, y, x + w, y + w);
    if (this.walls[2]) line(x + w, y + w, x, y + w);
    if (this.walls[3]) line(x, y + w, x, y);

    if (this.visited) {
      noStroke();
      fill(this.R, this.G, this.B, this.A);
      rect(this.i * w, this.j * w, w, w);
    }
  };

  this.highlight = function (R, G, B, A) {
    var x = this.i * w;
    var y = this.j * w;

    noStroke();
    fill(R, G, B, A);

    rect(x, y, w, w);
  };

  this.checkNeighbours = function () {
    var neighbours = [];
    var top = grid[index(i, j - 1)];
    var right = grid[index(i + 1, j)];
    var bottom = grid[index(i, j + 1)];
    var left = grid[index(i - 1, j)];

    if (top && !top.visited) {
      neighbours.push(top);
    }
    if (right && !right.visited) {
      neighbours.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbours.push(bottom);
    }
    if (left && !left.visited) {
      neighbours.push(left);
    }

    if (neighbours.length > 0)
      return neighbours[floor(random(0, neighbours.length))];
    else return undefined;
  };
}
