'use strict';

import { Field, COLS_COUNT, ROWS_COUNT } from './Field.js';
import { Mino } from './Mino.js';
import { BLOCK_SIZE } from './Block.js';

const MAIN_CANVAS_ID = "main-canvas";
const NEXT_CANVAS_ID = "next-canvas";
const HOLD_CANVAS_ID = "hold-canvas";
const SCORE_AREA_ID = "score-area";
const EFFECT_TEXT_ID = "effect-text";

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_CTRL = 17;
const KEY_SPACE = 32;
const KEY_SHIFT = 16;
const TETRIS_ROWS = 4;

const DROP_INTERVAL = 1000;
const NEXT_AREA_SIZE = 160;
const ALLOWD_ROTATION_COUNT = 15;
const SCREEN_WIDTH = COLS_COUNT * BLOCK_SIZE;
const SCREEN_HEIGHT = ROWS_COUNT * BLOCK_SIZE;

const MINO_TYPES = [0, 1, 2, 3, 4, 5, 6];

export const CLOCKWISE = 1;
export const ANTICLOCKWISE = 2;


/**
 * a class of Game
 * This is Main Class for this app
 */
export class Game {
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
        this.effectText = document.getElementById(EFFECT_TEXT_ID);
        this.effectText.style.opacity = 0.0;
    }

    /**
     * start game
     */
    start() {
        this.holdMino = null;
        this.holdCtx.clearRect(0, 0, NEXT_AREA_SIZE, NEXT_AREA_SIZE)
        this.score = 0;
        this.paused = false;
        this.field = new Field()
        this.minoTypeQueue = this.shuffleArray(MINO_TYPES);

        this.popMino()
        this.drawAll()

        // execute drop mino processing every specified time
        clearInterval(this.timer)
        this.timer = setInterval(() => {
            if (!this.minoGrounded) {
                this.dropMino();
            }
        }, DROP_INTERVAL);
        this.setKeyEvent()
    }

    /**
     * Random shuffling of array elements 
     * 
     * @param {*} orgArray original array object
     * @return shuffled array object
     */
    shuffleArray(orgArray) {
        // copy orgArray
        let array = orgArray.concat();
        // shuffle elements
        for (var i = (array.length - 1); 0 < i; i--) {
            var r = Math.floor(Math.random() * (i + 1));
            var tmp = array[i];
            array[i] = array[r];
            array[r] = tmp;
        }
        return array;
    }

    /**
     *  generate and load next mino
     */
    popMino() {
        this.mino = this.nextMino ?? new Mino(this.determineMinoType())
        this.mino.spawn()

        delete this.assistMino;
        this.assistMino = new Mino(this.mino.type);
        this.assist();

        this.nextMino = new Mino(this.determineMinoType())
        this.holdProhibition = false
        this.rotationCount = 0;

        // judge the game is over
        if (!this.valid(0, 1)) {
            this.gameover();
        }
    }

    assist() {
        this.assistMino.x = this.mino.x;
        this.assistMino.y = this.mino.y;
        this.ground(this.assistMino);
    }

    gameover() {
        this.drawAll()
        clearInterval(this.timer)
        alert(`GameOver: Your score is ${this.score}`);
    }

    /**
     * determine mino type
     * 
     * @returns mino type number
     */
    determineMinoType() {
        if (this.minoTypeQueue.length == 0) {
            // init mino type queue
            this.minoTypeQueue = this.shuffleArray(MINO_TYPES);
        }
        return this.minoTypeQueue.pop();
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
        this.assistMino.draw(this.mainCtx, 0.3)
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
            this.score += this.calcEarnedPoints(this.field.checkLAndCleardine())
            this.popMino()
        }
        this.drawAll();
    }

    isTspin() {
        if (this.mino.type == 2 && this.rotationCount > 0) {
            var checkBlocks = this.mino.getCornerBlocks();
            return checkBlocks.map((block) => this.field.has(block[0], block[1])).filter((block) => block == false).length >= 3
        }
        return false;
    }

    /**
     * pause mode
     */
    pause() {
        if (!this.paused) {
            clearInterval(this.timer);
            this.paused = true;
        }
        document.onkeydown = null;
    }

    /**
     * return game mode
     */
    restart() {
        if (this.paused) {
            this.timer = setInterval(() => this.dropMino(), DROP_INTERVAL);
            this.paused = false;
        }
        this.setKeyEvent();
    }

    ground(mino) {
        // Drop minos whenever possible
        while (this.valid(0, 1, undefined, mino)) {
            mino.y++;
        }
    }

    /**
     * execute hard-drop
     */
    execHardDrop() {
        this.ground(this.mino);
        this.mino.blocks.forEach(e => {
            e.x += this.mino.x
            e.y += this.mino.y;
        })
        this.field.blocks = this.field.blocks.concat(this.mino.blocks);
        this.score += this.calcEarnedPoints(this.field.checkLAndCleardine());
        this.popMino();
        this.drawAll();
    }

    /**
     * calclate earned points from cleard block lines
     * 
     * @param {*} cleardRowsCount 
     * @returns earned points
     */
    calcEarnedPoints(cleardRowsCount) {
        if (this.isTspin()) {
            this.drawTspinEffect();
            return cleardRowsCount * 1000;
        } else if (cleardRowsCount == TETRIS_ROWS) {
            this.drawTetrisEffect();
            return cleardRowsCount * 500;
        }
        return cleardRowsCount * 100;
    }

    /**
     * draw effection of Tspin text
     */
    drawTspinEffect() {
        this.effectText.innerText = "TSPIN!!";
        this.effectText.animate(
            [
                { opacity: 1 },
                { opacity: 0 }
            ],
            {
                duration: 4000,
                fill: 'forwards'
            }
        );
        this.scoreArea.animate(
            [
                { color: 'red' },
                { color: 'black' }
            ],
            {
                duration: 4000,
                fill: 'forwards'
            }
        )
    }

    /**
     * draw effection of tetris text
     */
    drawTetrisEffect() {
        this.effectText.innerText = "TETRIS!!";
        this.effectText.animate(
            [
                { opacity: 1 },
                { opacity: 0 }
            ],
            {
                duration: 4000,
                fill: 'forwards'
            }
        );
        this.scoreArea.animate(
            [
                { color: 'red' },
                { color: 'black' }
            ],
            {
                duration: 4000,
                fill: 'forwards'
            }
        )
    }

    /**
     *  hold mino processing
     */
    hold() {
        if (!this.holdProhibition) {
            if (!this.holdMino) {
                this.holdMino = new Mino(this.mino.type);
                this.popMino();
            } else {
                var tempMino = this.holdMino;
                this.holdMino = new Mino(this.mino.type);
                this.mino = tempMino;
                this.mino.spawn();
                delete this.assistMino;
                this.assistMino = new Mino(this.mino.type);
            }
            this.holdProhibition = true;
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
    valid(moveX, moveY, rot = 0, mino = this.mino) {
        let newBlocks = mino.getNewBlocks(moveX, moveY, rot)
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
     * rotate this mino
     */
    rotateMino(rot) {
        if (!this.valid(0, 1) && this.rotationCount < ALLOWD_ROTATION_COUNT) {
            this.pause();
            this.rotationCount++;
        } else {
            this.minoGrounded = false;
        }
        loopout: for (var i = 0; i < 2; i++) {
            if (this.valid(i, 0, rot)) {
                this.mino.rotate(rot);
                this.mino.x = this.mino.x + i;
                this.assistMino.rotate(rot);
                this.assistMino.x = this.assistMino.x + i;
                break loopout;
            } else if (this.valid(-i, 0, rot)) {
                this.mino.rotate(rot);
                this.mino.x = this.mino.x - i;
                this.assistMino.rotate(rot);
                this.assistMino.x = this.assistMino.x - i;
                break loopout;
            }
        }
        this.restart();
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
                case KEY_UP:
                    this.execHardDrop();
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
                case KEY_CTRL: // anticlockwise
                    this.rotateMino(ANTICLOCKWISE);
                    break;
                case KEY_SPACE: // clockwise
                    this.rotateMino(CLOCKWISE);
                    break;
                case KEY_SHIFT: // hold
                    this.hold();
                    break;
            }
            this.assist();
            this.drawAll();
        }.bind(this)
    }
}
