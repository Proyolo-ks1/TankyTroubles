import { getGlobal, ENTITY_TYPES } from '../global-state.js';
import { drawRect, drawCircle, drawRegPolygon, drawLine, drawVectorArrow} from '../utils/graphics-utils.js';

// RunningGameApi






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



export function updateCamera() {
const gameApi = document.getElementById("game-container").runningGameApi;

    const target = null;
    if (gameApi.mouse) {
        console.log(`gameApi.mouse.pos: ${gameApi.mouse.pos.x},${gameApi.mouse.pos.y}`);
    }
}
