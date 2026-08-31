var data = [];
var m = 1;
var b = 0;

// y = mx + b

function setup() {
  createCanvas(windowWidth, windowHeight);
  seedPoints(40);
}

function draw() {
  background(51);
  noStroke();
  for (var i = 0; i < data.length; i++) {
    fill(50, 200, 100, 200);
    ellipse(data[i].x, data[i].y, 8, 8);
  }
  if (data.length > 1) drawLine();
  drawOverlay();
}

// On-canvas readout and instructions, so the sketch explains itself when it is
// opened on its own rather than inside the gallery shell.
function drawOverlay() {
  noStroke();
  textAlign(LEFT, TOP);

  if (data.length > 1) {
    textSize(15);
    fill(200, 0, 200);
    text("y = " + nf(m, 1, 2) + "x " + (b < 0 ? "- " : "+ ") + nf(abs(b), 1, 1), 16, 14);
  }

  textSize(12);
  fill(150);
  text(data.length + (data.length === 1 ? " point" : " points"), 16, 38);

  textAlign(CENTER, BOTTOM);
  textSize(13);
  fill(170);
  text("Click anywhere to add a point   ·   Press C to clear", width / 2, height - 14);
}

function keyPressed() {
  if (key === "c" || key === "C") {
    data = [];
    m = 0;
    b = 0;
  }
}

// Seed a correlated but noisy cloud once, so there is something to fit on
// load. This used to be drawPoint(), called from draw() - it appended a point
// every frame, so `data` grew without bound and the refit turned quadratic.
// Its points also walked x and y up in equal steps, which pinned the fitted
// line to the diagonal no matter what you clicked.
// Proportional to the canvas rather than tuned to a 600x600 square, so the
// cloud keeps the same shape whatever aspect ratio the frame gives us.
function seedPoints(count) {
  for (var i = 0; i < count; i++) {
    var px = random(width);
    var py = constrain(
      height * 0.18 + (px / width) * height * 0.6 + random(-1, 1) * height * 0.13,
      6,
      height - 6
    );
    data.push({ x: px, y: py });
  }
  if (data.length > 1) linearRegression();
}

function linearRegression() {
  var xsum = 0;
  var ysum = 0;
  for (var i = 0; i < data.length; i++) {
    xsum += data[i].x;
    ysum += data[i].y;
  }

  var xmean = xsum / data.length;
  var ymean = ysum / data.length;

  var numerator = 0;
  var denominator = 0;

  for (var i = 0; i < data.length; i++) {
    var x = data[i].x;
    var y = data[i].y;

    numerator += (x - xmean) * (y - ymean);
    denominator += (x - xmean) * (x - xmean);

    m = numerator / denominator;
    b = ymean - m * xmean;
  }
}

function drawLine() {
  var x1 = 0;
  var y1 = m * x1 + b;
  var x2 = width;
  var y2 = m * x2 + b;

  stroke(200, 0, 200);
  strokeWeight(4);
  line(x1, y1, x2, y2);
}

function mousePressed() {
  // mousePressed fires for the whole window, not just the canvas.
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

  data.push({ x: mouseX, y: mouseY });
  if (data.length > 1) linearRegression();
}
