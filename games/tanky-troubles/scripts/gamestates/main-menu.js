import { GAME_STATE_KEYS, OVERLAY_STATE_KEYS, getGlobal } from '../global-state.js';
import { Button } from '../ui.js';
import { Vec2 } from "../utils/math-utils.js";

const buttons = [];

export function loadMainMenu(ctx) {
    if (buttons.length === 0) {
        buttons.push(new Button(ctx, new Vec2(100, 200), { w: 200, h: 50 }, "Start Game", () => {
            getGlobal().gameState = GAME_STATE_KEYS.RUNNING;
        }));
        buttons.push(new Button(ctx, new Vec2(100, 270), { w: 200, h: 50 }, "Settings", () => {
            getGlobal().overlayState = OVERLAY_STATE_KEYS.SETTINGS;
        }));
        buttons.push(new Button(ctx, new Vec2(100, 340), { w: 200, h: 50 }, "Help", () => {
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