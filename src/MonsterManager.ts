import { MonsterKey } from "typed-adventureland";
import { defaultSettingsProxy } from "./StorageManager";
import { customMonsters } from "./CustomMonsters";

export type MonsterPosition = [number, number];

export function getMiddleOfBoundary(boundary: Array<number>) {
    const x1 = boundary[0];
    const y1 = boundary[1];
    const x2 = boundary[2];
    const y2 = boundary[3];

    const mid_x = (x1 + x2) / 2;
    const mid_y = (y1 + y2) / 2;

    // Return x, y as an array
    return [mid_x, mid_y] as MonsterPosition;
}

function chooseMonster(maxHitsToKill = 2) {
    // Loop through monsters, finding ones on the grow list
    const growList: Partial<Record<MonsterKey, MonsterPosition>> = {};
    let monsterPosition: MonsterPosition = [0, 0];

    if (G.maps.main.monsters) {
        for (const monster of G.maps.main.monsters) {
            if (monster.grow) {
                // Get the monster's x, y position using getMiddleOfBoundary
                monsterPosition = getMiddleOfBoundary(
                    monster.boundary ? monster.boundary : [0, 0, 0, 0],
                );

                // Add the monster to the growList with its name as the key and the position as the value
                if (monster !== undefined) {
                    growList[monster.type] = monsterPosition;
                }
            }
        }
    }

    // Loop through growList and game_log the monster name and position
    for (const key of Object.keys(growList)) {
        const monsterKey = key as MonsterKey;
        if (!growList[monsterKey]) continue;
    }

    const max2ShotHealth = character.attack * maxHitsToKill;
    let bestMob = "goo";
    let bestMobHealth: number = G.monsters.goo.hp;

    for (const key of Object.keys(growList)) {
        const monsterKey = key as MonsterKey;
        if (!growList[monsterKey]) continue;

        const monsterHealth: number = G.monsters[monsterKey].hp;

        if (monsterHealth < max2ShotHealth && monsterHealth > bestMobHealth) {
            bestMob = monsterKey;
            bestMobHealth = monsterHealth;

            // If the key doesn't exist in customMonsters, create it.
            if (!customMonsters[bestMob]) {
                customMonsters[bestMob] = {
                    name: bestMob,
                    x: growList[key as MonsterKey]?.[0] ?? 0,
                    y: growList[key as MonsterKey]?.[1] ?? 0,
                };
            }
        }
    }

    // Set the current monster to the best mob
    defaultSettingsProxy.currentMonster = customMonsters[bestMob];
}

// Fights monsters
export async function battleMonsters(monster: any, maxHitsToKill = 2, leader = true) {
    if (leader) {
        // Choose which monster to farm :)
        chooseMonster(maxHitsToKill);
        monster = customMonsters[defaultSettingsProxy.currentMonster.name];
    }

    if (character.id === "FireblatsW") {
        const charX = Math.abs(character.x);
        const charY = Math.abs(character.y);

        if (
            Math.abs(charX - Math.abs(monster.x)) > 150 ||
            Math.abs(charY - Math.abs(monster.y)) > 150
        ) {
            safe_log(`Distance to monster.x: ${Math.abs(charX - Math.abs(monster.x))}`);
            safe_log(`Distance to monster.y: ${Math.abs(charY - Math.abs(monster.y))}`);
            if (!smart.moving) {
                safe_log("to far away, moving to monster");
                await smart_move({ x: monster.x, y: monster.y });
            }
        }
    } else {
        // If we're not in the right location, move there.
        if (character.real_x !== monster.x || character.real_y !== monster.y) {
            // Move to the monster
            if (!smart.moving) {
                await smart_move({ x: monster.x, y: monster.y });
            }
        }
    }

    // Find a monster to attack.
    let target = get_targeted_monster();
    if (!target) {
        target = get_nearest_monster({ min_xp: 100, max_att: 120 });

        if (target) {
            change_target(target);
        } else {
            set_message("No Monsters");
            return;
        }
    }

    // Melee chars
    if (character.id === "FireblatsW") {
        if (!is_in_range(target, "attack")) {
            await move(
                character.x + (target.x - character.x),
                character.y + (target.y - character.y),
            );
        } else if (can_attack(target)) {
            set_message("Attacking");
            attack(target);
        }
    } else {
        // Ranged Chars
        if (!is_in_range(target)) {
            // Walk half the distance
            await move(
                character.x + (target.x - character.x) / 2,
                character.y + (target.y - character.y) / 2,
            );
        } else if (can_attack(target)) {
            set_message("Attacking");
            attack(target);
        }
    }
}
