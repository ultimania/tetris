'use strict';

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
export class Asset {
    // for block image array
    static blockImages = []

    /**
     * initializing
     * 
     */
    static async init(callback) {
        
        let loadCnt = 0
        for (let i = 0; i < BLOCK_SOURCES.length; i++) {
            let img = null;
            var promise = new Promise(async resolve=>{
                img = new Image();
                img.src = BLOCK_SOURCES[i];
                img.onload = function () {
                    loadCnt++;
                    if (loadCnt == BLOCK_SOURCES.length - 1 && callback) {
                        callback();
                    }
                    resolve();
                };
            })

            await promise;
            Asset.blockImages.push(img);
        }
    }
}

