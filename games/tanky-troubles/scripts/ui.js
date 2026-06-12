import { getGlobal } from './global-state.js';
import { drawRect, drawVertexPolygon, drawCircle, drawText, drawLine, drawRegPolygon, drawVectorArrow} from './utils/graphics-utils.js';






//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



export class Button {
    constructor(ctx, pos = new Vec2(), size = {w: 20, h: 40} ) {
        this.ctx = ctx
        this.pos = pos
        this.size = size
    }

    render() {
        drawRect(this.ctx, this.pos, this.size, "#ccc", "#000"); // Basic button
        const buttonTextStyle = {
            align: "center",
            baseline: "middle",
            font: "16px Arial",
            textColor: "#000"
        };
        drawText(this.ctx, "Click Me", { 
            x: this.pos.x + this.size.w / 2, 
            y: this.pos.y + this.size.h / 2 
        }, buttonTextStyle);
    }
}