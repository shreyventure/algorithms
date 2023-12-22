let nn;
let div_0, div_1, div_2, div_3, div_4;
let div_5, div_6, div_7, div_8, div_9;
function setup() {
  canvas = createCanvas(400, 400);
  background(0);
  textP = createP("Loading...");
  textP.style("font-size", "20px");

  div_0 = select(".div_0");
  div_1 = select(".div_1");
  div_2 = select(".div_2");
  div_3 = select(".div_3");
  div_4 = select(".div_4");
  div_5 = select(".div_5");
  div_6 = select(".div_6");
  div_7 = select(".div_7");
  div_8 = select(".div_8");
  div_9 = select(".div_9");

  nn = ml5.neuralNetwork({
    inputs: [56, 56, 4],
    task: "imageClassification",
    debug: true,
  });
  const modelDetails = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
  };
  nn.load(modelDetails, () => {
    console.log("Model Loaded!");
    textP.html("Press C to clear the screen.");
    classifyCanvas();
  });
}

function draw() {
  if (mouseIsPressed) {
    stroke(255);
    strokeWeight(40);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

function keyPressed() {
  if (keyCode == 67) background(0);
}
let input;
function classifyCanvas() {
  input = createGraphics(28, 28);
  input.copy(canvas, 0, 0, width, height, 0, 0, 28, 28);
  // image(input, 0, 0);
  nn.classify({ image: input }, (error, result) => {
    if (error) {
      console.error(error);
      return;
    }

    div_0.removeClass("text-white");
    div_0.removeClass("bg-dark");
    div_1.removeClass("text-white");
    div_1.removeClass("bg-dark");
    div_2.removeClass("text-white");
    div_2.removeClass("bg-dark");
    div_3.removeClass("text-white");
    div_3.removeClass("bg-dark");
    div_4.removeClass("text-white");
    div_4.removeClass("bg-dark");
    div_5.removeClass("text-white");
    div_5.removeClass("bg-dark");
    div_6.removeClass("text-white");
    div_6.removeClass("bg-dark");
    div_7.removeClass("text-white");
    div_7.removeClass("bg-dark");
    div_8.removeClass("text-white");
    div_8.removeClass("bg-dark");
    div_9.removeClass("text-white");
    div_9.removeClass("bg-dark");

    if (result[0].label == "zero") {
      div_0.addClass("text-white");
      div_0.addClass("bg-dark");
    } else if (result[0].label == "one") {
      div_1.addClass("text-white");
      div_1.addClass("bg-dark");
    } else if (result[0].label == "two") {
      div_2.addClass("text-white");
      div_2.addClass("bg-dark");
    } else if (result[0].label == "three") {
      div_3.addClass("text-white");
      div_3.addClass("bg-dark");
    } else if (result[0].label == "four") {
      div_4.addClass("text-white");
      div_4.addClass("bg-dark");
    } else if (result[0].label == "five") {
      div_5.addClass("text-white");
      div_5.addClass("bg-dark");
    } else if (result[0].label == "six") {
      div_6.addClass("text-white");
      div_6.addClass("bg-dark");
    } else if (result[0].label == "seven") {
      div_7.addClass("text-white");
      div_7.addClass("bg-dark");
    } else if (result[0].label == "eight") {
      div_8.addClass("text-white");
      div_8.addClass("bg-dark");
    } else if (result[0].label == "nine") {
      div_9.addClass("text-white");
      div_9.addClass("bg-dark");
    }

    textP.html(
      `${result[0].label} : ${result[0].confidence * 100} %<br>${
        result[1].label
      } : ${result[1].confidence * 100} %<br>${result[2].label} : ${
        result[2].confidence * 100
      } %<br>${result[3].label} : ${result[3].confidence * 100} %<br>`
    );
    classifyCanvas();
  });
}
