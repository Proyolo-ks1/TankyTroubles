import { getGlobal } from '../global-state.js';
import { spawnRelativeClass } from '../classes/spawner.js';
import { Tank } from '../classes/tank.js';
import { NoWeapon, Chaingun, Shotgun, FlameThrower, ChainShotgun, ShrepnalBombWeapon, ExperimentalWeapon, ChainShotgunBOOM, OppenheimerBOOOM, MissleLauncher } from '../classes/weapons.js';
import { DefaultBullet, ChaingunBullet, ShotgunBullet, Shrapnel, ShrapnelBomb, FireBullet, HomingMissle, OppenheimerBullet } from '../classes/bullet.js';
import { TankDriveParticle, TankTrackParticle } from '../classes/particle.js';
import { DefaultPowerup, BoostPowerup } from '../classes/power-up.js';
import { TextBoxEntity } from '../classes/util-entities.js';




//      |=====================|
//      |      FUNCTIONS      |
//      |=====================|



// MARK: testSpawnAll
export function spawnAllTestObjects() {

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
                OppenheimerBullet
            ]
        },
        {
            x: 2.5,
            classes: [
                TankDriveParticle,
                TankTrackParticle
            ]
        },
        {
            x: 3.5,
            classes: [
                DefaultPowerup,
                BoostPowerup
            ]
        }
    ];

    const dummyOwner = new Tank(
            { x: 0, y: 0 },
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            { up: "", down: "", left: "", right: "", shoot: "" },
        );

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