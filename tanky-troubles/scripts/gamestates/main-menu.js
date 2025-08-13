import { GameState, OverlayState, setGlobalVariable, getGlobalVariable, getAllState } from '../global-state.js';
import { Button } from '../ui.js';

const buttons = [];

export function loadMainMenu(ctx) {
    if (buttons.length === 0) {
        // Create buttons once
        buttons.push(new Button(ctx, { x: 100, y: 200 }, { w: 200, h: 50 }));
        buttons.push(new Button(ctx, { x: 100, y: 270 }, { w: 200, h: 50 }));
        buttons.push(new Button(ctx, { x: 100, y: 340 }, { w: 200, h: 50 }));
    }

    buttons.forEach(button => {
        button.render?.(); // if you've added a render method
    });

    // Optionally add title
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Tanky Troubles", 100, 100);
}

// when pressing button:
setGlobalVariable("currentGameState", GameState.MAIN_MENU);
setGlobalVariable("overlayState", OverlayState.PAUSE_MENU);