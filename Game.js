const Field = require('./Field')
const Mino = require('./Mino')

const {BLOCK_SIZE} = require('./Block')
const {COLS_COUNT, ROWS_COUNT} = require('./Field')

const MAIN_CANVAS_ID = "main-canvas";
const NEXT_CANVAS_ID = "next-canvas";
const HOLD_CANVAS_ID = "hold-canvas";
const SCORE_AREA_ID = "score-area";

const DROP_INTERVAL = 1000;
const NEXT_AREA_SIZE = 160;
const SCREEN_WIDTH = COLS_COUNT * BLOCK_SIZE;
const SCREEN_HEIGHT = ROWS_COUNT * BLOCK_SIZE;


module.exports.CLOCKWISE = 1;
module.exports.ANTICLOCKWISE = 2;


/**
 * a class of Game
 * This is Main Class for this app
 */
module.exports = class Game {
    /**
     * ctor
     * init canvas objects
     */
    constructor() {
        this.initMainCanvas();
        this.initNextCanvas();
        this.initHoldCanvas();
        this.initScoreArea();
    }

    /**
     * init main canvas object
     */
    initMainCanvas() {
        this.mainCanvas = document.getElementById(MAIN_CANVAS_ID);
        this.mainCtx = this.mainCanvas.getContext("2d");
        this.mainCanvas.width = SCREEN_WIDTH;
        this.mainCanvas.height = SCREEN_HEIGHT;
        this.mainCanvas.style.border = "4px solid #555";
    }

    /**
     * init next canvas object
     */
    initNextCanvas() {
        this.nextCanvas = document.getElementById(NEXT_CANVAS_ID);
        this.nextCtx = this.nextCanvas.getContext("2d");
        this.nextCanvas.width = NEXT_AREA_SIZE
        this.nextCanvas.height = NEXT_AREA_SIZE;
        this.nextCanvas.style.border = "4px solid #555";
    }

    /**
     * init hold canvas object
     */
    initHoldCanvas() {
        this.holdCanvas = document.getElementById(HOLD_CANVAS_ID);
        this.holdCtx = this.holdCanvas.getContext("2d");
        this.holdCanvas.width = NEXT_AREA_SIZE
        this.holdCanvas.height = NEXT_AREA_SIZE;
        this.holdCanvas.style.border = "4px solid #555";
    }

    /**
     * init score area
     */
    initScoreArea() {
        this.score = 0;
        this.scoreArea = document.getElementById(SCORE_AREA_ID);
        this.scoreArea.textContent = String(this.score);
    }

    /**
     * start game
     */
    start() {
        this.field = new Field()

        this.popMino()

        this.drawAll()

        // execute drop mino processing every specified time
        clearInterval(this.timer)
        this.timer = setInterval(() => this.dropMino(), DROP_INTERVAL);

        this.setKeyEvent()
    }

    /**
     *  generate and load next mino
     */
    popMino() {
        this.mino = this.nextMino ?? new Mino()
        this.mino.spawn()
        this.nextMino = new Mino()
        // reset holding
        this.holding = false

        // judge the game is over
        if (!this.valid(0, 1)) {
            this.drawAll()
            clearInterval(this.timer)
            alert("GameOver")
        }
    }

    /**
     *  draw canvases
     */
    drawAll() {
        this.mainCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
        this.nextCtx.clearRect(0, 0, NEXT_AREA_SIZE, NEXT_AREA_SIZE)

        this.field.drawFixedBlocks(this.mainCtx)

        this.nextMino.drawNext(this.nextCtx)
        this.mino.draw(this.mainCtx)
        this.scoreArea.textContent = String(this.score);
    }

    /**
     *  drop mino processing
     */
    dropMino() {
        if (this.valid(0, 1)) {
            // If the mino is dropable, increase the Y coordinate
            this.mino.y++;
        } else {
            //If the mino is not dropable, add the mino to the fallen objects on the field
            this.mino.blocks.forEach(e => {
                e.x += this.mino.x
                e.y += this.mino.y
            })
            this.field.blocks = this.field.blocks.concat(this.mino.blocks)
            this.score += this.field.checkLine() * 100;
            this.popMino()
        }
        this.drawAll();
    }

    /**
     *  hold mino processing
     */
    hold() {
        if (!this.holding) {
            if (!this.holdMino) {
                this.holdMino = this.mino;
                this.popMino();
            } else {
                var tempMino = this.holdMino;
                this.holdMino = this.mino;
                this.mino = tempMino;
                this.mino.spawn();
            }
            this.holding = true;
            this.holdCtx.clearRect(0, 0, NEXT_AREA_SIZE, NEXT_AREA_SIZE)
            this.holdMino.drawHold(this.holdCtx)
        }
    }

    /**
     * validate the mino is moveable
     * 
     * @param {*} moveX  next x-coordinate
     * @param {*} moveY  next y-coordinate
     * @param {*} rot  is rotate action
     * @returns 
     */
    valid(moveX, moveY, rot = 0) {
        let newBlocks = this.mino.getNewBlocks(moveX, moveY, rot)
        return newBlocks.every(block => {
            return (
                block.x >= 0 &&
                block.y >= -1 &&
                block.x < COLS_COUNT &&
                block.y < ROWS_COUNT &&
                !this.field.has(block.x, block.y)
            )
        })
    }

    /**
     * the key press event handler
     */
    setKeyEvent() {
        document.onkeydown = function (e) {
            switch (e.keyCode) {
                case KEY_LEFT:
                    if (this.valid(-1, 0)) {
                        this.mino.x--;
                    }
                    break;
                case KEY_RIGHT:
                    if (this.valid(1, 0)) {
                        this.mino.x++;
                    }
                    break;
                case KEY_DOWN:
                    if (this.valid(0, 1)) {
                        this.mino.y++;
                    }
                    break;
                case KEY_CTRL: // clockwise
                    if (this.valid(0, 0, CLOCKWISE)) {
                        this.mino.rotate(CLOCKWISE);
                    }
                    else if (this.valid(-1, 0, CLOCKWISE)) {
                        this.mino.rotate(CLOCKWISE);
                        this.mino.x--;
                    }
                    else if (this.valid(1, 0, CLOCKWISE)) {
                        this.mino.rotate(CLOCKWISE);
                        this.mino.x++;
                    }
                    else if (this.valid(-2, 0, CLOCKWISE)) {
                        this.mino.rotate(CLOCKWISE);
                        this.mino.x = this.mino.x - 2;
                    }
                    else if (this.valid(2, 0, CLOCKWISE)) {
                        this.mino.rotate(CLOCKWISE);
                        this.mino.x = this.mino.x + 2;
                    }
                    break;
                case KEY_SPACE: // anticlockwise
                    if (this.valid(0, 0, ANTICLOCKWISE)) {
                        this.mino.rotate(ANTICLOCKWISE);
                    }
                    else if (this.valid(-1, 0, ANTICLOCKWISE)) {
                        this.mino.rotate(ANTICLOCKWISE);
                        this.mino.x--;
                    }
                    else if (this.valid(1, 0, ANTICLOCKWISE)) {
                        this.mino.rotate(ANTICLOCKWISE);
                        this.mino.x++;
                    }
                    else if (this.valid(-2, 0, ANTICLOCKWISE)) {
                        this.mino.rotate(ANTICLOCKWISE);
                        this.mino.x = this.mino.x - 2;
                    }
                    else if (this.valid(2, 0, ANTICLOCKWISE)) {
                        this.mino.rotate(ANTICLOCKWISE);
                        this.mino.x = this.mino.x + 2;
                    }
                    break;
                case KEY_SHIFT: // hold
                    this.hold();
                    break;
            }
            this.drawAll()
        }.bind(this)
    }
}
