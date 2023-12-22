let zeros = [],
  ones = [],
  twos = [],
  threes = [],
  fours = [],
  fives = [],
  sixes = [],
  sevens = [],
  eights = [],
  nines = [];

function preload() {
  console.log("Loading Data...");
  for (let i = 1; i <= 130; i++) {
    zeros[i - 1] = loadImage(`data/zeros/zero (${i}).jpg`);
    ones[i - 1] = loadImage(`data/ones/one (${i}).jpg`);
    twos[i - 1] = loadImage(`data/twos/two (${i}).jpg`);
    threes[i - 1] = loadImage(`data/threes/three (${i}).jpg`);
    fours[i - 1] = loadImage(`data/fours/four (${i}).jpg`);
    fives[i - 1] = loadImage(`data/fives/five (${i}).jpg`);
    sixes[i - 1] = loadImage(`data/sixes/six (${i}).jpg`);
    sevens[i - 1] = loadImage(`data/sevens/seven (${i}).jpg`);
    eights[i - 1] = loadImage(`data/eights/eight (${i}).jpg`);
    nines[i - 1] = loadImage(`data/nines/nine (${i}).jpg`);
  }
  console.log("Data Loaded...");
}
let canvas;
let textP;
let nn;
function setup() {
  console.log("Init NN");
  nn = ml5.neuralNetwork({
    inputs: [56, 56, 4],
    task: "imageClassification",
    debug: true,
  });
  console.log("Init NN, done!");

  for (let i = 0; i < 130; i++) {
    nn.addData({ image: zeros[i] }, { target: "zero" });
    nn.addData({ image: ones[i] }, { target: "one" });
    nn.addData({ image: twos[i] }, { target: "two" });
    nn.addData({ image: threes[i] }, { target: "three" });
    nn.addData({ image: fours[i] }, { target: "four" });
    nn.addData({ image: fives[i] }, { target: "five" });
    nn.addData({ image: sixes[i] }, { target: "six" });
    nn.addData({ image: sevens[i] }, { target: "seven" });
    nn.addData({ image: eights[i] }, { target: "eight" });
    nn.addData({ image: nines[i] }, { target: "nine" });
  }

  nn.normalizeData();
  console.log("Training...");
  nn.train(
    {
      epochs: 70,
      batchSize: 50,
    },
    finishedTraining
  );

  function finishedTraining() {
    nn.save("model");
    console.log("Model saved!");
  }
}
