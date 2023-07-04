import { customMonsters } from "./CustomMonsters";

/* This SHOULD create variables for each character. */
export const defaultSettings = {
    // Character Specific Settings
    attack_mode: true,
    upgrading: false,
    currentMonster: customMonsters.Bee,
    minimumGoldToStopUpgrading: 15000,
    goldToStartUpgrading: 150000,
    upgrade_mode: false,
    currentUpgradeItem: G.items.staff,
    buyingPotions: false,
    maxHealthPotions: 200,
    maxManaPotions: 200,
    healthPotionName: "hpot0",
    manaPotionName: "mpot0",
    upgradeItem: G.items.staff, // G.items.staff,
    allItemsUpgraded: false,
    minimumScrollsToUpgrade: 1,
    amountScrollsToBuy: 30,
    doTeleportToTown: true,
};

export const defaultSettingsProxy = new Proxy(defaultSettings, {
    get: (o, property) => {
        const propertyFromStorage = localStorage.getItem(property.toString() + character.id);

        // currentMonster is a special case that doesn't include the character.id
        if (property === "currentMonster") {
            const currentMonsterFromStorage = localStorage.getItem(property.toString());
            return currentMonsterFromStorage !== null
                ? JSON.parse(currentMonsterFromStorage)
                : null;
        }

        return propertyFromStorage !== null ? JSON.parse(propertyFromStorage) : null;
    },

    set: (o, property, value) => {
        localStorage.setItem(property.toString() + character.id, JSON.stringify(value));
        // currentMonster is a special case that doesn't include the character.id
        if (property === "currentMonster") {
            localStorage.setItem(property.toString(), JSON.stringify(value));
        }

        if (property === `upgrade_mode${character.id}` && value === false) {
            defaultSettingsProxy.doTeleportToTown = true;
        }

        return true;
    },
});

export function createDefaultSettings() {
    // Loop through defaultSettings
    for (const [key, value] of Object.entries(defaultSettings)) {
        // If localStorage hasn't been set for this key, set it
        if (localStorage.getItem(key + character.id) === null) {
            safe_log(`Setting ${key + character.id} to ${value}`);
            localStorage.setItem(key + character.id, JSON.stringify(value));
        }
    }
}
