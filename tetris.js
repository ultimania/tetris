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
