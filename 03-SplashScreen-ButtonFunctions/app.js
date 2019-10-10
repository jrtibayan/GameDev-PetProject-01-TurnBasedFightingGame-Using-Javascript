/*      
 *      Goals
 *
 *      1. << DONE >> Basic game stuff
 *              a. << DONE >> initialize Game State
 *              b. << DONE >> draw Canvas
 *      2. << DONE >> Display Splash Screen
 *              a. << DONE >> Display Game Title
 *              b. << DONE >> Display Play Button
 *              c. << DONE >> Display Settings Button
 *              d. << DONE >> Display Exit Game Button
 *      3. << DONE >> Splash Screen Button Click Functions
 *              a. << DONE >> Change state status to "settings" if settings button is clicked
 *              b. << DONE >> Change state status to "lobby" if play button is clicked
 *              c. << DONE >> Change state status to "quit?" if close button is clicked
 *      
 */




//*******************************************************************************************************************************
// global variables

const SHOWLOG = true;

const MAXWIDTH = 800, MAXHEIGHT = 600;

var canvasWidth = window.innerWidth, 
    canvasHeight = window.innerHeight;

var spriteImg = null;

var input = {
    click: null
};




//*******************************************************************************************************************************
// set the size for the canvas

if(canvasWidth >= MAXWIDTH) {
    canvasWidth = MAXWIDTH;
    canvasHeight = MAXHEIGHT;
}




//*******************************************************************************************************************************
// the vector class will be used by sprites to contain their position, size, speed, etc..

var Vec = class Vec {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }

}




//*******************************************************************************************************************************
// the state class will contain the status of the game and every detail of it which means
//      everything that will be drawn on canvas will come from here
//      this tell 
//          what is the status of the game
//          what characters/actors should be drawn
//          what is the score and other info as well          

var State = class State {

    constructor(status, sprites) {
        this.status = status;
        this.sprites = sprites;
    }  

    static start() {
        let state = Object.create(null);
        state.status = "splash";
        state.sprites = Object.create(null);
        state.sprites.all = [];
        state.sprites.splashButtons = [];

        // game title
        state.sprites.all.push(new Sprite(spriteImg, 
            new Vec(0, 0), new Vec(670, 490), // src pos and size,
            new Vec(Math.floor(canvasWidth / 2), Math.floor(canvasHeight / 2)), new Vec(670, 490), // dest pos and size
            function(state) { return state.status === "splash"; }, // condition for display
            state, // info used for condition for display
            "center", 
            0,
            null
        ));

        // play
        state.sprites.all.push(new Sprite(spriteImg, 
            new Vec(0, 490), new Vec(150, 60),
            new Vec(6 * Math.floor(canvasWidth / 9), 7 * Math.floor(canvasHeight / 9)), new Vec(150, 60),
            function(state) { return state.status === "splash"; },
            state,
            undefined,
            0,
            function(state) {
                SHOWLOG && console.log("change state status to << lobby >>");
                return new State("lobby", state.sprites);
            },
            null
        ));

        state.sprites.splashButtons.push(state.sprites.all[state.sprites.all.length - 1]);

        // close
         state.sprites.all.push(new Sprite(spriteImg, 
            new Vec(150, 490), new Vec(32, 32),
            new Vec(canvasWidth - 32, 0), new Vec(32, 32),
            function(state) { return state.status === "splash"; },
            state,
            undefined,
            0,
            function(state) {
                SHOWLOG && console.log("change state status to << quit? >>");
                return new State("quit?", state.sprites);
            }
        ));

        state.sprites.splashButtons.push(state.sprites.all[state.sprites.all.length - 1]);

        // settings
        state.sprites.all.push(new Sprite(spriteImg, 
            new Vec(182, 490), new Vec(32, 32),
            new Vec(canvasWidth - 32 - 32 - 5, 0), new Vec(32, 32),
            function(state) { return state.status === "splash"; },
            state,
            undefined,
            0,
            function(state) {
                SHOWLOG && console.log("change state status to << settings >>");
                return new State("settings", state.sprites);
            }
        ));

        state.sprites.splashButtons.push(state.sprites.all[state.sprites.all.length - 1]);

        return new State(state.status, state.sprites);
    }

}

State.prototype.update = function(time) {
    let newState = Object.create(null);
    newState.status = this.status;
    newState.sprites = this.sprites;

    newState.sprites.all = newState.sprites.all.map(sprite => {
        sprite.update(time, newState);
        return sprite;
    });
    
    // do something if there was input
    if(input.click !== null) {
        switch(newState.status) {
            case "splash":
                for(i in newState.sprites.splashButtons) {
                    if(newState.sprites.splashButtons[i].isClicked()) {
                        newState = newState.sprites.splashButtons[i].clicked(newState);
                        break;
                    }
                }

                input.click = null;
            break;
            case "settings":
            break;
            case "lobby":
            break;
            case "quit?":
            break;
        }
    }

    // do change in status if anything happend
    return new State(newState.status, newState.sprites);
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

        function getCursorPosition(canvas, event) {
            let rect = canvas.getBoundingClientRect()
            let x = event.clientX - rect.left
            let y = event.clientY - rect.top    
            input.click = new Vec(x, y);
        }

        this.canvas.addEventListener('mousedown', function(e) {
            getCursorPosition(this, e)
        });

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
    for (let sprite of sprites.all) {
        if(sprite.display) {
            if(["bird"].includes(sprite.getType())) {
                sprite.draw(this.cx);
            } else {
                this.cx.drawImage(
                    sprite.srcImage,
                    sprite.posOnSrc.x, sprite.posOnSrc.y, sprite.sizeOnSrc.x, sprite.sizeOnSrc.y,
                    sprite.pos.x, sprite.pos.y, sprite.size.x, sprite.size.y
                );
            }
        }
    }
};

CanvasDisplay.prototype.syncState = function(state) {
    this.clearDisplay(state.status);
    this.drawSprites(state.sprites);
};




//*******************************************************************************************************************************
// sprite class

var Sprite = class Sprite {

    constructor(srcImage, posOnSrc, sizeOnSrc, pos, size, checkDisplay, state, pointOfOrigin , rotation, clicked) {
        this.checkDisplay = checkDisplay;
        this.display = checkDisplay(state);

        this.srcImage = srcImage;
        this.posOnSrc = posOnSrc;
        this.sizeOnSrc = sizeOnSrc;

        this.pointOfOrigin = (pointOfOrigin === undefined) ? "upperleft" : pointOfOrigin;

        this.inputtedPos = pos;
        this.size = size;
        
        if(this.pointOfOrigin === "center") {
            this.pos = pos.plus(new Vec(-Math.floor(size.x / 2), -Math.floor(size.y / 2)));
        } else { // upperleft
            this.pos = pos;
        }
        this.rotation = (rotation === undefined) ? 0 : rotation;

        this.clicked = clicked;
    }

    static create(pos) {
        return new Sprite(pos, new Vec(0, 0));
    }

}

Sprite.prototype.zIndex = 1;

Sprite.prototype.getType = function() {
    return "other";
}

Sprite.prototype.update = function(time, state) {
    this.display = this.checkDisplay(state);
    return this;
}

Sprite.prototype.isClicked = function() {
    let clickPos = input.click;
    let pos = {}, 
        size = {};

        pos.x = this.pos.x;
        pos.y = this.pos.y;
        size.x = this.size.x;
        size.y = this.size.y;

    let isClicked = clickPos.x >= pos.x && clickPos.x <= pos.x + size.x && 
    clickPos.y >= pos.y && clickPos.y <= pos.y + size.y;

    return isClicked;
}




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

// run game after loading html page
// javascript only code equivalent to jquery document.ready 
document.addEventListener("DOMContentLoaded", function(event) {
    (function(){
        spriteImg = document.createElement("img");
        spriteImg.onload = imageLoaded;
        spriteImg.src = "../img/sprites.png";

        function imageLoaded() {
            runGame(CanvasDisplay);
        }
    })();
});