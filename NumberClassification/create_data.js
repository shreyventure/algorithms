let c;
function setup() {
  c = createCanvas(500, 500);
  background(0);
  frameRate(10);
}
let i = 0;

function draw() {
  // background(0);
  // rectMode(CENTER);
  // let w = random(5, width);
  // strokeWeight(random(2, 10));
  // textSize(w);
  // text("9", random(0, width / 2), random(height / 2, height));
  // fill(255);
  // if (i > 0 && i <= 5) {
  //   save_canvas();
  //   i++;
  // } else {
  //   i++;
  // }

  if (mouseIsPressed) {
    stroke(255);
    strokeWeight(40);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }

  if (keyPressed()) {
    save_canvas();
  }
}

function keyPressed() {
  if (keyCode == 67) return true;
  return false;
}

const save_canvas = async () => {
  let input = createGraphics(28, 28);
  input.copy(c, 0, 0, width, height, 0, 0, 28, 28);
  await saveCanvas(input, `four`, "jpg");
};
