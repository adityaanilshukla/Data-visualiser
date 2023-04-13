function PopulationPyramid() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Population Pyramid';

    //id of visualisation
    this.id = 'population-pyramid';

    //title to display above the plot
    this.xAxisLabel = "%";
    this.yAxisLabel = "Age";


    let marginSize = 35;

    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        // Locations of margin positions. Left and bottom have double margin
        // size due to axis and tick labels.
        leftMargin: marginSize * 2,
        rightMargin: width,
        topMargin: 50,
        bottomMargin: height - 20,
        LegendBoxWidth: 275,
        LegendBoxHeight: 100,
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
    this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;


    // Default visualisation colours for male and female population
    this.femaleColour = color(255, 0, 0);
    this.maleColour = color(0, 0, 139);

    this.femaleColorC2 = color(255, 192, 203, 200);
    this.maleColorC2 = color(135, 206, 235, 240);


    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data This function is called automatically by the
    // gallery when a visualisation is added
    this.preload = function () {
        var self = this;
        this.data = loadTable(
            "data/population-pyramid/combined-population-data.csv", "csv", "header",
            // Callback function to set the value
            function (table) {
                self.loaded = true;
            }
        );

    };


    this.setup = function () {
        // Font defaults.
        textSize(16);

        XaxisPercentages = ["", "8%", "6%", "4%", "2%", "0%", "2%", "4%", "6%", "8%", ""];

        //all csv's have the same row count. so we precalculate row count for whole data set
        rowCount = this.data.getRowCount();

        //rectangle height for drawing
        ageRectHeight = (this.layout.bottomMargin - this.layout.topMargin) / rowCount;


        //add all country names into an array for the user to select
        //country names are added from the headers of columns in the csv
        let countryNameArray = []
        let removedHeader;
        let countries = this.data.columns;
        for (var i = 0; i < countries.length; i++) {
            //store all non empty country names as values
            //remove non relevent headers such as Age
            if (countries[i] != "" && countries[i] != "Age") {

                //remove M and F from headers such that we only include the country names in the array
                if (countries[i].includes(" M")) {
                    removedHeader = countries[i].replace(' M', '');
                } else if (countries[i].includes(" F")) {
                    removedHeader = countries[i].replace(' F', '');
                }

                //only push to array if country name is not in the array
                if (countryNameArray.indexOf(removedHeader) === -1) {
                    countryNameArray.push(removedHeader);
                }

            }
        }


        //loop over all values in countryname array and add them to createSelect
        this.selectedCountry1 = createSelect();
        this.selectedCountry1.position(390, this.layout.topMargin + 30);
        for (i in countryNameArray) {
            this.selectedCountry1.option(countryNameArray[i]);
        }
        this.selectedCountry1.selected('Japan');

        //add a null value to array for second createSelect
        countryNameArray.unshift(" - ");
        this.selectedCountry2 = createSelect();
        this.selectedCountry2.position(390, this.layout.topMargin + 60);
        for (i in countryNameArray) {
            this.selectedCountry2.option(countryNameArray[i]);
        }
        this.selectedCountry2.selected('The World');



        //initialise variables to be used in draw loop
        //country 1 variables
        let selectedCountry1;
        let country1AgeArrayMale;
        let country1AgeArrayFemale;
        let country1Pop;
        let country1DataArray;

        //country2 variables
        let selectedCountry2;
        let country2AgeArrayMale;
        let country2AgeArrayFemale;
        let country2Pop;
        let country2DataArray;

        //variables used to check if change has occured in user selected country
        //used to prevent the countryDataArray being called every draw loop
        let detectChange_country1;
        let detectChange_country2;

    };

    this.destroy = function () {
        this.selectedCountry1.remove();
        this.selectedCountry2.remove();
    };


    //draw loop
    this.draw = function () {

        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        //pass country selected by user into variables
        selectedCountry1 = this.selectedCountry1.value();
        selectedCountry2 = this.selectedCountry2.value();

        //only run if a change in selected countries has occured
        //this prevents function being called on every draw loop
        if (changeDetected()) {

            //calculate total population for both countries
            country1AgeArrayMale = this.data.getColumn(selectedCountry1 + " M");
            country1AgeArrayFemale = this.data.getColumn(selectedCountry1 + " F");
            country1Pop = sum(country1AgeArrayMale) + sum(country1AgeArrayFemale);

            //only load data if the selected countries are different
            if (this.selectedCountriesAreDifferent()) {
                country2AgeArrayMale = this.data.getColumn(selectedCountry2 + " M");
                country2AgeArrayFemale = this.data.getColumn(selectedCountry2 + " F");
                country2Pop = sum(country2AgeArrayMale) + sum(country2AgeArrayFemale);
            }


            //load user selected country name and population statistics into an array of objects based on drop down menu value
            country1DataArray = this.generateCountryDataArray(selectedCountry1);

            //only load data if the second country selected is not null
            if (this.selectedCountriesAreDifferent()) {
                country2DataArray = this.generateCountryDataArray(selectedCountry2);
            }
        }



        //graph title using user selected countries
        this.drawChartTitle();

        // Draw x and y axis.
        drawAxis(this.layout);
        fill(0);
        let step = Math.floor((this.layout.rightMargin - this.layout.leftMargin) / 10 +1);
        strokeWeight(0);
        textAlign();
        for (i in XaxisPercentages) {
            let s = XaxisPercentages[i];
            text(s, this.layout.leftMargin + i * step, 560);
        }

        // Draw Female/Male labels at the top of the plot.
        this.drawCategoryLabels();

        //draw y axis labels
        this.drawAgeGroupAxis(country1DataArray);



        //draw data for country 1 and 2 respectively
        this.drawCountryPyramid(country1DataArray, this.maleColour, this.femaleColour, country1Pop);

        //only draw second pyramid if the selected countries are different
        if (this.selectedCountriesAreDifferent()) {
            this.drawCountryPyramid(country2DataArray, this.maleColorC2, this.femaleColorC2, country2Pop);
            //draw country 1 with stoke border and fill done to highlight areas of overlap between the pyramids
            this.drawCountryPyramidHollow(country1DataArray, country1Pop);
        }



        // Draw middle line
        stroke(150);
        strokeWeight(1);
        line(this.midX, this.layout.topMargin, this.midX, this.layout.bottomMargin);

        // returns age group data based on user mouse position on chart
        this.drawInformationBox(selectedCountry1, selectedCountry2, country1DataArray, country2DataArray, country1Pop, country2Pop);

        //render cross hairs
        this.renderCrossHairs();

        this.drawLengendBox(selectedCountry1, selectedCountry2);


        this.drawStatisticsBox(selectedCountry1, country1Pop, selectedCountry2, country2Pop);


        //pass selected country values to these variables
        //these variables are compared to selected country at the top draw loop to determine if a change has occured
        detectChange_country1 = selectedCountry1;
        detectChange_country2 = selectedCountry2;

    }; //end of draw loop



    ///////DRAWING CODE////////

    //Function to draw country pyramid
    this.drawCountryPyramid = function (countryData, maleColour, femaleColour, countryPopulation) {
        for (let i = 0; i < rowCount; i++) {

            // shift y position for each rectangle down by one rectangle width as the program runs
            let ageYPos = (ageRectHeight * i) + this.layout.topMargin;

            // Draw the ageGroup name
            let ageGroup = countryData[i];

            //female and male population of current ageGroup as a percent of the total
            let femalePercentage = this.percentage(ageGroup.female, countryPopulation);
            let malePercentage = this.percentage(ageGroup.male, countryPopulation);


            //female and male rectangle widths to be plotted along the x-axis
            let femaleRectangleWidth = this.mapPercentToWidth(femalePercentage);
            let maleRectangelWidth = this.mapPercentToWidth(malePercentage);

            //draw rectangles displaying ages
            fill(femaleColour);
            rect(this.midX - femaleRectangleWidth, ageYPos, femaleRectangleWidth, ageRectHeight - this.layout.pad);

            fill(maleColour);
            rect(this.midX, ageYPos, maleRectangelWidth, ageRectHeight - this.layout.pad);

        }

    }


    //draw country 1 with stoke border and fill to highlight areas of overlap between the pyramids
    this.drawCountryPyramidHollow = function (countryData, countryPopulation) {
        for (let i = 0; i < rowCount; i++) {

            // Calculate the y position for each ageGroup.
            let ageYPos = (ageRectHeight * i) + this.layout.topMargin;

            // Draw the ageGroup names for y axis
            let ageGroup = countryData[i];
            //female and male population of current ageGroup as a percent of the total
            let femalePercentage = this.percentage(ageGroup.female, countryPopulation);
            let malePercentage = this.percentage(ageGroup.male, countryPopulation);

            //female and male rectangle widths to be plotted along the x-axis
            let femaleRectangleWidth = this.mapPercentToWidth(femalePercentage);
            let maleRectangelWidth = this.mapPercentToWidth(malePercentage);

            //draw rectangles displaying ages
            //female rectangle
            stroke(this.femaleColour);
            strokeWeight(2);
            noFill();
            rect(this.midX - femaleRectangleWidth, ageYPos, femaleRectangleWidth, ageRectHeight - this.layout.pad);
            //male rect
            stroke(this.maleColour);
            rect(this.midX, ageYPos, maleRectangelWidth, ageRectHeight - this.layout.pad);

        }
    }


    // draw box displaying information when user hovers on chart
    this.drawInformationBox = function (country1Name, country2Name, country1Data, country2Data,
        country1Population, country2Population) {
        //only return stats if mouse position is within graph confines
        if (this.MouseOnChart()) {

            //calculate the ageGroupIndex by calculating how many rectangle heights down the chart the users mouse is
            let ageGroupIndex = Math.round((mouseY - this.layout.topMargin) / ageRectHeight);

            //prevents the program from trying to get data from index beyond array spaces
            if (ageGroupIndex >= rowCount) {
                return;
            }

            //define age group to be displayed by function
            let country1Box = country1Data[ageGroupIndex];

            //country2 is only defined if the user has not selected a blank value
            if (country2Name !== " - ") {
                country2Box = country2Data[ageGroupIndex];
            }

            //draw statistics box
            fill(0, 0, 0, 180);
            let boxWidth = 350;
            let boxHeight = 160;
            let Yreverser = 1;
            let Yshifter = 0;

            //flip box and text vertically if box exceeds bottom margin
            if ((mouseY + boxHeight) >= this.layout.bottomMargin) {
                Yreverser = -1;
                Yshifter = -boxHeight;
            }
            //draw box
            rect(mouseX, mouseY, boxWidth, boxHeight * Yreverser);
            fill(255, 255, 255);
            textStyle(BOLD);
            //loop over data headers and draw them in box
            text("Age-Group: " + country1Box.age, mouseX + 250, mouseY + 20 + Yshifter);
            textStyle(NORMAL);
            let dataHeaders = ["Male-pop:", "Female-pop:", "Group-Pop: ", "Total-Pop: "];
            let Ystep = 20;
            for (let i in dataHeaders) {
                text(dataHeaders[i], mouseX + 100, mouseY + 65 + i * Ystep + Yshifter);
            }

            //function to display text
            function dataText(countryName, countryBox, countryPop, step, Yshifter) {
                //draw country name in box
                text(countryName, mouseX + step, mouseY + 45 + Yshifter);

                //object that will store simplified number and unit after division
                let cleanedData;

                //loop over data to be displayed and draw it in box
                //data cleaner simplifies data so that it is easier for user to read
                let dataToBeDisplayed = [countryBox.male, countryBox.female, countryBox.male + countryBox.female, countryPop];
                let Ystep = 20;
                for (i in dataToBeDisplayed) {
                    cleanedData = dataCleaner(dataToBeDisplayed[i]);
                    text(cleanedData.simplifiedNum + cleanedData.unit, mouseX + step, mouseY + 65 + i * Ystep + Yshifter);
                }
            }

            let step = 200;
            dataText(country1Name, country1Box, country1Population, step, Yshifter);

            //only display second country data if the selected countries are different
            if (country2Name == " - ") {
                return
            } else if (country1Name !== country2Name) {
                step += 100;
                dataText(country2Name, country2Box, country2Population, step, Yshifter);
            }
        }
    }

    //legend box to help user associate male and female population by country
    this.drawLengendBox = function (country1Name, country2Name) {
        fill(0, 0, 0, 150);
        noStroke();
        rect(this.layout.leftMargin, this.layout.topMargin, this.layout.LegendBoxWidth, this.layout.LegendBoxHeight);
        textSize(12);
        fill(255, 255, 255);
        text("Female", this.layout.leftMargin + 160, this.layout.topMargin + 10);
        text("Male", this.layout.leftMargin + 230, this.layout.topMargin + 10);



        //country 1 color information
        fill(this.femaleColour)
        rect(this.layout.leftMargin + 120, this.layout.topMargin + 30, 50, 10);
        fill(this.maleColour)
        rect(this.layout.leftMargin + 200, this.layout.topMargin + 30, 50, 10);


        //country 2 color information
        //only display info if the selected countries are different
        if (this.selectedCountriesAreDifferent()) {
            fill(255, 255, 255)
            fill(this.femaleColorC2)
            rect(this.layout.leftMargin + 120, this.layout.topMargin + 60, 50, 10);
            fill(this.maleColorC2)
            rect(this.layout.leftMargin + 200, this.layout.topMargin + 60, 50, 10);
        }

        //reset text size
        textSize(16);
    };

    this.drawStatisticsBox = function (country1, country1Pop, country2, country2Pop) {
        //re calculate percentages only if user changes country selection

        if (changeDetected()) {
            c1_above50 = this.percentOfPeopleAbove50(country1, country1Pop).toFixed(2);
            if (this.selectedCountriesAreDifferent()) {
                c2_above50 = this.percentOfPeopleAbove50(country2, country2Pop).toFixed(2);
            }
        }


        let widthOfBox = 300
        textSize(14);
        fill(0, 0, 0, 150);
        rect(this.layout.rightMargin - widthOfBox, this.layout.topMargin, widthOfBox, 125);
        fill(255, 255, 255);

        //draw country name  and headers
        textSize(12);
        textStyle(BOLD);
        text("≥ 50 yrs", this.layout.rightMargin - 135, this.layout.topMargin + 10);
        text("< 50 yrs", this.layout.rightMargin - 65, this.layout.topMargin + 10);
        textSize(14);

        let textArray = [country1 + " :", c1_above50 + "%", (100 - c1_above50).toFixed(2) + "%"];
        for (i in textArray) {
            text(textArray[i], this.layout.rightMargin - 200 + i * 70, this.layout.topMargin + 35);
        }

        //only display information of second country if the selected countries are different
        if (this.selectedCountriesAreDifferent()) {

            textArray = [country2 + " :", c2_above50 + "%", (100 - c2_above50).toFixed(2) + "%"];
            for (i in textArray) {
                text(textArray[i], this.layout.rightMargin - 200 + i * 70, this.layout.topMargin + 65);
            }
            //display which country has an older population
            textAlign(CENTER);
            if (parseFloat(c1_above50) > parseFloat(c2_above50)) {
                text(country1 + "'s population is older", this.layout.rightMargin - widthOfBox/2, this.layout.topMargin + 95);
            } else if (parseFloat(c1_above50) < parseFloat(c2_above50)) {
                text(country2 + "'s population is older", this.layout.rightMargin - widthOfBox/2, this.layout.topMargin + 95);
            }
        }
        //reset text size and style
        textSize(16);
        textStyle(NORMAL);
    }


    //render crosshairs for user
    this.renderCrossHairs = function () {
        // only draw if mouse is within graph confines
        if (this.MouseOnChart()) {
            stroke(160);
            strokeWeight(1);
            //vertical line
            line(mouseX, this.layout.bottomMargin, mouseX, this.layout.topMargin);
            //horizontal line
            line(this.layout.leftMargin, mouseY, this.layout.rightMargin, mouseY);
        }
    };


    //draw category labels at the top of the graph
    this.drawCategoryLabels = function () {
        fill(0);
        textSize(22);
        noStroke();
        textAlign('left', 'top');
        text('Female',
            this.layout.leftMargin + 100,
            this.layout.pad);
        textAlign('right', 'top');
        text('Male',
            this.layout.rightMargin - 100,
            this.layout.pad);
        textSize(16);
    };

    this.drawChartTitle = function () {
        //if statement to center title based on user selection
        strokeWeight(0);
        textStyle(BOLD);
        textAlign(CENTER);
        let titleXPos = this.midX;
        let title = 'Population Pyramid ' + ' of ' + selectedCountry1 + ' vs ' + selectedCountry2;

        //only display country1 if countries are the same or user selected - for country2
        if (!this.selectedCountriesAreDifferent()) {
            title = 'Population Pyramid ' + ' of ' + selectedCountry1;
            titleXPos = this.midX;
        }

        fill(0);
        text(title, titleXPos, this.layout.pad);
        textStyle(NORMAL);
    }

    //draw Age groups on Y axis
    this.drawAgeGroupAxis = function (countryData) {

        fill(0);
        noStroke();
        textAlign('right', 'top');
        //loop over all age groups and write the headers into the y axis
        for (let i = 0; i < rowCount; i++) {
            let YPos = (ageRectHeight * i) + this.layout.topMargin;
            // Draw the ageGroup names for y axis
            let ageGroup = countryData[i].age;
            text(ageGroup, this.layout.leftMargin - this.layout.pad, YPos);
        }
    }

    /////MISCELLANEOUS CODE//////

    //map percentage from 0 to 20 as the graph is 10% left and right adding up to 20%
    this.mapPercentToWidth = function (percent) {
        return map(percent, 0, 20, 0, this.layout.plotWidth());
    };


    //generate array storing objects that contian information on each age group
    this.generateCountryDataArray = function (countryName) {

        //array that will store the age group objects objects
        let array = [];

        for (let i = 0; i < rowCount; i++) {
            const ageGroup = {
                // Convert strings to numbers
                'age': this.data.getString(i, 'Age'),
                'female': this.data.getNum(i, countryName + " F"),
                'male': this.data.getNum(i, countryName + " M")
            };

            array.push(ageGroup);
        }

        return array;
    }
    //detect if users mouse is on the canvas
    this.MouseOnChart = function () {
        if (mouseX >= this.layout.leftMargin &&
            mouseX <= this.layout.rightMargin &&
            mouseY >= this.layout.topMargin &&
            mouseY <= this.layout.bottomMargin) {
            return true;
        } else {
            return false;
        }
    }

    //detects is user has changed a country from the drop down menu
    // this prevents the generateCountryData array from being called every draw loop
    function changeDetected() {
        if (typeof detectChange_country1 === 'undefined' ||
            selectedCountry1 != detectChange_country1 ||
            selectedCountry2 != detectChange_country2) {
            return true;
        } else return false
    }


    //if population value is larger than 500k divides by million otherwise divides by 1000
    //then rounds data to 2dp and returns the respective unit (millions or thousands)
    //done to make data more readable
    function dataCleaner(value) {
        let divisor = 1000000;
        let unit = " M";
        if (value <= 500000) {
            divisor = 1000;
            unit = " K"
        }
        // return values
        return {
            'simplifiedNum': (value / divisor).toFixed(2),
            'unit': unit
        };
    }


    this.selectedCountriesAreDifferent = function () {
        if (this.selectedCountry1.value() !== this.selectedCountry2.value() && this.selectedCountry2.value() !== " - ") {
            return true;
        } else return false;
    }

    /////PERCENTAGE CALCULATION FUNCTIONS////////

    //calculates the percentage of the people in an age group over the entire population
    this.percentage = function (numberOfPeopleInAgeGroup, countryPopulation) {
        return (numberOfPeopleInAgeGroup / countryPopulation) * 100;
    }

    //calculate the percent of population above the age of 50
    this.percentOfPeopleAbove50 = function (country, countryPop) {
        let sumOfPeopleAboveAge = 0;
        let i = 0;
        while (this.data.getString(i, 'Age') !== "45-49") {
            sumOfPeopleAboveAge += this.data.getNum(i, country + " F") + this.data.getNum(i, country + " M");
            i++;
        }
        return this.percentage(sumOfPeopleAboveAge, countryPop);
    }

}