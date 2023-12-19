var data = [];
var m = 1;
var b = 0;

// y = mx + b

var x = 0;
var y = 0;

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(51);
  noStroke();
  for (var i = 0; i < data.length; i++) {
    fill(50, 200, 100, 200);
    ellipse(data[i].x, data[i].y, 8, 8);
  }
  drawPoint();
  drawLine();
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
  data.push({ x: mouseX, y: mouseY });
  if (data.length > 1) linearRegression();
  console.log(mouseX, mouseY);
}

function drawPoint() {
  x += random(1, 30);
  y += random(1, 30);
  if (x >= width) x = 0;

  if (y >= height) y = 0;

  data.push({ x, y });
  if (data.length > 1) linearRegression();
  console.log(x, y);
}
