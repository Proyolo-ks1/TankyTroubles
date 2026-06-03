import { getGlobal } from '../global-state.js';
import { spawnRelativeClass } from '../classes/spawner.js';
import { Tank } from '../classes/tank.js';
import { WEAPONS } from '../classes/weapons.js';
import { BULLETS } from '../classes/bullet.js';
import { PARTICLES } from '../classes/particle.js';
import { OFFENSIVE_POWERUPS, DEFENSIVE_POWERUPS, BOOST_POWERUPS } from '../classes/power-up.js';
import { TextBoxEntity } from '../classes/util-entities.js';




//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// MARK: testSpawnAll
export function spawnAllTestObjects() {

    const dummyOwner = new Tank(
            { x: 7.5, y: 0.5 },
            3.14 / 4,
            undefined,
            undefined,
            undefined,
            "#f0f",
            { up: "", down: "", left: "", right: "", shoot: "" },
            "PinkDummyOwner",
        );

    const baseX = 0.5;
    const baseY = 0.5;

    Object.values(WEAPONS).forEach((WeaponClass, i) => {
        const tank = new Tank(
            { x: baseX, y: baseY + i },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            { up: "o", down: "l", left: "k", right: ";", shoot: "[" },
            WeaponClass.name
        );
        tank.weapon = new WeaponClass(tank);
        new TextBoxEntity(tank, { x: 0, y: 0.68 + i }, 0, 1, WeaponClass.name)
    });

    const categories = [
        // { x: 1.5, items: BULLETS },
        { x: 2.5, items: PARTICLES },
        { x: 3.5, items: OFFENSIVE_POWERUPS },
        { x: 4.5, items: DEFENSIVE_POWERUPS },
        { x: 5.5, items: BOOST_POWERUPS },
    ];

    for (const category of categories) {
        Object.entries(category.items).forEach(([name, ClassRef], k) => {
            try {
                spawnRelativeClass(
                    ClassRef,
                    dummyOwner,
                    { x: category.x, y: baseY + k },
                    0,
                    1,
                    { x: 0, y: 0 },
                    0,
                    0,
                    undefined,
                    -1,
                );
            } catch (err) {
                console.warn(`Failed to spawn ${name}:`, err);
            }
        });
    }
}