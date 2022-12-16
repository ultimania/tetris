'use strict';

import { COLS_COUNT, ROWS_COUNT } from './Field.js';
import { Asset } from "./Asset.js";
export const BLOCK_SIZE = 32;

/**
 * a class of Mino's or Field's Block
 */
export class Block {
    /**
     * ctor
     * the coordinates from base point
     * is moving ⇒  top left of mino.
     * after deployment  ⇒ top left of field
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} type 
     */
    constructor(x, y, type) {
        this.x = x
        this.y = y

        // if you do not draw, you do not need to specify type
        if (type >= 0) {
            this.setType(type)
        }
    }

    setType(type) {
        this.type = type
        this.image = Asset.blockImages[type]
    }

    /**
     * draw this block on specified canvas
     * when belonging to Mino, the position of Mino is specified as an offset
     * when belonging to Field, the starting point is (0,0), so it is not necessary
     * 
     * @param {*} offsetX 
     * @param {*} offsetY 
     * @param {*} ctx 
     */
    draw(offsetX = 0, offsetY = 0, ctx) {
        let drawX = this.x + offsetX
        let drawY = this.y + offsetY

        // if the block's coordinates is out of canvs, it is not drawed
        if (drawX >= 0 && drawX < COLS_COUNT &&
            drawY >= 0 && drawY < ROWS_COUNT) {
            ctx.drawImage(
                this.image,
                drawX * BLOCK_SIZE,
                drawY * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            )
        }
    }

    /**
     * draw next Mino
     * adjust margins for each type and display in the center
     * 
     * @param {*} ctx 
     */
    drawNext(ctx) {
        let offsetX = 0
        let offsetY = 0
        switch (this.type) {
            case 0:
                offsetX = 0.5
                offsetY = 0
                break;
            case 1:
                offsetX = 0.5
                offsetY = 0.5
                break;
            case 2:
                offsetX = 1
                offsetY = 1.5
                break;
            case 3:
                offsetX = 1
                offsetY = 1.5
                break;
            case 4:
                offsetX = 1
                offsetY = 1.5
                break;
            default:
                offsetX = 1
                offsetY = 0.5
                break;
        }

        ctx.drawImage(
            this.image,
            (this.x + offsetX) * BLOCK_SIZE,
            (this.y + offsetY) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        )
    }

    /**
     * draw hold Mino
     * adjust margins for each type and display in the center
     * 
     * @param {*} ctx 
     */
    drawHold(ctx) {
        let offsetX = 0
        let offsetY = 0
        switch (this.type) {
            case 0:
                offsetX = 0.5
                offsetY = 0
                break;
            case 1:
                offsetX = 0.5
                offsetY = 0.5
                break;
            case 2:
                offsetX = 1
                offsetY = 1.5
                break;
            case 3:
                offsetX = 1
                offsetY = 1.5
                break;
            case 4:
                offsetX = 1
                offsetY = 1.5
                break;
            default:
                offsetX = 1
                offsetY = 0.5
                break;
        }

        ctx.drawImage(
            this.image,
            (this.x + offsetX) * BLOCK_SIZE,
            (this.y + offsetY) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        )
    }
}
