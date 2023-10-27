let index_i = 0;
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
    // array.push(Math.floor(random(20, height - 100)));
    array[i] = Math.floor(random(20, height - 100));
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  createArray(windowWidth, size);
  frameRate(fr);

  swapCheckbox = createCheckbox("  Enhance Swapping", false);
  swapCheckbox.position(30, windowHeight - 40);
  swapCheckbox.style("color: white;");
  swapCheckbox.changed(() => {
    apply_sleep = true;
  });

  sortButton = createButton("Sort!");
  sortButton.position(windowWidth / 2, windowHeight - 50);
  sortButton.size(90, 40);
  sortButton.style(
    "background-color : transparent; color : white; outline: none; border-color: rgb(200, 0, 200, 100); border-radius: 20px"
  );

  slider = createSlider(5, 100, 40, 0);
  slider.position(windowWidth / 4, windowHeight - 40);
  slider.style("width: 200px; background: rgba(200, 0, 200, 100);");

  speedtext = createP("Frame rate: ");
  speedtext.position((2.8 * windowWidth - 80) / 4, windowHeight - 55);
  speedtext.style("color: white");

  selectFR = createSelect();
  selectFR.style(
    "background : transparent; color : white; outline: none; border-color: rgb(200, 0, 200, 100); border-radius: 20px; padding-right: 20px; padding-left: 20px; padding-top: 10px; padding-bottom: 10px"
  );
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
    sortButton.style("color : grey; border-color: grey;");
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
    if (!(index_i < array.length - index_j - 1)) {
      index_i = 0;
      index_j++;
    }
    if ((array[i] && array[i + 1] && i === index_i) || i === index_i + 1) {
      fill(200, 0, 10, 100);
    }
    rect(i * size, 0, size, array[i]);
    if (size >= 40) text(array[i], i * size + size / 4, array[i] - 10);
  }

  if (startSorting) {
    if (apply_sleep) await sleep();

    // BUBBLE SORT

    let swap;

    if (index_j < array.length - 1) {
      if (index_i < array.length - index_j - 1) {
        if (array[index_i] > array[index_i + 1]) {
          swap = array[index_i];
          array[index_i] = array[index_i + 1];
          array[index_i + 1] = swap;

          clear();
          background(50);
          for (let i = 0; i < array.length; i++) {
            stroke(200, 100, 100);
            fill(200, 0, 200, 100);
            if (
              (array[i] && array[i + 1] && i === index_i) ||
              i === index_i + 1
            ) {
              fill(10, 0, 100);
            }
            rect(i * size, 0, size, array[i]);
            if (size >= 40) {
              textSize(12);
              text(array[i], i * size + size / 4, array[i] - 10);
            }
          }
        }

        index_i++;
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
