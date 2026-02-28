import { getGlobal } from '../global-state.js';
import { spawnRelativeClass } from '../classes/spawner.js';
import { Tank } from '../classes/tank.js';
import { NoWeapon, Chaingun, Shotgun, FlameThrower, ChainShotgun, ShrepnalBombWeapon, ExperimentalWeapon, ChainShotgunBOOM, OppenheimerBOOOM, MissleLauncher } from '../classes/weapons.js';
import { DefaultBullet, ChaingunBullet, ShotgunBullet, Shrapnel, ShrapnelBomb, FireBullet, HomingMissle, OppenheimerBullet, OppenheimerNeutron } from '../classes/bullet.js';
import { TankExhaustParticle, TankTrackMarkParticle } from '../classes/particle.js';
import { DefaultPowerup, BoostPowerup } from '../classes/power-up.js';
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

    // Spawn at (0.1,0.1)
    // spawnRelativeClass(
    //                 HomingMissle,
    //                 dummyOwner,
    //                 { x: 0.1, y: 0.1 },
    //                 0,
    //                 1,
    //                 { x: 0, y: 0 },
    //                 0,
    //                 0,
    //                 undefined,
    //                 -1,
    //             );

    const weapons = [
        NoWeapon,
        Chaingun,
        Shotgun,
        FlameThrower,
        ChainShotgun,
        ShrepnalBombWeapon,
        ExperimentalWeapon,
        ChainShotgunBOOM,
        // OppenheimerBOOOM,
        MissleLauncher
    ];

    const baseX = 0.5;
    const baseY = 0.5;

    weapons.forEach((WeaponClass, i) => {
        const tank = new Tank(
            { x: baseX, y: baseY + i },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            { up: "i", down: "k", left: "j", right: "l", shoot: ";" },
            WeaponClass.name
        );
        tank.weapon = new WeaponClass(tank);
        new TextBoxEntity(tank, { x: 0, y: 0.68 + i }, 0, 1, WeaponClass.name)
    });

    const categories = [
        {
            x: 1.5,
            classes: [
                DefaultBullet,
                ChaingunBullet,
                ShotgunBullet,
                Shrapnel,
                ShrapnelBomb,
                FireBullet,
                HomingMissle,
                OppenheimerBullet,
                OppenheimerNeutron,
            ]
        },
        {
            x: 2.5,
            classes: [
                TankExhaustParticle,
                TankTrackMarkParticle,
            ]
        },
        {
            x: 3.5,
            classes: [
                DefaultPowerup,
                BoostPowerup,
            ]
        }
    ];

    for (const category of categories) {
        category.classes.forEach((ClassRef, k) => {
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
                console.warn(`Failed to spawn ${ClassRef.name}:`, err);
            }
        });
    }
}