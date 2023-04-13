function DayLightHours() {
  // Name for the visualisation to appear in the menu bar.
  this.name = "Hours of Day Light";

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = "Hours of-DayLight";

  const marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize,
    rightMargin: width,
    topMargin: 50,
    bottomMargin: height - marginSize,
    LegendBoxWidth: 250,
    LegendBoxHeight: 100,
    textMargin: marginSize * 2 + 50,
    pad: 5,

    // functions to plot width and height of chart
    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data This function is called automatically by the
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      "data/daylight-hours/daylightCleaned.csv",
      "csv",
      "header",
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      }
    );

    //preload earth svg image
    this.earthImg = loadImage("images/3d-Earth-Globe.svg");
  };

  this.setup = function () {
    // Font defaults.
    textSize(16);
    this.dateSlider = createSlider(1, 365, 0, 1);
    this.dateSlider.position(this.layout.leftMargin + 380, 150);

    //create buttons using button.js
    minusButton = new PlusMinuButton(110, 175, 35, 30, false, "-");
    playButton = new PlayPauseButton(160, 175, 60, 30, false);
    plusButton = new PlusMinuButton(235, 175, 35, 30, false, "+");

    raySource = new Source(width / 2, height / 2, 360);
    this.drawCounter = 0;
  };

  this.destroy = function () {
    this.dateSlider.remove();
    buttonArray.length = 0;
  };

  //draw loop
  this.draw = function () {
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }

    //initialise variables for placement of visulaization objects on canvas
    const canvasMiddleX = width / 2;
    const canvasMiddleY = height / 2;

    //black background
    fill(0, 0, 0);
    rect(
      this.layout.leftMargin,
      this.layout.topMargin,
      this.layout.plotWidth(),
      this.layout.plotHeight()
    );

    //draw all buttons
    playButton.drawPlayPause();
    plusButton.drawPlusMinus();
    minusButton.drawPlusMinus();

    //pass either true or false into these variables depending
    //on toggle
    isLooping = playButton.isToggleEnabled();
    plus = plusButton.isToggleEnabled();
    minus = minusButton.isToggleEnabled();

    //initialise dayNum to be slider value
    let dayNum = this.dateSlider.value();

    //increase dayNum every 5th draw loop
    if (isLooping) {
      if (this.drawCounter == 5) {
        dayNum += 1;

        this.drawCounter = 0;
      }

      this.drawCounter += 1;
    }

    ////This code prevents day num from going above 365 or below 1////////
    if (dayNum > 365) {
      dayNum = 1;
    } else if (dayNum < 1) {
      dayNum = 365;
    }

    if (plus == true) {
      plusButton.tog = false;

      if (dayNum != 365) {
        dayNum += 1;
      } else {
        dayNum = 1;
      }
    }

    if (minus == true) {
      minusButton.tog = false;
      if (dayNum > 1) {
        dayNum -= 1;
      } else {
        dayNum = 365;
      }
    }

    //apply changes to daynum to dateSlider
    this.dateSlider.value(dayNum);

    //store the hours of daylight into an array based on day selected by slider
    let hoursColumn = this.data.getColumn(dayNum);

    //initialise diameter for the rings and earth
    const daim_12hrRing = 300;
    const diam_24hrRing = 400;
    const diamEarth = 200;

    //create a vector storing mouse position
    let mouseVector = createVector(
      mouseX - canvasMiddleX,
      mouseY - canvasMiddleY
    );

    //get angle of rotation from center of canvas to mouse position
    let myHeading = mouseVector.heading();

    //prevent angle from exceeding 90 or going below -90 as there are only 180 lines of latitude
    noStroke();
    fill(255, 255, 255);
    let angle = -1 * degrees(myHeading).toFixed(0);

    //fix angle so that it never exceeds 90 or drops below -90
    if (angle > 90) {
      let diff = angle - 90;
      angle = 90 - diff;
    } else if (angle < -90) {
      diff = -1 * (angle + 90);
      angle = -90 + diff;
    }
    // reset text size
    textSize(16);

    //confines of imaginary rectangle to center text on the left of canvas
    let rectWidth = 800;

    //get the index of the latitude ray based on users mouse angle from the earths center
    index = mouseOverRay(rectWidth, angle);

    //write the seasons on canvas based on day of the year for both hemispheres
    northenHemisphereSeasons(dayNum);
    southernHemisphereSeasons(dayNum);

    //update length of rays based on amount of hours in a day
    raySource.update_length(hoursColumn);

    //draw rays
    raySource.drawHourRays(index);

    //12r ring
    strokeWeight(4);
    noFill();
    stroke(0, 0, 255);
    ellipse(canvasMiddleX, canvasMiddleY, daim_12hrRing, daim_12hrRing);
    fill(255, 255, 255);
    noStroke();

    //24hr ring
    noFill();
    stroke(255, 0, 0);
    ellipse(canvasMiddleX, canvasMiddleY, diam_24hrRing, diam_24hrRing);
    fill(255, 255, 255);
    noStroke();

    //ring labels
    textAlign(CENTER);
    text(
      "24 Hours of daylight",
      canvasMiddleX,
      canvasMiddleY - diam_24hrRing / 2 - 15
    );
    text(
      "12 Hours of daylight",
      canvasMiddleX,
      canvasMiddleY - daim_12hrRing / 2 - 15
    );

    //earth
    image(
      this.earthImg,
      canvasMiddleX - diamEarth / 2,
      canvasMiddleY - diamEarth / 2,
      diamEarth,
      diamEarth
    );

    //draw equator line
    stroke(255, 255, 255, 200);
    strokeWeight(1);
    line(
      canvasMiddleX - diamEarth / 2,
      canvasMiddleY,
      canvasMiddleX + diamEarth / 2,
      canvasMiddleY
    );

    //loop through all the hours in hours column and check if the users mouse is over latitude ray
    function mouseOverRay(rectWidth, angle) {
      let rayAngle = -90;
      for (i in hoursColumn) {
        let hours = hoursColumn[i];

        let displayAngle = angle;

        //add N if mouse is above equator and S if below
        if (angle == 0) {
          unit = "°";
        } else if (mouseY < canvasMiddleY) {
          unit = "° N";
        } else if (mouseY > canvasMiddleY) {
          unit = "° S";
          //prevent latitude from being a negative number
          displayAngle *= -1;
        }

        //return corresponding ray index
        if (rayAngle == angle) {
          fill(255, 255, 255);
          textAlign(CENTER, CENTER);
          text(
            "Daylight hrs: " + Math.floor(hours),
            canvasMiddleX + rectWidth / 2,
            canvasMiddleY
          );
          text(
            "Latitude: " + displayAngle + unit,
            canvasMiddleX + rectWidth / 2,
            canvasMiddleY + 30
          );
          return i;
        }

        rayAngle++;
      }
    }


    //display seasons in the norhtern hemisphere
    function northenHemisphereSeasons(dayNum) {
      let season;

      //seasons start and end dates are constant throuhout the year
      //hence we hardcode these values
      if (dayNum >= 80 && dayNum < 172) {
        season = "Spring";
      } else if (dayNum >= 172 && dayNum <= 266) {
        season = "Summer";
      } else if (dayNum >= 267 && dayNum <= 356) {
        season = "Autumn";
      } else {
        season = "Winter";
      }

      textAlign(CENTER, CENTER);
      text(
        "Northen-Hemisphere",
        canvasMiddleX + rectWidth / 2,
        canvasMiddleY - 175
      );
      text(
        "Season: " + season,
        canvasMiddleX + rectWidth / 2,
        canvasMiddleY - 145
      );
    }
    //display seasons in the southern hemisphere
    function southernHemisphereSeasons(dayNum) {
      let season;

      if (dayNum >= 244 && dayNum <= 344) {
        season = "Spring";
      } else if (dayNum >= 335 || dayNum <= 59) {
        season = "Summer";
      } else if (dayNum >= 60 && dayNum <= 151) {
        season = "Autum";
      } else {
        season = "Winter";
      }

      textAlign(CENTER, CENTER);
      text(
        "Southern-Hemisphere",
        canvasMiddleX + rectWidth / 2,
        canvasMiddleY + 145
      );
      text(
        "Season: " + season,
        canvasMiddleX + rectWidth / 2,
        canvasMiddleY + 175
      );
    }



    //convert numerical dayNum to date in string format
    Date.prototype.toShortFormat = function () {
      let monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      let day = this.getDate();

      let monthIndex = this.getMonth();
      let monthName = monthNames[monthIndex];

      return `${day} ${monthName}`;
    };

    // set day value to be printed
    let initialDate = new Date(2021, 0);
    let date = new Date(initialDate.setDate(dayNum));
    date = date.toShortFormat();

    //display date
    noStroke();
    fill(255, 255, 255);
    noStroke();
    textSize(15);

    text("Date:", this.layout.textMargin, this.layout.topMargin + 30);
    text("Day: ", this.layout.textMargin, this.layout.topMargin + 60);

    text(date, this.layout.textMargin + 60, this.layout.topMargin + 30);
    text(dayNum, this.layout.textMargin + 40, this.layout.topMargin + 60);
  }; //end of draw
}
