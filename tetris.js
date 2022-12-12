'use strict';

import { Game } from "./Game.js";
import { Asset } from "./Asset.js";

const START_BTN_ID = "start-btn";
const PAUSE_BTN_ID = "pause-btn";

window.onload = function () {
    Asset.init();
    let game = new Game();
    const startButton = document.getElementById(START_BTN_ID);
    const pauseButton = document.getElementById(PAUSE_BTN_ID);

    startButton.onclick = function () {
        game.start()
        pauseButton.textContent = "PAUSE";
        this.blur() // focus of button out
    };
    pauseButton.onclick = function () {
        if (!game.paused) {
            game.pause();
            this.textContent = "RESTART";
            this.blur() // focus of button out
        } else {
            game.restart();
            this.textContent = "PAUSE";
            this.blur() // focus of button out
        }
    };
}
