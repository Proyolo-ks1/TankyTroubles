import { GAME_STATE_KEYS, OVERLAY_STATE_KEYS, getGlobal } from '../global-state.js';
import { Button } from '../ui.js';

const buttons = [];

export function loadMainMenu(ctx) {
    if (buttons.length === 0) {
        buttons.push(new Button(ctx, { x: 100, y: 200 }, { w: 200, h: 50 }, "Start Game", () => {
            getGlobal().gameState = GAME_STATE_KEYS.RUNNING;
        }));
        buttons.push(new Button(ctx, { x: 100, y: 270 }, { w: 200, h: 50 }, "Settings", () => {
            getGlobal().overlayState = OVERLAY_STATE_KEYS.SETTINGS;
        }));
        buttons.push(new Button(ctx, { x: 100, y: 340 }, { w: 200, h: 50 }, "Help", () => {
            getGlobal().overlayState = OVERLAY_STATE_KEYS.HELP;
        }));
    }

    // Render buttons
    buttons.forEach(button => button.render?.());

    // Draw title
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Tanky Troubles", 50, 50);
}