function ApplStockPrice() {
  this.name = "Apple-Stock: 2021";

  this.id = "Apple-timeseries";

  this.title = "Apple-Stock: 2021";

  //title to display above the plot
  this.xAxisLabel = "Date";
  this.yAxisLabel = "$";

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 8,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      "data/apple-stock-price/AAPL-2021.csv",
      "csv",
      "header",
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function () {
    //Font defaults.
    textSize(16);
    textAlign("center", "center");

    //preload all the dates into an array for easier calculation
    this.datesArray = [];
    // for (var i = 0; i < this.data.getRowCount(); i++) {
    for (let i in this.data.getRowCount()) {
      this.datesArray.push(this.data.getString(i, "Date"));
    }

    //create object for each date in our data
    this.dailyObjectArray = createDayObjectArray(this.data);

    //initialise start and end dates
    this.startDate = 0;
    this.endDate = this.data.getRowCount() - 1;

    // Find min and max pirces for mapping to canvas height.
    this.minClosePrice = min(this.data.getColumn("Low"));
    this.maxClosePrice = max(this.data.getColumn("High"));

    this.frameCount = 0;

    //start date slider and position
    this.startSlider = createSlider(
      this.startDate,
      this.endDate - 30,
      this.startDate,
      10
    );

    this.startSlider.position(400, 10);

    //end date slider and position
    this.endSlider = createSlider(
      this.startDate + 30,
      this.endDate,
      this.endDate,
      10
    );

    this.endSlider.position(600, 10);

    this.canvasHeight = this.layout.bottomMargin - this.layout.topMargin;
  };

  this.destroy = function () {
    this.startSlider.remove();
    this.endSlider.remove();
  };

  this.draw = function () {
    //return if the data has not been loaded
    if (!this.loaded) {
      console.log("Data not yet loaded");
      return;
    }
    // Prevent slider ranges overlapping.
    if (this.startSlider.value() >= this.endSlider.value()) {
      this.startSlider.value(this.endSlider.value() - 30);
    }

    //fix start and end days to slider positions
    this.startDate = this.startSlider.value();
    this.endDate = this.endSlider.value();

    //start and end date strings that are used to find index position of data values for variable mean calculations
    let startDateString = this.data.getString(this.startDate, "Date");
    let endDateString = this.data.getString(this.endDate, "Date");

    //calculateMean is an object storing the dynamic mean, the start and end date indexes
    let calculateMean = this.calculateMean(startDateString, endDateString);
    let movingMean = calculateMean.mean.toFixed(5);
    let startDateIndex = calculateMean.startDateIndex;
    let endDateIndex = calculateMean.endDateIndex;
    let numDays = endDateIndex - startDateIndex;

    // Draw all y-axis tick labels.
    drawYAxisTickLabels(
      this.minClosePrice,
      this.maxClosePrice,
      this.layout,
      this.mapClosePriceToHeight.bind(this),
      1
    );

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    //plot mean close price line
    //this line is dynamically displays mean close price between start and end days
    this.drawMovingMeanLine(movingMean);

    // Plot all ClosePrices between startDate and endDate using the
    // width of the canvas minus margins.
    var previous;
    // Count the number of days plotted each frame to create
    // animation effect.
    var dayCount = 0;
    let box_Xpos = this.layout.leftMargin;
    let numBoxes = numDays;
    let boxWidth =
      (this.layout.rightMargin - this.layout.leftMargin) / numBoxes;

    //create object for each day
    // Loop over all rows but only plot those in range.
    for (var i = 0; i < this.data.getRowCount(); i++) {
      //load current day from day object array
      let current = this.dailyObjectArray[i];

      let currentDateInex = i;

      if (
        previous != null &&
        currentDateInex > this.startDate &&
        currentDateInex <= this.endDate
      ) {
        let previousDateIndex = i - 1;

        //new line based on index
        stroke(0);
        line(
          this.mapDayToWidth(previousDateIndex),
          this.mapClosePriceToHeight(previous.close),
          this.mapDayToWidth(currentDateInex),
          this.mapClosePriceToHeight(current.close)
        );

        //draw candlestick chart
        this.drawCandleStickChart(current, box_Xpos, boxWidth);
        box_Xpos += boxWidth;

        // Render crosshairs only if mouse is within graphs confines
        this.renderCrossHairs();

        // The number of x-axis labels to skip so that only
        // numXTickLabels are drawn.
        var xLabelSkip = ceil(numDays / this.layout.numXTickLabels);
        // Draw the tick label marking the start of the previous day.
        if (dayCount % xLabelSkip == 0) {
          //new x axis label based on index
          drawXAxisTickLabelDate(
            previousDateIndex,
            this.layout,
            this.mapDayToWidth.bind(this),
            this.dailyObjectArray[previousDateIndex].dateStr
          );
        }

        // When six or fewer days are displayed also draw the final
        // day x tick label.
        if (numDays <= 6 && dayCount == numDays - 1) {
          //new x axis label based on index
          drawXAxisTickLabelDate(
            currentDateInex,
            this.layout,
            this.mapDayToWidth.bind(this),
            this.dailyObjectArray[currentDateInex].dateStr
          );
        }
        dayCount++;
      }

      // Stop drawing this frame when the number of days drawn is

      // equal to the frame count. This creates the animated effect
      // over successive frames.
      if (dayCount >= this.frameCount) {
        break;
      }

      // Assign current day to previous day so that it is available
      // during the next iteration of this loop to give us the start
      // position of the next line segment.
      previous = current;
    }

    this.returnCurrentDayStatistics(startDateIndex, boxWidth, movingMean, endDateIndex);

    // Count the number of frames since this visualisation
    // started. This is used in creating the animation effect and to
    // stop the main p5 draw loop when all days have been drawn.
    this.frameCount++;
  };

  //this function shows the user statistics of the day based on mouse position
  this.returnCurrentDayStatistics = function (
    startDateIndex,
    boxWidth,
    movingMean,
    endDateIndex
  ) {
    //only return stats if mouse position is within graph confines
    if (
      mouseX >= this.layout.leftMargin &&
      mouseX <= this.layout.rightMargin &&
      mouseY >= this.layout.topMargin &&
      mouseY <= this.layout.bottomMargin
    ) {


      let currentDayIndex = Math.ceil(
        startDateIndex + (mouseX - this.layout.leftMargin) / boxWidth);

      //collect data from array of day objects
      let date = this.dailyObjectArray[currentDayIndex].dateStr;
      let open = this.dailyObjectArray[currentDayIndex].open;
      let close = this.dailyObjectArray[currentDayIndex].close;
      let high = this.dailyObjectArray[currentDayIndex].high;
      let low = this.dailyObjectArray[currentDayIndex].low;
      let volume = this.dailyObjectArray[currentDayIndex].volume;

      let Xreverser = 1;
      let Yreverser = 1;
      let Yshifter = 0;
      box_Width = 200;
      box_height = 250;

      //flip box horizontaly if text box exceeds right margin of graph
      if (mouseX + box_Width >= this.layout.rightMargin) {
        Xreverser = -1;
      }
      //flip box vertically if text box exceeds bottom margin of graph
      if (mouseY + box_height >= this.layout.bottomMargin) {
        Yreverser = -1;
        Yshifter = -box_height;
      }

      //draw box and text displaying details
      fill(0, 0, 0, 200);
      rect(mouseX, mouseY, Xreverser * box_Width, Yreverser * box_height);
      fill(255, 255, 255);
      text("Date: " + date, mouseX + Xreverser * 100, mouseY + 30 + Yshifter);
      text("Open: $" + Number(open).toFixed(2), mouseX + Xreverser * 100, mouseY + 60 + Yshifter);
      text("Close: $" + Number(close).toFixed(2), mouseX + Xreverser * 100, mouseY + 90 + Yshifter);
      text("High: $" + high.toFixed(2), mouseX + Xreverser * 100, mouseY + 120 + Yshifter);
      text("Low: $" + low.toFixed(2), mouseX + Xreverser * 100, mouseY + 150 + Yshifter);
      text("Period Mean: $" + Number(movingMean).toFixed(2), mouseX + Xreverser * 100, mouseY + 180 + Yshifter);
      text("Volume: " + (volume / 1000000).toFixed(2) + "M", mouseX + Xreverser * 100, mouseY + 210 + Yshifter);
      noStroke();

      textStyle(BOLD);
      if (close > open) {
        fill(0, 255, 0);
        text("Net Increase", mouseX + Xreverser * 100, mouseY + 235 + Yshifter);
      } else if (close <= open) {
        fill(238, 75, 43);
        text("Net Decrease", mouseX + Xreverser * 100, mouseY + 235 + Yshifter);
      }
      textStyle(NORMAL);
    }
  };

  this.mapClosePriceToHeight = function (value) {
    let mapVal = map(
      value,
      this.minClosePrice,
      this.maxClosePrice,
      this.layout.bottomMargin, // Lower close price at bottom.
      this.layout.topMargin
    );
    return mapVal;
  };

  this.mapDayToWidth = function (value) {
    return map(
      value,
      this.startDate,
      this.endDate,
      this.layout.leftMargin, // Draw left-to-right from margin.
      this.layout.rightMargin
    );
  };

  // variable mean calculation
  this.calculateMean = function (startDateString, endDateString) {

    // find index of start and end dates
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var comparisonDate = this.data.getString(i, "Date");
      if (comparisonDate == startDateString) {
        var startDateIndex = i;
      } else if (comparisonDate == endDateString) {
        var endDateIndex = i;
        break;
      }
    }
    // push values of close prices provided by date indexes into an array and calculate sum
    let sumOfVariablesArray = [];
    for (let i = startDateIndex; i <= endDateIndex; i++) {
      sumOfVariablesArray.push(this.data.getNum(i, "Close"));
    }
    let sumOfVariables = sum(sumOfVariablesArray);
    let mean = sumOfVariables / (endDateIndex - startDateIndex);
    return {
      mean: mean,
      startDateIndex: startDateIndex,
      endDateIndex: endDateIndex,
    };
  };

  // map the candlestick values to the y axis
  this.candlestickChartMaper = function (value) {
    return map(
      value,
      this.minClosePrice,
      this.maxClosePrice,
      this.canvasHeight,
      this.layout.topMargin
    );
  };

  //function for drawing candlestick charts
  this.drawCandleStickChart = function (current, box_Xpos, boxWidth) {
    //map current day values to y axis
    let mappedDayHigh = this.candlestickChartMaper(current.high);
    let mappedDayLow = this.candlestickChartMaper(current.low);
    let mappedOpen = this.candlestickChartMaper(current.open);
    let mappedClose = this.candlestickChartMaper(current.close);

    //day high day low line
    line(
      box_Xpos + boxWidth / 2,
      mappedDayHigh,
      box_Xpos + boxWidth / 2,
      mappedDayLow
    );

    //box is filled red if there is a decrease in close price and green if there is an increase
    if (current.open > current.close) {
      fill(255, 0, 0);
    } else {
      fill(0, 255, 0);
    }
    noStroke();
    rect(box_Xpos, mappedOpen, boxWidth, mappedClose - mappedOpen);
  };

  this.drawMovingMeanLine = function (movingMean) {
    stroke(color(0, 0, 255));
    strokeWeight(3);
    line(
      this.layout.leftMargin,
      this.mapClosePriceToHeight(movingMean),
      this.layout.rightMargin,
      this.mapClosePriceToHeight(movingMean)
    );
    strokeWeight(1);
  };

  //render crosshairs for user
  this.renderCrossHairs = function () {
    // only draw if mouse is within graph confines
    if (
      mouseX >= this.layout.leftMargin &&
      mouseX <= this.layout.rightMargin &&
      mouseY >= this.layout.topMargin &&
      mouseY <= this.layout.bottomMargin
    ) {
      stroke(160);
      //vertical line
      line(mouseX, this.layout.bottomMargin, mouseX, this.layout.topMargin);
      //horizontal line
      line(this.layout.leftMargin, mouseY, this.layout.rightMargin, mouseY);
      fill(0, 0, 0);
      ellipse(mouseX, mouseY, 10);
    }
  };
}

this.createDayObjectArray = function (data) {
  //this array stores all the day objects
  dailyData = [];

  //constructor function to create day object
  function Day(data, i) {
    this.index = i;
    this.dateStr = data.getString(i, "Date");
    this.open = data.getNum(i, "Open");
    this.close = data.getNum(i, "Close");
    this.high = data.getNum(i, "High");
    this.low = data.getNum(i, "Low");
    this.volume = data.getNum(i, "Volume");
  }

  //loop over all days and create an object for every day
  for (var i = 0; i < data.getRowCount(); i++) {
    // Create an object to store data for the current day
    let day = new Day(data, i);
    dailyData.push(day);
  }
  return dailyData;
};