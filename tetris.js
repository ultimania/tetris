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
 * a class of Mino's or Field's Block
 */
class Block {
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
        if (type >= 0) this.setType(type)
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