import { getGlobal } from '../global-state.js';
import { drawRect, drawCircle, drawText, drawRegPolygon, drawLine, drawVectorArrow, drawTextBox } from '../utils/graphics-utils.js';
import { spawnClassRelatively } from './spawner.js';
import { randomSeeded, randomRange, Vec2 } from "../utils/math-utils.js";
import { StaticEntity } from './entity.js';
import { PARTICLES } from './particle.js';






//      |=========================|
//      |      UTIL ENTITIES      |
//      |=========================|



// MARK: UtilityEntity
// UtilityEntity class (base class for all types of utility entities)
export class UtilityEntity extends StaticEntity {
    static nextId = 0;
    constructor(
        owner,
        posSpawn = new Vec2(),
        angleSpawn = 0,
        scaleSpawn = 1,
    ) {
        super({ // StaticEntity
            pos: posSpawn,
            angle: angleSpawn,
            scale: scaleSpawn,
        });
        this.name = `Utility ${UtilityEntity.nextId}`;
        this.shortName = `u${UtilityEntity.nextId++}`;
        this.owner = owner;
        
        this.scale = scaleSpawn;

        getGlobal().entities.utilities.unshift(this);
    }
    
    render(ctx, gameDeltaTime) {
        // Nothing
    }
}

// MARK: TextBoxEntity
export class TextBoxEntity extends UtilityEntity {
    static nextId = 0;
    constructor(
        owner,
        posSpawn = new Vec2(),
        angleSpawn = 0,
        scaleSpawn = 1,
        text = "",
    ) {
        super(owner, posSpawn, angleSpawn, scaleSpawn); // UtilityEntity
        this.owner = owner;
        
        this.scale = scaleSpawn;

        this.text = text;
    }
    
    render(ctx, gameDeltaTime) {
        const renderScale = getGlobal().renderScale

        drawTextBox(
            ctx,
            this.text, 
            this.pos,
            { w: 2, h: 0.25 },
            {
                backgroundColor: "#222",
                borderColor: "#fff",
                borderWidth: 0.02,
                borderRadius: 0.05,
                padding: new Vec2(0.05, 0.05),
                textStyle: {
                    fontSize: 16 / renderScale, // px
                    font: "Arial",
                    textColor: "#0f0",
                    outlineColor: "#000",
                    outlineWidth: 2 / renderScale, // px
                },
            }
        );
    }
}