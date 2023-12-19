let displayAlgoEle = document.getElementById("displayAlgo");
displayAlgoEle.innerHTML = `<h1 class="text-center">Welcome</h1><h3 class="lead">Choose one of the above algorithms to visualise!</h3>`;

const displayAlgo = (algorithm) => {
  console.log("logging");
  let src, title, height, width;

  if (algorithm === "bubbleSort") {
    src = "bubbleSort/index.html";
    title = "Bubble Sort";
    height = "500";
    width = "1100";
  } else if (algorithm === "insertionSort") {
    src = "insertionSort/index.html";
    title = "Insertion Sort";
    height = "500";
    width = "1100";
  } else if (algorithm === "mergeSort") {
    src = "mergeSort/index.html";
    title = "Insertion Sort";
    height = "500";
    width = "1100";
  } else if (algorithm === "selectionSort") {
    src = "selectionSort/index.html";
    title = "Selection Sort";
    height = "500";
    width = "1100";
  } else if (algorithm === "A-star") {
    src = "A-star/index.html";
    title = "A* Algorithm";
    height = "700";
    width = "700";
  } else if (algorithm === "LinearRegression") {
    src = "linearRegression/index.html";
    title = "Linear Regression";
    height = "700";
    width = "700";
  }

  displayAlgoEle.innerHTML = `
  <button class="btn btn-info my-2" onclick="displayAlgo('${algorithm}')">Refresh</button>
  <iframe src="${src}" title="${title}" height="${height}" width="${width}" ></iframe>
  `;
};
