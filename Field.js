module.exports.COLS_COUNT = 10;
module.exports.ROWS_COUNT = 20;

/**
 * a class of Field
 */
module.exports = class Field {
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