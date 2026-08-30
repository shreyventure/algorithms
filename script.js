/* ------------------------------------------------------------------ *
 * Algorithms Visualizer — shell
 *
 * Each sketch lives in its own folder and is embedded in an iframe.
 * `fit: "fill"` sketches call createCanvas(windowWidth, windowHeight) and
 * size themselves to the frame; `fit: "fixed"` ones have a hard-coded
 * canvas, so we give the frame their natural size and scale it down when
 * the stage is too small.
 * ------------------------------------------------------------------ */

const ALGOS = [
  {
    id: "bubbleSort",
    name: "Bubble Sort",
    group: "Sorting",
    color: "var(--sort)",
    src: "bubbleSort/index.html",
    fit: "fill",
    tags: ["O(n²)", "stable", "in-place"],
    blurb:
      "Repeatedly walks the array, swapping neighbours that are out of order, so the largest value bubbles to the end on every pass.",
    controls: ["Slider sets array size", "Press Sort! to run"],
  },
  {
    id: "mergeSort",
    name: "Merge Sort",
    group: "Sorting",
    color: "var(--sort)",
    src: "mergeSort/index.html",
    fit: "fill",
    tags: ["O(n log n)", "stable", "divide & conquer"],
    blurb:
      "Splits the array in half until every piece is a single element, then merges the pieces back together in order.",
    controls: ["Slider sets array size", "Press Sort! to run"],
  },
  {
    id: "insertionSort",
    name: "Insertion Sort",
    group: "Sorting",
    color: "var(--sort)",
    src: "insertionSort/index.html",
    fit: "fill",
    tags: ["O(n²)", "stable", "in-place"],
    blurb:
      "Grows a sorted prefix one element at a time, sliding each new value backwards until it lands in the right slot.",
    controls: ["Slider sets array size", "Press Sort! to run"],
  },
  {
    id: "selectionSort",
    name: "Selection Sort",
    group: "Sorting",
    color: "var(--sort)",
    src: "selectionSort/index.html",
    fit: "fill",
    tags: ["O(n²)", "in-place", "n swaps"],
    blurb:
      "Scans the unsorted remainder for the smallest value and swaps it into place — the fewest writes of any simple sort.",
    controls: ["Slider sets array size", "Press Sort! to run"],
  },
  {
    id: "aStar",
    name: "A* Pathfinding",
    group: "Pathfinding",
    color: "var(--path)",
    src: "A-star/index.html",
    fit: "fixed",
    width: 500,
    height: 500,
    tags: ["heuristic search", "f = g + h"],
    blurb:
      "Explores a grid towards the goal by always expanding the cell with the lowest estimated total cost, giving the shortest path without checking everything.",
    controls: [
      "Amber: start",
      "Cyan: goal",
      "Lime: explored",
      "Purple: shortest path",
    ],
  },
  {
    id: "maze",
    name: "Maze Generator",
    group: "Pathfinding",
    color: "var(--path)",
    src: "maze/index.html",
    // The grid is a hard-coded 20x20 of 30px cells, so the canvas is 600x600
    // no matter how wide the frame is.
    fit: "fixed",
    width: 600,
    height: 600,
    tags: ["DFS", "backtracking"],
    blurb:
      "Carves a perfect maze with randomised depth-first search: wander into unvisited cells, knocking down walls, and backtrack at dead ends.",
    controls: ["Runs automatically", "Reload to regenerate"],
  },
  {
    id: "linearRegression",
    name: "Linear Regression",
    group: "Machine Learning",
    color: "var(--ml)",
    src: "linearRegression/index.html",
    fit: "fixed",
    width: 600,
    height: 600,
    tags: ["least squares", "y = mx + b"],
    blurb:
      "Fits the line that minimises squared error across the points, refitting live as new data arrives.",
    controls: ["Click the canvas to add a point", "Line refits instantly"],
  },
];

const byId = Object.fromEntries(ALGOS.map((a) => [a.id, a]));

/* ------------------------------------------------------------------ *
 * Elements
 * ------------------------------------------------------------------ */

const el = {
  nav: document.getElementById("nav"),
  stage: document.getElementById("stage"),
  title: document.getElementById("algoTitle"),
  tags: document.getElementById("algoTags"),
  actions: document.getElementById("topbarActions"),
  infobar: document.getElementById("infobar"),
  blurb: document.getElementById("algoBlurb"),
  controls: document.getElementById("algoControls"),
  reloadBtn: document.getElementById("reloadBtn"),
  fullscreenBtn: document.getElementById("fullscreenBtn"),
  popoutBtn: document.getElementById("popoutBtn"),
  menuBtn: document.getElementById("menuBtn"),
  sidebar: document.getElementById("sidebar"),
  scrim: document.getElementById("scrim"),
};

let currentId = null;

/* ------------------------------------------------------------------ *
 * Sidebar
 * ------------------------------------------------------------------ */

const buildNav = () => {
  const groups = [];
  ALGOS.forEach((algo, i) => {
    let group = groups.find((g) => g.name === algo.group);
    if (!group) groups.push((group = { name: algo.group, items: [] }));
    group.items.push({ algo, index: i + 1 });
  });

  el.nav.innerHTML = groups
    .map(
      (group) => `
      <div class="nav-group">
        <span class="nav-group-label">${group.name}</span>
        ${group.items
          .map(
            ({ algo, index }) => `
          <button class="nav-item" data-id="${algo.id}" style="--dot:${algo.color}">
            <span class="nav-dot"></span>
            <span>${algo.name}</span>
            <span class="nav-key">${index}</span>
          </button>`
          )
          .join("")}
      </div>`
    )
    .join("");
};

const syncNav = () => {
  el.nav.querySelectorAll(".nav-item").forEach((item) => {
    if (item.dataset.id === currentId) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  });
};

const setSidebar = (open) => {
  el.sidebar.classList.toggle("is-open", open);
  el.scrim.hidden = !open;
  el.menuBtn.setAttribute("aria-expanded", String(open));
};

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

const tagsHTML = (algo) =>
  algo.tags.map((t) => `<span class="tag">${t}</span>`).join("");

const renderHome = () => {
  currentId = null;
  renderedSize = null;
  syncNav();

  el.title.textContent = "Welcome";
  el.tags.innerHTML = "";
  el.actions.hidden = true;
  el.infobar.hidden = true;

  el.stage.innerHTML = `
    <div class="home">
      <div class="home-hero">
        <p class="eyebrow">${ALGOS.length} interactive sketches</p>
        <h2>See how algorithms <em>actually run</em></h2>
        <p>Classic algorithms drawn frame by frame with p5.js. Pick one to watch it work.</p>
      </div>
      <div class="card-grid">
        ${ALGOS.map(
          (algo) => `
          <a class="card" href="#/${algo.id}" style="--dot:${algo.color}">
            <span class="card-top">
              <span class="nav-dot"></span>
              <h3>${algo.name}</h3>
            </span>
            <p>${algo.blurb}</p>
            <span class="tags">${tagsHTML(algo)}</span>
          </a>`
        ).join("")}
      </div>
    </div>`;
};

/** Scale a fixed-size sketch down when the stage can't fit it. */
const fitFrame = () => {
  const frame = el.stage.querySelector(".sketch-frame:not(.is-fill)");
  if (!frame) return;

  const pad = 40;
  const w = Number(frame.dataset.w);
  const h = Number(frame.dataset.h);
  const scale = Math.min(
    1,
    (el.stage.clientWidth - pad) / w,
    (el.stage.clientHeight - pad) / h
  );

  frame.style.transform = scale < 1 ? `scale(${scale})` : "";
};

/**
 * The `fill` sketches read windowWidth/windowHeight once in setup() and never
 * define windowResized(), so they keep their original canvas size forever.
 * Reloading the iframe when the stage changes size is the only way to re-fit
 * them without touching every sketch.
 */
let resizeTimer;
let renderedSize = null;

const stageSize = () => [
  Math.round(el.stage.clientWidth),
  Math.round(el.stage.clientHeight),
];

const watchStageSize = () => {
  if (!window.ResizeObserver) return;

  new ResizeObserver(() => {
    if (!renderedSize) return;

    const [w, h] = stageSize();
    // Ignore sub-pixel jitter; only a real layout change warrants a reload.
    if (Math.abs(w - renderedSize[0]) < 2 && Math.abs(h - renderedSize[1]) < 2)
      return;

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => currentId && renderAlgo(currentId), 250);
  }).observe(el.stage);
};

const renderAlgo = (id) => {
  const algo = byId[id];
  if (!algo) return renderHome();

  currentId = id;
  syncNav();

  el.title.textContent = algo.name;
  el.tags.innerHTML = tagsHTML(algo);
  el.actions.hidden = false;
  el.popoutBtn.href = algo.src;

  el.blurb.textContent = algo.blurb;
  el.controls.innerHTML = algo.controls.map((c) => `<li>${c}</li>`).join("");
  el.infobar.hidden = false;

  const fill = algo.fit === "fill";
  // Cache-bust so "Reload" restarts the sketch from a clean state.
  const src = `${algo.src}?t=${Date.now()}`;

  el.stage.innerHTML = `
    <div class="sketch-frame is-loading ${fill ? "is-fill" : ""}"
         data-w="${algo.width || 0}" data-h="${algo.height || 0}"
         ${fill ? "" : `style="width:${algo.width}px;height:${algo.height}px"`}>
      <iframe src="${src}" title="${algo.name} visualisation"
              loading="eager" allow="fullscreen"></iframe>
      <div class="spinner">Loading sketch…</div>
    </div>`;

  const frame = el.stage.firstElementChild;
  frame.querySelector("iframe").addEventListener("load", () => {
    frame.classList.remove("is-loading");
  });

  fitFrame();
  // Remember the size the sketch was built at, so the observer can tell a real
  // resize from the reflow this render just caused.
  renderedSize = fill ? stageSize() : null;
};

/* ------------------------------------------------------------------ *
 * Routing — the hash keeps deep links and reloads working
 * ------------------------------------------------------------------ */

const route = () => {
  const id = location.hash.replace(/^#\/?/, "");
  if (byId[id]) renderAlgo(id);
  else renderHome();
  setSidebar(false);
};

const go = (id) => {
  const next = `#/${id}`;
  if (location.hash === next) renderAlgo(id); // same route: force a reload
  else location.hash = next;
};

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-id]");
  if (target) go(target.dataset.id);
});

el.reloadBtn.addEventListener("click", () => currentId && renderAlgo(currentId));

el.fullscreenBtn.addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else el.stage.requestFullscreen?.();
});

el.menuBtn.addEventListener("click", () =>
  setSidebar(!el.sidebar.classList.contains("is-open"))
);
el.scrim.addEventListener("click", () => setSidebar(false));

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;

  if (e.key === "Escape") return setSidebar(false);

  const n = Number(e.key);
  if (n >= 1 && n <= ALGOS.length) return go(ALGOS[n - 1].id);

  const key = e.key.toLowerCase();
  if (key === "r" && currentId) renderAlgo(currentId);
  if (key === "f" && currentId) el.fullscreenBtn.click();
  if (key === "h") location.hash = "#/";
});

window.addEventListener("hashchange", route);
window.addEventListener("resize", fitFrame);
document.addEventListener("fullscreenchange", fitFrame);

/* ------------------------------------------------------------------ */

buildNav();
route();
watchStageSize();
