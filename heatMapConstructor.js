class HeatMap {
  //define x y positon box dimension and colors for tiers
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.boxDImension = 20;
    this.tierColors = ["white", "yellow", "coral", "darkorange", "orangered", "red", "brown", "darkred", "black"];
  }


  //this function draws the legend box for the type of heat map selected
  drawHeatMapLegend() {

    let xpos = this.x;
    let ypos = this.y;

    //loop through all colors and draw them on canvas
    for (let i in this.tierColors) {
      fill(this.tierColors[i]);
      stroke(0);
      rect(xpos, ypos, this.boxDImension, this.boxDImension);
      noStroke();
      ypos += this.boxDImension;
    }

    xpos = this.x;
    ypos = this.y;

    //write respective text next to tier boxes
    textSize(this.textSize);
    for (let i in this.TiersHeaders) {
      stroke(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      fill(0);
      text(this.TiersHeaders[i], xpos + this.boxDImension + 55, ypos + this.boxDImension / 2);
      ypos += this.boxDImension;
    }
    textSize(16);
  }



  //determine fill color for countries based on the values specifed by the tier bounds array
  heatMapFill(d) {

    if (this.TierBounds[0][0] >= 0 && d <= this.TierBounds[0][1]) {
      return this.tierColors[0];
    } else if (this.TierBounds[1][0] >= 0 && d <= this.TierBounds[1][1]) {
      return this.tierColors[1];
    } else if (this.TierBounds[2][0] >= 0 && d <= this.TierBounds[2][1]) {
      return this.tierColors[2];
    } else if (this.TierBounds[3][0] >= 0 && d <= this.TierBounds[3][1]) {
      return this.tierColors[3];
    } else if (this.TierBounds[4][0] >= 0 && d <= this.TierBounds[4][1]) {
      return this.tierColors[4];
    } else if (this.TierBounds[5][0] >= 0 && d <= this.TierBounds[5][1]) {
      return this.tierColors[5];
    } else if (this.TierBounds[6][0] >= 0 && d <= this.TierBounds[6][1]) {
      return this.tierColors[6];
    } else if (this.TierBounds[7][0] >= 0 && d <= this.TierBounds[7][1]) {
      return this.tierColors[7];
    } else {
      return this.tierColors[8];
    }


  }



}


//populaion density class of heat map
class DensityHeatMap extends HeatMap {
  constructor(x, y) {
    super(x, y);
    this.x = x;
    this.y = y;
    this.textSize = 12;
    this.title = "Density Heat Map";

    //headers for each tier of populaion density
    this.TiersHeaders = ["0-4 P/km²", "5-9 P/km²", "10-29 P/km²", "30-74 P/km²", "75-99 P/km²", "100-199 P/km²", "200-299 P/km²", "300-449 P/km²", "≥ 450 P/km²"];

    //Each nested array stores the lower and upper bounds for the heatmap tier calculations, using these values the fill color of the countries will de decided
    this.TierBounds = [
      [0, 4],
      [5, 9],
      [10, 29],
      [30, 74],
      [75, 99],
      [100, 199],
      [200, 299],
      [300, 449],
      [450]
    ];
  }

}

//per capita class of heat map
class PerCapitaHeatMap extends HeatMap {
  constructor(x, y) {
    super(x, y);
    this.x = x;
    this.y = y;
    this.textSize = 12;
    this.title = "Per-Capita Income Heat Map";

    //headers for each tier of per-capita income
    this.TiersHeaders = [
      "$0-$999",
      "$1000-$1999",
      "$2000-$3999",
      "$4000-$8999",
      "$9000-$139999",
      "$14000-$23999",
      "$24000-$39999",
      "$40000-$49999",
      "≥ $50000"
    ];

    //Each nested array stores the lower and upper bounds for the heatmap tier calculations, using these values the fill color of the countries will de decided
    this.TierBounds = [
      [0, 999],
      [1000, 1999],
      [2000, 3999],
      [4000, 8999],
      [9000, 13999],
      [14000, 23999],
      [24000, 39999],
      [40000, 49999],
      [450]
    ];
  }

}

//popualtion calss of heatmap
class PopHeatMap extends HeatMap {
  constructor(x, y) {
    super(x, y);
    this.x = x;
    this.y = y;
    this.textSize = 11,
      this.title = "Population Heat Map";

    //headers for each tier of country populaion 
    this.TiersHeaders = [
      "0-100K People",
      "100K -1 M People",
      "1-14.9 M People",
      "15-29.9 M People",
      "30-49.9 M People",
      "50-99.9 M People",
      "100-299.9 M People",
      "300-500 M People",
      "≥ 1 B People"
    ];

    //Each nested array stores the lower and upper bounds for the heatmap tier calculations, using these values the fill color of the countries will de decided
    this.TierBounds = [
      [0, 100000 - 1],
      [100000, 1000000 - 1],
      [1000000, 15000000 - 1],
      [15000000, 30000000 - 1],
      [30000000, 50000000 - 1],
      [50000000, 100000000 - 1],
      [100000000, 300000000 - 1],
      [300000000, 500000000],
      [1000000000]
    ];
  }


}