import { getGlobalVariable } from './global-state.js';
import { drawRect, drawVertexPolygon, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from './graphics-utils.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



export class Button {
    constructor(ctx, pos = {x: 0, y: 0}, size = {w: 20, h: 40} ) {
        this.ctx = ctx
        this.pos = pos
        this.size = size
    }

    render() {
        drawRect(this.ctx, this.pos, this.size, "#ccc", "#000"); // Basic button
        drawText(this.ctx, "Click Me", { 
            x: this.pos.x + this.size.w / 2, 
            y: this.pos.y + this.size.h / 2 
        }, { align: "center", baseline: "middle", font: "16px Arial", fill: "#000" });
    }
}