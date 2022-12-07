'use strict';

import { Game } from "./Game.js";
import { Asset } from "./Asset.js";

const SATRT_BTN_ID = "start-btn";

window.onload = function () {
    Asset.init()
    let game = new Game()
    document.getElementById(SATRT_BTN_ID).onclick = function () {
        game.start()
        this.blur() // focus of button out
    }
}
