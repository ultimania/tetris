const BLOCK_SOURCES = [
    "images/block-0.png",
    "images/block-1.png",
    "images/block-2.png",
    "images/block-3.png",
    "images/block-4.png",
    "images/block-5.png",
    "images/block-6.png"
]

/**
 *  a class of managing assets
 *  This class is initialized at the start of the game.
 */
module.exports = class Asset {
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

