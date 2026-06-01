import { getGlobal } from '../global-state.js';
import { spawnRelativeClass } from '../classes/spawner.js';
import { Tank } from '../classes/tank.js';
import * as Weapons from '../classes/weapons.js';
import * as Bullets from '../classes/bullet.js';
import * as Particles from '../classes/particle.js';
import * as PowerUps from '../classes/power-up.js';
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
        Weapons.NoWeapon,
        Weapons.Chaingun,
        Weapons.Shotgun,
        Weapons.FlameThrower,
        Weapons.ChainShotgun,
        Weapons.ShrepnalBombWeapon,
        Weapons.ExperimentalWeapon,
        Weapons.ChainShotgunBOOM,
        // Weapons.OppenheimerBOOOM,
        Weapons.MissleLauncher,
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
            { up: "o", down: "l", left: "k", right: ";", shoot: "[" },
            WeaponClass.name
        );
        tank.weapon = new WeaponClass(tank);
        new TextBoxEntity(tank, { x: 0, y: 0.68 + i }, 0, 1, WeaponClass.name)
    });

    const categories = [
        {
            x: 1.5,
            classes: [
                Bullets.DefaultBullet,
                Bullets.ChaingunBullet,
                Bullets.ShotgunBullet,
                Bullets.Shrapnel,
                Bullets.ShrapnelBomb,
                Bullets.FireBullet,
                Bullets.HomingMissle,
                Bullets.OppenheimerBullet,
                Bullets.OppenheimerNeutron,
            ]
        },
        {
            x: 2.5,
            classes: [
                Particles.TankExhaustParticle,
                Particles.TankTrackMarkParticle,
            ]
        },
        {
            x: 3.5,
            classes: [
                PowerUps.OffensiveUnknown,
                PowerUps.BoobyTrapPowerup,
                PowerUps.ChaingunPowerup,
                PowerUps.CryoBombPowerup,
                PowerUps.DoubleBarrelPowerup,
                PowerUps.DrillPowerup,
                PowerUps.DroneTankDetonatorPowerup,
                PowerUps.DroneTankShooterPowerup,
                PowerUps.LaserPowerup,
                PowerUps.MissileHomingPowerup,
                PowerUps.RailgunPowerup,
                PowerUps.ShotgunPowerup,
                PowerUps.ShrapnelBombPowerup,
                PowerUps.SmokeBombPowerup,
            ]
        },
        {
            x: 4.5,
            classes: [
                PowerUps.DefensiveUnknown,
                PowerUps.HealingPowerup,
                PowerUps.ShieldHPPowerup,
                PowerUps.ShieldTimePowerup,
            ]
        },
        {
            x: 5.5,
            classes: [
                PowerUps.BoostUnknown,
                PowerUps.BoostBulletDamagePowerup,
                PowerUps.BoostBulletSpeedPowerup,
                PowerUps.BoostMovementSpeedPowerup,
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