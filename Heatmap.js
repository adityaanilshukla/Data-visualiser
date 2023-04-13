function PopulationHeatMap() {
  // Name for the visualisation to appear in the menu bar.
  this.name = "Heat Map";

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = "heatMap";

  /////////////THIS CODE CREATES WORLD MAP ON CANVAS/////////////////

  //const that determines size of world map to be drawn on canvas
  const size = 0.5;

  //in the country polygons array is where the indiviual polygons for every country is stored
  let countryPolygons = [];


  //this function takes vertex points and convers them into polygons
  function convertPathToPolygons(path) {
    let coord_point = [0, 0];
    let polygons = [];
    let currentPolygon = [];

    //For loop to calculate vertex points
    for (const node of path) {
      if (node[0] == "m") {
        coord_point[0] += node[1] * size;
        coord_point[1] += node[2] * size;
        currentPolygon = [];
      } else if (node[0] == "M") {
        coord_point[0] = node[1] * size;
        coord_point[1] = node[2] * size;
        currentPolygon = [];
      } else if (node == "z") {
        currentPolygon.push([...coord_point]);
        polygons.push(currentPolygon);
      } else {
        currentPolygon.push([...coord_point]);
        coord_point[0] += node[0] * size;
        coord_point[1] += node[1] * size;
      }
    }

    return polygons;
  }

  const marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize,
    rightMargin: width,
    topMargin: 0,
    bottomMargin: height - marginSize,
    LegendBoxWidth: 200,
    LegendBoxHeight: 250,
    pad: 5,

    // functions to plot width and height of chart
    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },
  };

  // Middle of the plot: for middle line.
  this.midX = this.layout.plotWidth() / 2 + this.layout.leftMargin;

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data This function is called automatically by the
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      "data/Population/population-by-country.csv",
      "csv",
      "header",
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      }
    );
  };

  function generateCountryObject(country, population, density, PPP) {
    return {
      country: country,
      population: population,
      density: density,
      PPP: PPP,
    };
  }

  this.setup = function () {

    // Font defaults.
    textSize(16);
    for (let i = 0; i < country.length; i++) {
      countryPolygons.push(convertPathToPolygons(country[i].vertexPoint));
    }


    //create all heat map objects
    popHeatMap = new PopHeatMap(
      this.layout.rightMargin - 130,
      this.layout.topMargin + 30
    );

    densityHeatMap = new DensityHeatMap(
      this.layout.rightMargin - 130,
      this.layout.topMargin + 30
    );

    perCapitaHeatMap = new PerCapitaHeatMap(
      this.layout.rightMargin - 130,
      this.layout.topMargin + 30
    );

    //create all heat map buttons
    //these buttons will determine the type of heat map drawn on canvas
    densityButton = new HeatMapButton(
      this.layout.leftMargin + 15,
      this.layout.bottomMargin - 45,
      150,
      30,
      true,
      "Population Density"
    );


    populationButton = new HeatMapButton(
      this.layout.leftMargin + 15 + 150 + 15,
      this.layout.bottomMargin - 45,
      150,
      30,
      false,
      "Population"
    );

    perCapitaButton = new HeatMapButton(
      this.layout.leftMargin + 15 + 300 + 30,
      this.layout.bottomMargin - 45,
      150,
      30,
      false,
      "Per-Capita Income"
    );

    //fetch the columns representing country names populations and per-capita income
    let countryNameArray = this.data.getColumn("Country");
    let countryPopulationArray = this.data.getColumn("Population");
    let countryDensityArray = this.data.getColumn("Density");
    let perCapitaArray = this.data.getColumn("PPP");

    //this arrays stores the object for each country
    this.countryObjectArray = [];

    //loop over the length of all countrys and generate an object for each country
    //push these objects into countryobject array
    for (let i in countryNameArray) {
      this.countryObjectArray.push(
        generateCountryObject(
          countryNameArray[i],
          countryPopulationArray[i],
          countryDensityArray[i],
          perCapitaArray[i]
        )
      );
    }
  };

  //loop over all country objects and return the object for the requested country
  this.getCountryObject = function (countryName) {
    for (let i in this.countryObjectArray) {
      if (countryName == this.countryObjectArray[i].country) {
        return this.countryObjectArray[i];
      }
    }
  };

  this.destroy = function () {
    //reset lengths of arrays
    countryPolygons.length = 0;
    buttonArray.length = 0;
  };


  ///code for determining if users mouse is over a country///////
  function detectCollision(polygon, x, y) {
    let c = false;
    // for each edge of the polygon
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      // Compute the slope of the edge
      let slope =
        (polygon[j][1] - polygon[i][1]) / (polygon[j][0] - polygon[i][0]);

      // If the mouse is positioned within the vertical bounds of the edge
      if (
        polygon[i][1] > y != polygon[j][1] > y &&
        // And it is far enough to the right that a horizontal line from the
        // left edge of the screen to the mouse would cross the edge
        x > (y - polygon[i][1]) / slope + polygon[i][0]
      ) {
        // Flip the flag
        c = !c;
      }
    }

    return c;
  }



  //determine which heat map legend to draw based on user selection
  this.selectedHeatMap = function () {
    if (densityButton.tog == true) {
      return densityHeatMap;
    } else if (perCapitaButton.tog == true) {
      return perCapitaHeatMap;
    } else if (populationButton.tog == true) {
      return popHeatMap;
    }
  }


  ////////////DRAWING CODE//////////////////////

  //function to draw chart title
  this.title = function () {
    //if statement to center title based on user selection
    strokeWeight(0);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    let titleXPos = this.midX;
    let title = this.selectedHeatMap().title;

    fill(255);
    text(title, titleXPos, this.layout.topMargin + 20);
    textStyle(NORMAL);
  };


  //draw loop
  this.draw = function () {

    //re set country name on every draw loop
    let countryName;


    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    //grey background
    //we do not use background function here as it ignores layout margins
    fill(0, 0, 0, 100);
    rect(
      this.layout.leftMargin,
      this.layout.topMargin,
      this.layout.plotWidth(),
      this.layout.plotHeight()
    );

    stroke(0);
    strokeWeight(1);
    let collision = false;
    for (let i = 0; i < countryPolygons.length; i++) {


      //get country object storing population density and per capita
      let cntry = this.getCountryObject(country[i].name);


      //check which heat map selection the user has decided
      //fill country colors based on this selection
      if (densityButton.tog) {
        fill(densityHeatMap.heatMapFill(cntry.density));
      } else if (perCapitaButton.tog) {
        fill(perCapitaHeatMap.heatMapFill(cntry.PPP));
      } else if (populationButton.tog) {
        fill(popHeatMap.heatMapFill(cntry.population));
      }


      //check if users mouse is over a country
      if (!collision) {
        collision = countryPolygons[i].some((poly) =>
          detectCollision(poly, mouseX, mouseY)
        );

        //fill country purple if users mouse is over it
        if (collision) {
          fill("purple");
          countryName = country[i].name;
        }
      }

      //loop over country polygons and draw country shape
      for (const poly of countryPolygons[i]) {
        beginShape();
        for (const vert of poly) {
          vertex(...vert);
        }
        endShape();
      }
    }

    //display country name or prompt user to select a country
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    if (countryName === undefined) {
      text(
        "Hover Over A Country",
        this.layout.leftMargin + this.layout.LegendBoxWidth / 2,
        this.layout.bottomMargin - this.layout.LegendBoxHeight / 2
      );
    } else {


      //display information about user selected country
      let Ystep = 30;
      text(
        countryName,
        this.layout.leftMargin + this.layout.LegendBoxWidth / 2,
        this.layout.bottomMargin - this.layout.LegendBoxHeight + Ystep
      );

      countryObject = this.getCountryObject(countryName);
      text(
        "Pop: " + (countryObject.population / 1000000).toFixed(2) + "M",
        this.layout.leftMargin + this.layout.LegendBoxWidth / 2,
        this.layout.bottomMargin - this.layout.LegendBoxHeight + Ystep * 2
      );

      text(
        "Density: " + countryObject.density + " P/km²",
        this.layout.leftMargin + this.layout.LegendBoxWidth / 2,
        this.layout.bottomMargin - this.layout.LegendBoxHeight + Ystep * 3
      );

      text(
        "Per capita $: " + Number(countryObject.PPP).toFixed(2),
        this.layout.leftMargin + this.layout.LegendBoxWidth / 2,
        this.layout.bottomMargin - this.layout.LegendBoxHeight + 125
      );
    }

    //reset text font and format
    textStyle(NORMAL);
    stroke(0);
    strokeWeight(1);


    // determine which heat map legend to draw based on user selection
    this.selectedHeatMap().drawHeatMapLegend();


    //draw chart title
    this.title();

    //draw the select buttons for this visualisation
    densityButton.drawSelectButton();
    populationButton.drawSelectButton();
    perCapitaButton.drawSelectButton();
  };
} //end of draw