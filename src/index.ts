import { GItem } from "typed-adventureland";
import { customHPandMP } from "./Helper_Functions.3";

// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

// List of settings that can be changed
interface Settings {
    attack_mode: boolean;
    upgrading: boolean;
    currentMonster: typeof customMonsters;
    minimumGoldToStopUpgrading: number;
    goldToStartUpgrading: number;
    upgrade_mode: boolean;
    currentUpgradeItem: GItem;
    buyingPotions: boolean;
    maxHealthPotions: number;
    maxManaPotions: number;
    healthPotionName: string;
    manaPotionName: string;
    upgradeItem: GItem;
    allItemsUpgraded: boolean;
}

// List of t1 mage items
const t1MageItems = [G.items.staff, G.items.helmet, G.items.shoes, G.items.gloves, G.items.coat];

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
    minimumGoldToStopUpgrading: 15000,
    goldToStartUpgrading: 150000,
    upgrade_mode: false,
    currentUpgradeItem: G.items.staff,
    buyingPotions: false,
    maxHealthPotions: 200,
    maxManaPotions: 200,
    healthPotionName: "hpot0",
    manaPotionName: "mpot0",
    upgradeItem: G.items.staff,
    allItemsUpgraded: false,
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
    // Buying Potions
    Ernis: {
        x: -39.864347750250225,
        y: -147.7134982894214,
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
function sleep(ms: number): Promise<void> {
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
    attack_mode: false,
    upgrading: false,
    currentMonster: customMonsters.Crab,
    minimumGoldToStopUpgrading: 15000,
    goldToStartUpgrading: 150000,
    upgrade_mode: false,
    currentUpgradeItem: G.items.staff,
    buyingPotions: false,
    maxHealthPotions: 200,
    maxManaPotions: 200,
    healthPotionName: "hpot0",
    manaPotionName: "mpot0",
    upgradeItem: G.items.staff,
    allItemsUpgraded: false,
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
    minimumGoldToStopUpgrading: readSetting("minimumGoldToStopUpgrading") as unknown as number,
    goldToStartUpgrading: readSetting("goldToStartUpgrading") as unknown as number,
    upgrade_mode: Boolean(readSetting("upgrade_mode")),
    currentUpgradeItem: readSetting("currentUpgradeItem") as unknown as GItem,
    buyingPotions: Boolean(readSetting("buyingPotions")),
    maxHealthPotions: readSetting("maxHealthPotions") as unknown as number,
    maxManaPotions: readSetting("maxManaPotions") as unknown as number,
    healthPotionName: readSetting("healthPotionName") as unknown as string,
    manaPotionName: readSetting("manaPotionName") as unknown as string,
    upgradeItem: readSetting("upgradeItem") as unknown as GItem,
    allItemsUpgraded: Boolean(readSetting("allItemsUpgraded")),
};

async function checkHealthPotions() {
    // Make sure we need potions
    if (quantity("hpot0") < 10 || quantity("mpot0") < 10) {
        // Make sure we can afford potions
        const hpot0Price = G.items.hpot0.g;
        const mpot0Price = G.items.mpot0.g;
        const currentHealthPotions = quantity("hpot0");
        const currentManaPotions = quantity("mpot0");
        const { maxHealthPotions } = settings;
        const { maxManaPotions } = settings;
        const { gold } = character;
        const goldNeeded =
            (maxHealthPotions - currentHealthPotions) * hpot0Price +
            (maxManaPotions - currentManaPotions) * mpot0Price;

        if (gold >= goldNeeded) {
            settings.buyingPotions = true;
        }
    } else {
        settings.buyingPotions = false;
    }

    if (settings.buyingPotions) {
        // Teleport to town
        use_skill("use_town");
        // Wait for teleport
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
        safe_log("Waiting 5 seconds for teleport...");
        await use_skill("use_town").then(
            async () => {
                safe_log("Teleported to town");
            },
            async () => {
                safe_log("Failed to teleport to town");
            },
        );
        await delay(5000);
        safe_log("Waited 5 seconds, buying potions...");
    }
}

// Fights monsters
async function battleMonsters(monster: any) {
    monster = JSON.parse(monster);
    // If we're not in the right location, move there.
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

async function chooseUpgradeItem() {
    // Loop through all the t1MageItems
    // If we find an item that's t7 or higher, move on to the next item
    // If we can't find an item that's t7 or higher on our character or in our inventory, upgrade the first item that's not t7 or higher
    for (const [, value] of Object.entries(t1MageItems)) {
        let foundItem = false;
        const itemName = value.id;

        // Search for the item on our bag
        const searchItem = character.items.filter(
            (item) =>
                item !== null &&
                item !== undefined &&
                item.name === itemName &&
                item.level !== undefined &&
                item.level >= 7,
        );
        if (searchItem.length > 0) {
            foundItem = true;
            safe_log(`Found Found T${searchItem[0].level} ${itemName} in bag`);
        }

        // Search for the item in our inventory
        if (!foundItem) {
            const slotItem = character.slots;
            safe_log(slotItem);
            // Loop through all the slots
            for (const [key1, value1] of Object.entries(character.slots)) {
                // If the slot is not null and the item name matches the item we're looking for and the item level is greater than or equal to 7, we found the item
                if (
                    value1 !== null &&
                    value1 !== undefined &&
                    value1.name === itemName &&
                    value1.level !== undefined &&
                    value1.level >= 7
                ) {
                    safe_log(
                        `Found T${value1.level} ${itemName} in slot key1: ${key1}, value1.name: ${value1.name}`,
                    );
                    foundItem = true;
                    break;
                }
            }
        }
        // If we didn't find the item, choose it for upgrading
        if (!foundItem) {
            safe_log(`Didn't find T7+ ${itemName}, choosing for upgrading`);
            // DEBUG
            safe_log(`settings.upgradeItem: ${settings.upgradeItem}`);
            if (value !== undefined) settings.upgradeItem = value;
            return;
        }
    }
}

async function upgradeItems() {
    safe_log("Upgrading items");
    // If all items are upgraded, return
    if (settings.allItemsUpgraded) return;

    // If we have more than the set amount of gold, start upgrading
    if (character.gold > settings.goldToStartUpgrading) settings.upgrade_mode = true;

    // If we have less than the set amount of gold, stop upgrading
    if (character.gold < settings.minimumGoldToStopUpgrading) settings.upgrade_mode = false;

    // If we're not in upgrade mode, return
    if (!settings.upgrade_mode) return;

    // Choose an item to upgrade
    chooseUpgradeItem();
}

// Main Loop
setInterval(async () => {
    // Create settings if they don't exist
    createDefaultSettings();

    // Heal and loot
    customHPandMP();
    loot();

    // Check health potions
    await checkHealthPotions();

    // Upgrade items
    await upgradeItems();

    // Farm monsters
    if (settings.attack_mode || character.rip || is_moving(character) || !smart.moving) {
        await battleMonsters(settings.currentMonster as typeof customMonsters);
    }
}, 1000 / 4); // Loops every 1/4 seconds.
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround
