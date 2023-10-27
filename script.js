const toggleActiveForNavLink = (currEleId) => {
  let currEle = document.getElementById(currEleId);
  currEle.classList.add("active");

  let navLinks = document.querySelectorAll("span.nav-link");
  for (let link of navLinks) {
    if (link.id != currEle.id) link.classList.remove("active");
  }
  navLinks = document.querySelectorAll("a.dropdown-item");
  for (let link of navLinks) {
    if (link.id != currEle.id) link.classList.remove("active");
  }
};

const sort = (algoNameToParse) => {
  console.log(algoNameToParse);
  toggleActiveForNavLink(algoNameToParse + "SortId");
  let algoName = document.getElementById("algoName");

  const capitalized =
    algoNameToParse.charAt(0).toUpperCase() + algoNameToParse.slice(1);
  algoName.innerText = capitalized + " Sort";
};
