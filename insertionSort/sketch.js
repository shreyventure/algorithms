let index_i_insert = 1;
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
  }
  size = width / count;

  for (let i = 0; i < array.length; i++) {
    if (size < 3) noStroke();
    else stroke(200, 100, 100);
    fill(200, 0, 200, 100);

    if (i === index_i_insert) fill(200, 0, 0, 100);
    rect(i * size, 0, size, array[i]);
    if (size >= 40) text(array[i], i * size + size / 4, array[i] - 10);
  }

  if (startSorting) {
    if (controls.slowSteps()) await sleep();

    // INSERTION SORT

    if (index_i_insert < array.length) {
      var key = array[index_i_insert];
      index_j = index_i_insert - 1;

      while (index_j >= 0 && array[index_j] > key) {
        array[index_j + 1] = array[index_j];
        index_j = index_j - 1;
      }
      array[index_j + 1] = key;
      index_i_insert++;
      clear();
      background(50);
      for (let i = 0; i < array.length; i++) {
        if (size < 3) noStroke();
        else stroke(200, 100, 100);
        fill(200, 0, 200, 100);

        if (i === index_j + 1) fill(100, 0, 90, 100);
        rect(i * size, 0, size, array[i]);
        if (size >= 40) text(array[i], i * size + size / 4, array[i] - 10);
      }
    } else {
      sorted = true;
    }

    if (sorted) {
      controls.finish();
      noLoop();
      return;
    }
  }
}
