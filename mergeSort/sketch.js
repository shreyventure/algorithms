let curr_size = 1;
let index_j = 1;

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

    rect(i * size, 0, size, array[i]);
    if (size >= 40) text(array[i], i * size + size / 4, array[i] - 10);
  }

  if (startSorting) {
    if (controls.slowSteps()) await sleep();

    // MERGE SORT

    // Must be <=, not <: when array.length - 1 is itself a power of two the
    // final merge pass is the one with curr_size === array.length - 1, and
    // skipping it leaves the last run unmerged (n = 3, 5, 9, 17, 33, ...).
    if (curr_size <= array.length - 1) {
      for (
        let left_start = 0;
        left_start < array.length - 1;
        left_start += 2 * curr_size
      ) {
        // Find ending point of left subarray. mid+1 is starting
        // point of right
        var n = array.length;
        var mid = min(left_start + curr_size - 1, n - 1);

        var right_end = min(left_start + 2 * curr_size - 1, n - 1);

        // Merge Subarrays arr[left_start...mid] & arr[mid+1...right_end]
        merge(array, left_start, mid, right_end);
        // await sleep();
      }

      curr_size = 2 * curr_size;
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

function merge(arr, l, m, r) {
  var i, j, k;
  var n1 = m - l + 1;
  var n2 = r - m;

  /* create temp arrays */
  var L = [],
    R = [];

  /* Copy data to temp arrays L[] and R[] */
  for (i = 0; i < n1; i++) L[i] = arr[l + i];
  for (j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

  /* Merge the temp arrays back into arr[l..r]*/
  i = 0;
  j = 0;
  k = l;
  while (i < n1 && j < n2) {
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    } else {
      arr[k] = R[j];
      j++;
    }
    k++;
  }

  /* Copy the remaining elements of L[], if there are any */
  while (i < n1) {
    arr[k] = L[i];
    i++;
    k++;
  }

  /* Copy the remaining elements of R[], if there are any */
  while (j < n2) {
    arr[k] = R[j];
    j++;
    k++;
  }
}
