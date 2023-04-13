// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
  // Create a canvas to fill the content div from index.html.
  canvasContainer = select("#app");
  var c = createCanvas(1024, 576);
  c.parent("app");

  // Create a new gallery object.
  gallery = new Gallery();
  gallery.addVisual(new ApplStockPrice());
  gallery.addVisual(new PopulationPyramid());
  gallery.addVisual(new DayLightHours());
  gallery.addVisual(new PopulationHeatMap());
}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}