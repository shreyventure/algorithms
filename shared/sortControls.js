// Control panel shared by the four sorting sketches.
//
// Each sketch used to position its own checkbox, slider, button and select at
// absolute pixel offsets derived from windowWidth (windowWidth/4, /2, 3/4...).
// That only held together at the one width it was tuned for - on a narrow
// frame the controls landed on top of each other. This builds them once, in
// normal flow, and lets CSS wrap them.
//
// Returns a controller the sketch polls each frame; it owns no sketch state.
function createSortControls(opts) {
  var SPEEDS = [
    { label: "Fast", fr: 300 },
    { label: "Medium", fr: 10 },
    { label: "Slow", fr: 1 },
  ];

  // The slider is the number of bars. It used to be the bar *width* in pixels,
  // which meant dragging it down made the readout fall while the number of
  // bars went up - the opposite of what a control called "Array size" implies.
  var minCount = opts.min || 5;
  var maxCount = opts.max || 400;
  var initial = opts.value || 24;

  var speedIndex = 0;
  var slowSteps = false;
  var started = false;

  var panel = createDiv("");
  panel.id("panel");

  /* --- size + the primary action --- */
  var top = createDiv("");
  top.addClass("row").parent(panel);

  createSpan("Array size").addClass("caption").parent(top);

  var slider = createSlider(minCount, maxCount, initial, 1);
  slider.parent(top);

  var sizeValue = createSpan(String(initial));
  sizeValue.addClass("readout").parent(top);
  slider.input(function () {
    sizeValue.html(slider.value());
  });

  createSpan("").addClass("spacer").parent(top);

  var sortButton = createButton("Sort");
  sortButton.addClass("action primary").parent(top);
  sortButton.mousePressed(function () {
    if (started) return;
    started = true;
    sortButton.html("Sorting…");
    sortButton.attribute("disabled", true);
    slider.attribute("disabled", true);
    slowChip.attribute("disabled", true);
    opts.onSort();
  });

  /* --- speed + slow-motion --- */
  var bottom = createDiv("");
  bottom.addClass("row").parent(panel);

  createSpan("Speed").addClass("caption").parent(bottom);

  var speedChips = SPEEDS.map(function (speed, i) {
    var chip = createButton(speed.label);
    chip.addClass("chip").parent(bottom);
    chip.mousePressed(function () {
      speedIndex = i;
      syncSpeed();
    });
    return chip;
  });

  function syncSpeed() {
    for (var i = 0; i < speedChips.length; i++) {
      if (i === speedIndex) speedChips[i].addClass("active");
      else speedChips[i].removeClass("active");
    }
  }
  syncSpeed();

  var slowChip = createButton("Pause on each swap");
  slowChip.addClass("chip").parent(bottom);
  slowChip.mousePressed(function () {
    slowSteps = !slowSteps;
    if (slowSteps) slowChip.addClass("active");
    else slowChip.removeClass("active");
  });

  return {
    count: function () {
      return slider.value();
    },
    frameRate: function () {
      return SPEEDS[speedIndex].fr;
    },
    slowSteps: function () {
      return slowSteps;
    },
    height: function () {
      return panel.elt.offsetHeight;
    },
    finish: function () {
      sortButton.html("Sorted");
    },
  };
}
