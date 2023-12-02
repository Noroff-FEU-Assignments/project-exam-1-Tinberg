// ---------- About me section img slider ----------//

// ----------  For Index.html and about.html ----------//
document.addEventListener("DOMContentLoaded", function () {
  let slider = document.querySelector("#aboutSlider");
  if (!slider) {
    console.error("Slider not found!");
    return;
  }

  let figures = slider.querySelectorAll("figure");
  if (!figures.length) {
    console.error("Figures not found!");
    return;
  }

  let currentFigureIndex = 0;
  figures[currentFigureIndex].classList.add("active");

  setInterval(function () {
    figures[currentFigureIndex].classList.remove("active");
    currentFigureIndex = (currentFigureIndex + 1) % figures.length;
    figures[currentFigureIndex].classList.add("active");
  }, 4000);
});
