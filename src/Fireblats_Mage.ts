import { customHPandMP, checkHealthPotions } from "./Helper_Functions.3";
import { defaultSettingsProxy, createDefaultSettings } from "./StorageManager";
import { battleMonsters } from "./MonsterManager";
import { upgradeItems } from "./UpgradeManager";
import { customMonsters } from "./CustomMonsters";
// Test

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const t1Mage2Items = [G.items.wbook0, G.items.helmet, G.items.shoes, G.items.gloves, G.items.coat];

/**
 * Sleeps for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep for.
 * @returns {Promise<void>} A promise that resolves after the specified time has elapsed.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars

createDefaultSettings();
// Main Loop
export async function mainLoop() {
    await customHPandMP();
    loot();
    await checkHealthPotions();
    await upgradeItems();
    await battleMonsters(defaultSettingsProxy.currentMonster as unknown as typeof customMonsters);

    setTimeout(mainLoop, 1000 / 4); // Loops every 1/4 seconds.
}
