let index_i_insert = 1;
let index_j = 0;

let size = 40; // size of the bars (40 or greater displays numbers)
let apply_sleep = false; // enhances swap animation at low fr
let fr = 300; // 1 - slowest, 300 - fastest

let array = [];
let sorted = false;

let startSorting = false;

let slider;
let sortButton;
let selectFR;
let swapCheckbox;

const createArray = (windowWidth, size) => {
  array = [];
  for (let i = 0; i < Math.floor(windowWidth / size); i++)
    array[i] = Math.floor(random(20, height - 100));
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  createArray(windowWidth, size);
  frameRate(fr);

  swapCheckbox = createCheckbox("  Enhance Visuals", false);
  swapCheckbox.position(30, windowHeight - 45);
  swapCheckbox.style("color: white;");
  swapCheckbox.changed(() => {
    apply_sleep = true;
  });
  swapCheckbox.attribute("class", "ml-2");

  sortButton = createButton("Sort !");
  sortButton.position(windowWidth / 2, windowHeight - 50);
  sortButton.attribute("class", "btn btn-primary py-2 btn-sort");

  slider = createSlider(3, 100, 40, 0);
  slider.attribute("class", "custom-range");
  slider.attribute("type", "range");
  slider.position(windowWidth / 4, windowHeight - 40);

  speedtext = createP("Frame rate: ");
  speedtext.position((2.8 * windowWidth - 80) / 4, windowHeight - 40);
  speedtext.style("color: white");

  selectFR = createSelect();
  selectFR.attribute("class", "custom-select-sm");
  selectFR.position((3 * windowWidth) / 4, windowHeight - 50);
  selectFR.option("High");
  selectFR.option("Medium");
  selectFR.option("Low");

  selectFR.changed(() => {
    if (selectFR.value() === "High") fr = 300;
    else if (selectFR.value() === "Medium") fr = 10;
    else fr = 1;
  });

  sortButton.mousePressed(() => {
    startSorting = true;
    // sortButton.style("color : grey; border-color: grey;");
    sortButton.attribute("disabled", true);
    slider.attribute("disabled", true);
    swapCheckbox.attribute("disabled", true);
  });
}

const sleep = () =>
  new Promise((resolve, _reject) => {
    setTimeout(function () {
      resolve("Have a nap.");
    }, 1250);
  });

async function draw() {
  background(50);
  frameRate(fr);

  let change = slider.value();
  if (change !== size) {
    size = change;
    createArray(windowWidth, change);
  }

  for (let i = 0; i < array.length; i++) {
    stroke(200, 100, 100);
    fill(200, 0, 200, 100);

    if (i === index_i_insert) fill(200, 0, 0, 100);
    rect(i * size, 0, size, array[i]);
    if (size >= 40) text(array[i], i * size + size / 4, array[i] - 10);
  }

  if (startSorting) {
    if (apply_sleep) await sleep();

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
        stroke(200, 100, 100);
        fill(200, 0, 200, 100);

        if (i === index_j + 1) fill(100, 0, 90, 100);
        rect(i * size, 0, size, array[i]);
        if (size >= 40) text(array[i], i * size + size / 4, array[i] - 10);
      }
    } else {
      sorted = true;
    }

    if (sorted) {
      console.log("Sorted!");
      noLoop();
      return;
    }
  }
}
