let index_i = 0;
let index_j = 0;

let count = 24; // number of bars, set by the slider
let size; // bar width in px, derived from the canvas width

let array = [];
let sorted = false;

let startSorting = false;

let controls;

const createArray = (n) => {
  array = [];
  for (let i = 0; i < n; i++)
    array[i] = Math.floor(random(20, height - 8));
};

function setup() {
  // Build the panel first so its height is known, then give the canvas the
  // rest. The panel wraps on narrow frames, so its height has to be measured
  // rather than assumed.
  createCanvas(windowWidth, 100);
  controls = createSortControls({
    value: count,
    onSort: function () {
      startSorting = true;
    },
  });
  resizeCanvas(windowWidth, max(200, windowHeight - controls.height()));

  size = width / count;
  createArray(count);
}

const sleep = () =>
  new Promise((resolve, _reject) => {
    setTimeout(function () {
      resolve("Have a nap.");
    }, 1250);
  });

async function draw() {
  background(50);
  frameRate(controls.frameRate());

  let change = controls.count();
  if (change !== count) {
    count = change;
    createArray(count);
    index_i = 0;
    index_j = 0;
  }
  size = width / count;

  drawBars();

  if (startSorting) {
    if (controls.slowSteps()) await sleep();

    // Deliberately one comparison per frame. Bubble sort crawling while merge
    // sort finishes the same array in a moment is the point of having both.
    bubbleStep();

    if (sorted) {
      controls.finish();
      noLoop();
      return;
    }
  }
}

// One comparison, then advance. Pulled out of the render loop, where the
// pass-advance used to live and ran once per bar drawn.
function bubbleStep() {
  if (index_j >= array.length - 1) {
    sorted = true;
    return;
  }

  if (index_i >= array.length - index_j - 1) {
    index_i = 0;
    index_j++;
    return;
  }

  if (array[index_i] > array[index_i + 1]) {
    const swap = array[index_i];
    array[index_i] = array[index_i + 1];
    array[index_i + 1] = swap;
  }

  index_i++;
}

function drawBars() {
  for (let i = 0; i < array.length; i++) {
    // Below a few pixels the outline is wider than the bar itself.
    if (size < 3) noStroke();
    else stroke(200, 100, 100);

    fill(200, 0, 200, 100);
    if (i === index_i || i === index_i + 1) fill(200, 0, 10, 100);

    rect(i * size, 0, size, array[i]);
    if (size >= 40) text(array[i], i * size + size / 4, array[i] - 10);
  }
}
