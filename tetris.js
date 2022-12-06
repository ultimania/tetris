const SATRT_BTN_ID = "start-btn";
const GAME_SPEED = 500;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_CTRL = 17;
const KEY_SPACE = 32;
const KEY_SHIFT = 16;

window.onload = function () {
    Asset.init()
    let game = new Game()
    document.getElementById(SATRT_BTN_ID).onclick = function () {
        game.start()
        this.blur() // focus of button out
    }
}

/**
 * a class of Mino
 */
class Mino {
    constructor() {
        this.type = Math.floor(Math.random() * 7);
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
                this.blocks = [new Block(1, 1, t), new Block(0, 2, t), new Block(1, 2, t), new Block(2, 2, t)]
                break;
            case 3: // J type
                this.blocks = [new Block(1, 1, t), new Block(0, 2, t), new Block(1, 2, t), new Block(2, 2, t)]
                break;
            case 4: // L type
                this.blocks = [new Block(2, 1, t), new Block(0, 2, t), new Block(1, 2, t), new Block(2, 2, t)]
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
        this.y = -3
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
                let oldX = block.x
                block.x = block.y
                block.y = 3 - oldX
            });
        } else {
            this.blocks.forEach(block => {
                let oldY = block.y
                block.y = block.x
                block.x = 3 - oldY
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
                let oldX = block.x
                block.x = block.y
                block.y = 3 - oldX
            } else if (rot == ANTICLOCKWISE) {
                let oldY = block.y
                block.y = block.x
                block.x = 3 - oldY
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
}

/**
 * a class of Field
 */
class Field {
    /**
     * ctor
     */
    constructor() {
        this.blocks = []
    }

    /**
     * draw the blocks that was deployed and fixed
     * 
     * @param {*} ctx 
     */
    drawFixedBlocks(ctx) {
        this.blocks.forEach(block => block.draw(0, 0, ctx))
    }

    /**
     * check to see if the blocks are lined up horizontally
     * return number of cleard line
     */
    checkLine() {
        var count = 0;
        for (var r = 0; r < ROWS_COUNT; r++) {
            var c = this.blocks.filter(block => block.y === r).length
            if (c === COLS_COUNT) {
                count++;
                this.blocks = this.blocks.filter(block => block.y !== r)
                this.blocks.filter(block => block.y < r).forEach(upper => upper.y++)
            }
        }
        return count;
    }

    /**
     * check the field has block on specified coordinates
     * 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    has(x, y) {
        return this.blocks.some(block => block.x == x && block.y == y)
    }
}