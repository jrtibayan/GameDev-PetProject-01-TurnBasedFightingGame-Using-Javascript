/*      
 *      Goals
 *
 *      1. << DONE >> Basic game stuff
 *              a. << DONE >> initialize Game State
 *              b. << DONE >> draw Canvas
 *      2. Display Splash Screen
 *              a. Display Game Title
 *              b. Display Play Button
 *              c. Display Settings Button
 *              d. Display Exit Game Button
 *      
 */




//*******************************************************************************************************************************
// global variables

const maxWidth = 800, maxHeight = 600;

var canvasWidth = window.innerWidth, 
    canvasHeight = window.innerHeight;




//*******************************************************************************************************************************
// set the size for the canvas

if(canvasWidth >= maxWidth) {
    canvasWidth = maxWidth;
    canvasHeight = maxHeight;
}




//*******************************************************************************************************************************
// the state class will contain the status of the game and every detail of it which means
//      everything that will be drawn on canvas will come from here
//      this tell 
//          what is the status of the game
//          what characters/actors should be drawn
//          what is the score and other info as well          

var State = class State {

    constructor(status) {
        this.status = status;
    }  

    static start() {
        let state = Object.create(null);
        state.status = "splash";

        return new State(state.status);
    }

}

State.prototype.update = function(time) {
    let status = this.status;

    // do change in status if anything happend

    return new State(status);
};




//*******************************************************************************************************************************
// this is the display class which will be in charge of displaying the canvas everything on it

var CanvasDisplay = class CanvasDisplay {
    constructor(parent) {

        this.canvas = document.createElement("canvas");
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.backgroundColor = "rgb(240,240,240)";
        this.canvas.style.border = "0";
        
        parent.appendChild(this.canvas);
        
        this.cx = this.canvas.getContext("2d");
    }

    clear() {
        this.canvas.remove();
    }
}

CanvasDisplay.prototype.clearDisplay = function(status) {
    this.cx.fillStyle = "rgb(112, 197, 207)";
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

CanvasDisplay.prototype.drawSprites = function(sprites) {
    
};

CanvasDisplay.prototype.syncState = function(state) {
    this.clearDisplay(state.status);
    //this.drawSprites(state.sprites);
};




//*******************************************************************************************************************************
// other important functions

function runAnimation(frameFunc) {
    let lastTime = null;
    function frame(time) {
        if (lastTime != null) {
            let timeStep = Math.min(time - lastTime, 100) / 1000;
            if (frameFunc(timeStep) === false) return;
        }
        lastTime = time;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function runGame(Display) {
    console.log("start");

    let display = new Display(document.body);
    state = State.start();

    runAnimation(time => {

        state = state.update(time);
        display.syncState(state);

    });

    console.log("end");
}