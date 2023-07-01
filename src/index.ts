import { ItemKey } from "typed-adventureland";
import { customHPandMP } from "./Helper_Functions.3";

// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!
// @TODO: Set debug points to figure out why we aren't upgrading.
// @TODO: Possibly because we aren't finding the item?

// List of t1 mage items
const t1MageItems = [G.items.staff, G.items.helmet, G.items.shoes, G.items.gloves, G.items.coat];
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const customMonsters = {
    Bee: {
        name: "Bee",
        x: 496.78379392236116,
        y: 1028.891401478082,
    },
    Crab: {
        name: "Crab",
        x: -1181.7290115323442,
        y: -70.48519999365637,
    },
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
    minimumScrollsToUpgrade: 28,
    doTeleportToTown: true,
};

const defaultSettingsProxy = new Proxy(defaultSettings, {
    get: (o, property) => {
        const propertyFromStorage = localStorage.getItem(property.toString());
        return propertyFromStorage !== null ? JSON.parse(propertyFromStorage) : null;
    },

    set: (o, property, value) => {
        localStorage.setItem(property.toString(), JSON.stringify(value));
        if (property === "upgrade_mode" && value === false) {
            defaultSettingsProxy.doTeleportToTown = true;
        }
        return true;
    },
});

/**
 * Sleeps for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep for.
 * @returns {Promise<void>} A promise that resolves after the specified time has elapsed.
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Loops through defaultSettings and creates a new setting in localStorage if it doesn't exist
function createLocalStorage() {
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
}

async function teleportToTown() {
    // Wait for teleport
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
}

async function checkHealthPotions() {
    // Make sure we need potions
    if (quantity("hpot0") < 10 || quantity("mpot0") < 10) {
        // Make sure we can afford potions
        const hpot0Price = G.items.hpot0.g;
        const mpot0Price = G.items.mpot0.g;
        const currentHealthPotions = quantity("hpot0");
        const currentManaPotions = quantity("mpot0");
        const { maxHealthPotions } = defaultSettingsProxy;
        const { maxManaPotions } = defaultSettingsProxy;
        const { gold } = character;
        const goldNeeded =
            (maxHealthPotions - currentHealthPotions) * hpot0Price +
            (maxManaPotions - currentManaPotions) * mpot0Price;

        if (gold >= goldNeeded) {
            defaultSettingsProxy.buyingPotions = true;
        }
    } else {
        defaultSettingsProxy.buyingPotions = false;
    }

    if (defaultSettingsProxy.buyingPotions) {
        teleportToTown();
        safe_log("Buying potions...");

        // Move to Ernis
        if (!smart.moving) {
            smart_move({ x: customCharacters.Ernis.x, y: customCharacters.Ernis.y });
        }
        await delay(1000);
        while (smart.moving) {
            await delay(1000);
        }

        // Buy potions
        buy("hpot0", defaultSettingsProxy.maxHealthPotions - quantity("hpot0"));
        buy("mpot0", defaultSettingsProxy.maxManaPotions - quantity("mpot0"));
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
            safe_log(`Found Found T${searchItem[0].level} ${itemName} in bag`);
            continue;
        }

        // Search for the item in our equipment slots
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

                // If we are on the last loop and we didn't find an item to upgrade,
                // return false;
                if (key1 === "shoes" && value1.level >= 7) return false;
                continue;
            }
        }
        // If we didn't find the item, we found our item to upgrade
        safe_log(`Couldn't find [T7+ ${itemName}], choosing for upgrading`);
        // safe_log(`defaultSettingsProxy.upgradeItem.id: ${defaultSettingsProxy.upgradeItem.id}`);
        if (value !== undefined) defaultSettingsProxy.upgradeItem = value;
        return true;
    }
}

async function needScrolls() {
    // Check how many scrolls we have.
    const scrolls = character.items.filter(
        (item) =>
            item !== null &&
            item !== undefined &&
            item.name === "scroll0" &&
            item.q !== undefined &&
            item.q > 0,
    );

    let q = 0;
    for (const [, value] of Object.entries(scrolls)) {
        q += value.q ? value.q : 0;
    }

    if (q < defaultSettingsProxy.minimumScrollsToUpgrade) return q;
    return false;
}

async function buyScrolls(currentScrollQuantity: number) {
    await teleportToTown();
    safe_log("Buying scrolls...");

    // Walk to scroll vendor
    if (!smart.moving) {
        await smart_move({ x: customCharacters.Lucas.x, y: customCharacters.Lucas.y });
    }

    const pricePerScroll = G.items.scroll0.g;
    const goldNeeded =
        (defaultSettingsProxy.minimumScrollsToUpgrade - currentScrollQuantity) * pricePerScroll;

    // If we don't have enough gold, return
    if (character.gold < goldNeeded) {
        safe_log(`Not enough gold to buy scrolls. Needed: ${goldNeeded}, Have: ${character.gold}`);
        defaultSettingsProxy.upgrade_mode = false;
    } else {
        // Purchase scrolls
        buy("scroll0", defaultSettingsProxy.minimumScrollsToUpgrade - currentScrollQuantity);
        safe_log(
            // eslint-disable-next-line prettier/prettier
            `Bought ${defaultSettingsProxy.minimumScrollsToUpgrade - currentScrollQuantity
            } scrolls for ${goldNeeded} gold`,
        );
    }
}

async function walkToUpgradeNpc() {
    // Walk to upgrade NPC
    if (!smart.moving) {
        await smart_move({ x: customCharacters.Cue.x, y: customCharacters.Cue.y });
    }
}

async function upgradeItem() {
    const itemToUpgrade: number = locate_item(defaultSettingsProxy.upgradeItem.id as ItemKey);
    const scrollItem: number = locate_item("scroll0");

    const success = await upgrade(itemToUpgrade, scrollItem);

    if (success) {
        safe_log(`Upgraded ${defaultSettingsProxy.upgradeItem.id} successfully`);
    } else {
        safe_log(`Failed to upgrade ${defaultSettingsProxy.upgradeItem.id}, item is lost.`);
    }
}

async function upgradeItems() {
    safe_log("Upgrading items");
    // If all items are upgraded, return
    if (defaultSettingsProxy.allItemsUpgraded) {
        safe_log(`Current allItemsUpgraded: ${defaultSettingsProxy.allItemsUpgraded}`);
        safe_log("All items upgraded, returning");
    }
    // If we have more than the set amount of gold, start upgrading
    if (character.gold > defaultSettingsProxy.goldToStartUpgrading) {
        safe_log(`Current gold: ${character.gold}, starting upgrade mode and stopping attack mode`);
        defaultSettingsProxy.upgrade_mode = true;
        defaultSettingsProxy.attack_mode = false;
    }

    // If we have less than the set amount of gold, stop upgrading
    if (character.gold < defaultSettingsProxy.minimumGoldToStopUpgrading) {
        safe_log(`Current gold: ${character.gold}, stopping upgrade mode and starting attack mode`);
        defaultSettingsProxy.upgrade_mode = false;
        defaultSettingsProxy.attack_mode = true;
    }

    // If we're not in upgrade mode, return
    if (!defaultSettingsProxy.upgrade_mode) return;

    // Choose an item to upgrade
    if (!chooseUpgradeItem()) {
        defaultSettingsProxy.allItemsUpgraded = true;
        defaultSettingsProxy.upgrade_mode = false;
        return;
    }
    safe_log(`upgrading item: ${defaultSettingsProxy.upgradeItem.id}`);

    // If character not in town, teleport to town
    // @TODO: TURN townTeleport off when we turn off upgrade move
    if (defaultSettingsProxy.doTeleportToTown) {
        await teleportToTown();
        defaultSettingsProxy.doTeleportToTown = false;
    }

    const currentScrolls = await needScrolls();

    if (currentScrolls) {
        await buyScrolls(currentScrolls);
    }

    // If we're not in upgrade mode, return
    if (!defaultSettingsProxy.upgrade_mode) return;

    // If we have less than the set amount of gold, stop upgrading
    if (character.gold < defaultSettingsProxy.minimumGoldToStopUpgrading) {
        defaultSettingsProxy.upgrade_mode = false;
        defaultSettingsProxy.attack_mode = true;
        return;
    }

    await walkToUpgradeNpc();

    // Upgrade item
    await upgradeItem();
}

// Main Loop
async function mainLoop() {
    // Create settings if they don't exist
    createLocalStorage();

    // Heal and loot
    await customHPandMP();
    loot();

    // Check health potions
    await checkHealthPotions();

    // Upgrade items
    await upgradeItems();

    // Farm monsters
    if (
        defaultSettingsProxy.attack_mode ||
        character.rip ||
        is_moving(character) ||
        !smart.moving
    ) {
        await battleMonsters(
            defaultSettingsProxy.currentMonster as unknown as typeof customMonsters,
        );
    }
    setTimeout(mainLoop, 1000 / 4); // Loops every 1/4 seconds.
}

mainLoop();
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround
