const SATRT_BTN_ID = "start-btn";
const MAIN_CANVAS_ID = "main-canvas";
const NEXT_CANVAS_ID = "next-canvas";
const SCORE_AREA_ID = "score-area";
const DROP_INTERVAL = 1000;
const GAME_SPEED = 500;
const BLOCK_SIZE = 32;
const COLS_COUNT = 10;
const ROWS_COUNT = 20;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_SPACE = 32;
const SCREEN_WIDTH = COLS_COUNT * BLOCK_SIZE;
const SCREEN_HEIGHT = ROWS_COUNT * BLOCK_SIZE;
const NEXT_AREA_SIZE = 160;
const BLOCK_SOURCES = [
    "images/block-0.png",
    "images/block-1.png",
    "images/block-2.png",
    "images/block-3.png",
    "images/block-4.png",
    "images/block-5.png",
    "images/block-6.png"
]

window.onload = function () {
    Asset.init()
    let game = new Game()
    document.getElementById(SATRT_BTN_ID).onclick = function () {
        game.start()
        this.blur() // focus of button out
    }
}

/**
 *  a class of managing assets
 *  This class is initialized at the start of the game.
 */
class Asset {
    // for block image array
    static blockImages = []

    /**
     * initializing
     * 
     * @param {*} callback functions that are processed after initialization.
     */
    static init(callback) {
        let loadCnt = 0
        for (let i = 0; i <= 6; i++) {
            let img = new Image();
            img.src = BLOCK_SOURCES[i];
            img.onload = function () {
                loadCnt++
                Asset.blockImages.push(img)

                if (loadCnt >= BLOCK_SOURCES.length && callback) {
                    callback()
                }
            }
        }
    }
}

/**
 * a class of Game
 * This is Main Class for this app
 */
class Game {
    /**
     * ctor
     * init canvas objects
     */
    constructor() {
        this.initMainCanvas();
        this.initNextCanvas();
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
     * init score area
     */
    initScoreArea(){
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
     * validate the mino is moveable
     * 
     * @param {*} moveX  next x-coordinate
     * @param {*} moveY  next y-coordinate
     * @param {*} rot  is rotate action ?
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
                    if (this.valid(1, 0)){
                        this.mino.x++;  
                    } 
                    break;
                case KEY_DOWN:
                    if (this.valid(0, 1)) {
                        this.mino.y++;
                    }
                    break;
                case KEY_SPACE:
                    if (this.valid(0, 0, 1)) {
                        this.mino.rotate();
                    }
                    else if (this.valid(-1, 0, 1)) {
                        this.mino.rotate();
                        this.mino.x--;
                    }
                    else if (this.valid(1, 0, 1)) {
                        this.mino.rotate();
                        this.mino.x++;
                    }
                    else if (this.valid(-2, 0, 1)) {
                        this.mino.rotate();
                        this.mino.x = this.mino.x - 2;
                    }
                    else if (this.valid(2, 0, 1)) {
                        this.mino.rotate();
                        this.mino.x = this.mino.x + 2;
                    }
                    break;
            }
            this.drawAll()
        }.bind(this)
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
     * rotate Mino
     */
    rotate() {
        this.blocks.forEach(block => {
            let oldX = block.x
            block.x = block.y
            block.y = 3 - oldX
        })
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
            if (rot) {
                let oldX = block.x
                block.x = block.y
                block.y = 3 - oldX
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