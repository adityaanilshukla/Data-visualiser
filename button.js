//button arrays that make these global variables such that
//they can be accessed by mousePrssed functions
let buttonArray = [];

class Button {
  constructor(x, y, w, h, tog) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.tog = tog;
  }

  //returns true or false depending on weather toggle is enabled
  isToggleEnabled() {
    if (this.tog) {
      return true;
    } else {
      return false;
    }
  }
}

class PlayPauseButton extends Button {
  constructor(x, y, w, h, tog) {
    super(x, y, w, h, tog);

    this.type = "toggleWhenClicked";

    //push the variables into button array making them global variables
    buttonArray.push(this);
  }

  drawPlayPause() {
    let txt;
    if (this.tog) {
      fill(255, 165, 0);
      txt = "Pause";
    } else {
      fill(128, 128, 128);
      txt = "Play";
    }
    strokeWeight(3);
    if (over(this.x, this.y, this.w, this.h)) {
      stroke(200, 0, 200);
    } //_ We call the function 'over' and pass 4 values of rectangle position and size
    else {
      stroke(0, 200, 200);
    }
    rect(this.x, this.y, this.w, this.h);
    noStroke();
    fill(0);

    textSize(13);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    fill(255);
    text(txt, this.x, this.y + this.h / 2, this.w);
  }
}

class PlusMinuButton extends Button {
  constructor(x, y, w, h, tog, txt) {
    super(x, y, w, h, tog);

    this.type = "toggleWhenClicked";

    this.text = txt;

    //push the variables into button array making them global variables
    buttonArray.push(this);
  }

  drawPlusMinus() {
    if (this.tog) {
      fill(255, 165, 0);
    } else {
      fill(128, 128, 128);
    }
    strokeWeight(3);
    if (over(this.x, this.y, this.w, this.h)) {
      stroke(200, 0, 200);
    } //_ We call the function 'over' and pass 4 values of rectangle position and size
    else {
      stroke(0, 200, 200);
    }
    rect(this.x, this.y, this.w, this.h);
    noStroke();
    fill(0);

    textSize(15);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    fill(255);
    text(this.text, this.x, this.y + this.h / 2, this.w);
    textStyle(NORMAL);
  }
}

//buttons used in the heat map visualisation
//these class of buttons cannot be de-selected by clicking on them, they can only be de-selected by clicking on another button
class HeatMapButton extends Button {
  constructor(x, y, w, h, tog, txt) {
    super(x, y, w, h, tog);

    this.type = "toggleIfCurrentlyNotToggled";

    //type of heatMap to be displayed
    this.txt = txt;

    //push the variables into button array making them global variables
    buttonArray.push(this);
  }

  drawSelectButton() {
    if (this.tog) {
      fill(255, 165, 0);
    } else {
      fill(128, 128, 128);
    }
    strokeWeight(3);
    if (over(this.x, this.y, this.w, this.h)) {
      stroke(200, 0, 200);
    } //_ We call the function 'over' and pass 4 values of rectangle position and size
    else {
      stroke(0, 200, 200);
    }
    rect(this.x, this.y, this.w, this.h);
    noStroke();
    fill(0);

    textSize(13);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    fill(255);
    text(this.txt, this.x, this.y + this.h / 2, this.w);
  }
}

//detect if mouse is over button coordinates
function over(x, y, w, h) {
  return (mouseX > x) & (mouseX < x + w) & (mouseY > y) & (mouseY < y + h);
}

//change toggle value of button if user clicks on button
function mousePressed() {
  //loop over all buttons
  for (i in buttonArray) {

    //assign b to be the button object of each iteraion
    let b = buttonArray[i];

    //detect if mouse is over button position
    if (over(b.x, b.y, b.w, b.h)) {
      //toggle button
      if (b.type == "toggleWhenClicked") {
        b.tog = !b.tog;

        //these class of buttons cannot be de-selected by clicking on them, they can only be de-selected by clicking on another button
      } else if (b.type == "toggleIfCurrentlyNotToggled") {
        if (b.tog == false) {
          b.tog = !b.tog;
          buttonIndex = i;
        }

        //set all buttons of this class to be de-selected except user selected button
        for (i in buttonArray) {
          let b = buttonArray[i];
          if (
            b.type == "toggleIfCurrentlyNotToggled" &&
            b.tog == true &&
            i !== buttonIndex
          ) {
            b.tog = !b.tog;
          }
        }
      }
    }
  }
}