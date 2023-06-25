import { customHPandMP } from "./Helper_Functions.js";

// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

// List of settings that can be changed
interface Settings {
    attack_mode: boolean;
    upgrading: boolean;
    currentMonster: typeof customMonsters;
}

const customMonsters = {
    Bee: {
        x: 496.78379392236116,
        y: 1028.891401478082,
    },
    Crab: {
        x: -1181.7290115323442,
        y: -70.48519999365637,
        skin: "crab",
    },
};

const defaultSettings = {
    attack_mode: true,
    upgrading: false,
    currentMonster: customMonsters.Crab,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const customCharacters = {
    // Upgrade Scrolls
    Lucas: {
        x: -460.9737110795928,
        y: -77.41004909360228,
    },
    // T1 Weapons
    Gabriel: {
        x: -89.26400993247745,
        y: -143.6246820060477,
    },
    // Upgrading
    Cue: {
        x: -207.37506379157145,
        y: -184.9999999,
        id: "newupgrade",
    },
};

function saveSetting(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Sleeps for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep for.
 * @returns {Promise<void>} A promise that resolves after the specified time has elapsed.
 */
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Reads a setting from localStorage
function readSetting(key: string) {
    return localStorage.getItem(key);
}

// Loops through defaultSettings and creates a new setting in localStorage if it doesn't exist
function createDefaultSettings() {
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (localStorage.getItem(key) === null) {
            saveSetting(key, value);
        }
    }
}

let _settings = {
    attack_mode: readSetting("attack_mode"),
    upgrading: readSetting("upgrading"),
    currentMonster: readSetting("currentMonster"),
};

function getSettings() {
    return _settings;
}

function setSettings(newSettings: any) {
    _settings = newSettings;
}

Object.defineProperty(window, "settings", {
    get: getSettings,
    set: setSettings,
});

const settings: Settings = {
    attack_mode: Boolean(readSetting("attack_mode")),
    upgrading: Boolean(readSetting("upgrading")),
    currentMonster: readSetting("currentMonster") as unknown as typeof customMonsters,
};

// Fights monsters
async function battleMonsters(monster: any) {
    monster = JSON.parse(monster);
    // If we're not in the right location, move there.
    safe_log(`Monster x: ${monster.x}, y: ${monster.y}`);
    if (character.real_x !== monster.x || character.real_y !== monster.y) {
        // Move to the monster
        if (!smart.moving) {
            smart_move({ x: monster.x, y: monster.y });
            await sleep(4000);
            safe_log("Done sleeping");
        } else {
            safe_log("Waiting for smart move to finish");
        }
    } else {
        // Find a monster to attack.
        safe_log(`Getting ready to attack ${monster}`);
        let target = get_targeted_monster();
        if (!target) {
            target = get_nearest_monster({ min_xp: 100, max_att: 120 });

            if (target?.skin !== monster.skin) {
                target = null;
            }

            if (target) {
                change_target(target);
            } else {
                set_message("No Monsters");
                return;
            }
        }

        if (!is_in_range(target)) {
            // Walk half the distance
            move(
                character.x + (target.x - character.x) / 2,
                character.y + (target.y - character.y) / 2,
            );
        } else if (can_attack(target)) {
            set_message("Attacking");
            attack(target);
        }
    }
}

setInterval(async () => {
    // Create settings if they don't exist
    createDefaultSettings();

    customHPandMP();
    loot();

    if (settings.attack_mode || character.rip || is_moving(character) || !smart.moving) {
        safe_log("battling monsters");
        await battleMonsters(settings.currentMonster as typeof customMonsters);
    }
}, 1000 / 4); // Loops every 1/4 seconds.

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround
