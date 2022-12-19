'use strict';

import { COLS_COUNT } from './Field.js';
import { Block } from './Block.js'
import { CLOCKWISE, ANTICLOCKWISE } from './Game.js';

const MAX_WIDTH = [3, 3, 2, 2, 2, 2, 2];
/**
 * a class of Mino
 */
export class Mino {
    constructor(minoType) {
        this.type = minoType
        this.maxWidth = MAX_WIDTH[this.type];
        this.initBlocks()
    }

    /**
     * initializing blocks
     */
    initBlocks() {
        let t = this.type
        switch (t) {
            case 0: // I type
                this.blocks = [new Block(0, 2, t), new Block(1, 2, t), new Block(2, 2, t), new Block(3, 2, t)]
                break;
            case 1: // O type
                this.blocks = [new Block(1, 1, t), new Block(2, 1, t), new Block(1, 2, t), new Block(2, 2, t)]
                break;
            case 2: // T type
                this.blocks = [new Block(1, 0, t), new Block(0, 1, t), new Block(1, 1, t), new Block(2, 1, t)]
                break;
            case 3: // L type
                this.blocks = [new Block(0, 0, t), new Block(0, 1, t), new Block(1, 1, t), new Block(2, 1, t)]
                break;
            case 4: // J type
                this.blocks = [new Block(2, 0, t), new Block(0, 1, t), new Block(1, 1, t), new Block(2, 1, t)]
                break;
            case 5: // S type
                this.blocks = [new Block(1, 1, t), new Block(2, 1, t), new Block(0, 2, t), new Block(1, 2, t)]
                break;
            case 6: // Z type
                this.blocks = [new Block(0, 1, t), new Block(1, 1, t), new Block(1, 2, t), new Block(2, 2, t)]
                break;
        }
    }

    /**
     * spawn the block on field
     */
    spawn() {
        this.x = COLS_COUNT / 2 - 2
        this.y = -2
    }

    /**
     * draw Mino on specified canvas
     * 
     * @param {*} ctx 
     */
    draw(ctx) {
        this.blocks.forEach(block => {
            block.draw(this.x, this.y, ctx)
        })
    }

    /**
     * draw next Mino on specified canvas
     * 
     * @param {*} ctx 
     */
    drawNext(ctx) {
        this.blocks.forEach(block => {
            block.drawNext(ctx)
        })
    }

    /**
     * draw hold Mino on specified canvas
     * 
     * @param {*} ctx 
     */
    drawHold(ctx) {
        this.blocks.forEach(block => {
            block.drawHold(ctx)
        })
    }

    /**
     * rotate Mino
     */
    rotate(direction = CLOCKWISE) {
        if (direction == CLOCKWISE) {
            this.blocks.forEach(block => {
                let oldY = block.y
                block.y = block.x
                block.x = this.maxWidth - oldY
            });
        } else {
            this.blocks.forEach(block => {
                let oldX = block.x
                block.x = block.y
                block.y = this.maxWidth - oldX
            });
        }
    }

    /**
     * generate a mino with information on the location where you are about to move next
     * Not drawn, but used to determine if movement is possible
     * 
     * @param {*} moveX 
     * @param {*} moveY 
     * @param {*} rot 
     * @returns 
     */
    getNewBlocks(moveX, moveY, rot) {
        let newBlocks = this.blocks.map(block => {
            return new Block(block.x, block.y)
        })
        newBlocks.forEach(block => {
            if (rot == CLOCKWISE) {
                let oldY = block.y
                block.y = block.x
                block.x = this.maxWidth - oldY
            } else if (rot == ANTICLOCKWISE) {
                let oldX = block.x
                block.x = block.y
                block.y = this.maxWidth - oldX
            }

            if (moveX || moveY) {
                block.x += moveX
                block.y += moveY
            }

            block.x += this.x
            block.y += this.y
        })

        return newBlocks
    }

    /**
     * return this Mino's corner blocks
     * @returns 
     */
    getCornerBlocks() {
        var leftUp = [this.x, this.y];
        var leftDown = [this.x, this.y + 2];
        var rightUp = [this.x + 2, this.y];
        var rightDown = [this.x + 2, this.y + 2];
        return [leftUp, leftDown, rightUp, rightDown];
    }
}