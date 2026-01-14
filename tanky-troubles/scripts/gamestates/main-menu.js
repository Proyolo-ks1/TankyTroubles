import { GAME_STATES, OVERLAY_STATES, setGlobalVariable, getGlobalVariable, getAllGlobals, GLOBAL_VARIABLES } from '../global-state.js';
import { Button } from '../ui.js';

const buttons = [];

export function loadMainMenu(ctx) {
    if (buttons.length === 0) {
        buttons.push(new Button(ctx, { x: 100, y: 200 }, { w: 200, h: 50 }, "Start Game", () => {
            setGlobalVariable(GLOBAL_VARIABLES.GAME_STATE, GAME_STATES.RUNNING);
        }));
        buttons.push(new Button(ctx, { x: 100, y: 270 }, { w: 200, h: 50 }, "Settings", () => {
            setGlobalVariable(GLOBAL_VARIABLES.OVERLAY_STATE, OVERLAY_STATES.SETTINGS);
        }));
        buttons.push(new Button(ctx, { x: 100, y: 340 }, { w: 200, h: 50 }, "Help", () => {
            setGlobalVariable(GLOBAL_VARIABLES.OVERLAY_STATE, OVERLAY_STATES.HELP);
        }));
    }

    // Render buttons
    buttons.forEach(button => button.render?.());

    // Draw title
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Tanky Troubles", 50, 50);
}

// when pressing button:
// setGlobalVariable(GLOBAL_VARIABLES.GAME_STATE, GAME_STATES.MAIN_MENU);
// setGlobalVariable(GLOBAL_VARIABLES.OVERLAY_STATE, OVERLAY_STATES.PAUSE_MENU);