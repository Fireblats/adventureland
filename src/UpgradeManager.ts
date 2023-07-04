/* eslint-disable @typescript-eslint/no-unused-vars */
// A file containing common functions used throughout the project
import { ItemKey, MonsterKey, SlotType } from "typed-adventureland";
import { defaultSettingsProxy } from "./StorageManager";
import { customCharacters } from "./CustomCharacters";
import { teleportIfWeNeedTo } from "./Helper_Functions.3";

// List of t1 mage items
export const t1MageItems = [
    G.items.staff,
    G.items.helmet,
    G.items.shoes,
    G.items.gloves,
    G.items.coat,
];
export const t1RangerItems = [
    G.items.bow,
    G.items.helmet,
    G.items.shoes,
    G.items.gloves,
    G.items.coat,
];
export const t1WarriorItems = [
    G.items.blade,
    G.items.helmet,
    G.items.shoes,
    G.items.gloves,
    G.items.coat,
];

export async function chooseUpgradeItem() {
    // Loop through all the t1MageItems
    // If we find an item that's t7 or higher, move on to the next item
    // If we can't find an item that's t7 or higher on our character or in our inventory, upgrade the first item that's not t7 or higher
    let characterSet = null;

    if (character.id === "Fireblats") {
        characterSet = t1MageItems;
    } else if (character.id === "FireblatsR") {
        characterSet = t1RangerItems;
    } else if (character.id === "FireblatsW") {
        characterSet = t1WarriorItems;
    }

    if (characterSet === null) {
        characterSet = t1MageItems;
    }

    for (const [, value] of Object.entries(characterSet)) {
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

export async function needScrolls() {
    if (locate_item("scroll0") === -1) {
        safe_log(`We don't have any scrolls.`);
        return -1;
    }

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

export async function buyScrolls(currentScrollQuantity: number) {
    safe_log(`Scrolls made us teleport to town.`);
    await teleportIfWeNeedTo();
    safe_log("Buying scrolls...");

    // Walk to scroll vendor
    if (!smart.moving) {
        await smart_move({ x: customCharacters.Lucas.x, y: customCharacters.Lucas.y });
    }

    const pricePerScroll = G.items.scroll0.g;
    const goldNeeded =
        (defaultSettingsProxy.amountScrollsToBuy - currentScrollQuantity) * pricePerScroll;

    // If we don't have enough gold, return
    if (character.gold < goldNeeded) {
        safe_log(`Not enough gold to buy scrolls. Needed: ${goldNeeded}, Have: ${character.gold}`);
        defaultSettingsProxy.upgrade_mode = false;
    } else {
        // Purchase scrolls
        buy("scroll0", defaultSettingsProxy.amountScrollsToBuy - currentScrollQuantity);
        safe_log(
            // eslint-disable-next-line prettier/prettier
            `Bought ${defaultSettingsProxy.amountScrollsToBuy - currentScrollQuantity
            } scrolls for ${goldNeeded} gold`,
        );
    }
}

export async function walkToUpgradeNpc() {
    // Walk to upgrade NPC
    if (!smart.moving) {
        await smart_move({ x: customCharacters.Cue.x, y: customCharacters.Cue.y });
    }
}

export async function upgradeItem() {
    safe_log(`Upgrading ${defaultSettingsProxy.upgradeItem.id}`);
    const itemToUpgrade: number = locate_item(defaultSettingsProxy.upgradeItem.id as ItemKey);
    const scrollItem: number = locate_item("scroll0");

    const success = await upgrade(itemToUpgrade, scrollItem);

    if (success) {
        safe_log(`Upgraded ${defaultSettingsProxy.upgradeItem.id} successfully`);
    } else {
        safe_log(`Failed to upgrade ${defaultSettingsProxy.upgradeItem.id}, item is lost.`);
    }
}

// Check if we have the item to upgrade in the first place.
export async function doNeedItemForUpgrade() {
    // Loop through our inventory slots
    for (const [key, value] of Object.entries(character.items)) {
        // If the slot is not null and the item name matches the item we're looking for, we found the item
        if (
            value !== null &&
            value !== undefined &&
            value.name === defaultSettingsProxy.upgradeItem.id
        ) {
            safe_log(`Found ${defaultSettingsProxy.upgradeItem.id} in slot ${key}`);
            return false;
        }
    }

    return true;
}

export async function buyItemForUpgrade() {
    // Walk to item vendor
    if (!smart.moving) {
        await smart_move({ x: customCharacters.Gabriel.x, y: customCharacters.Gabriel.y });
    }

    // Buy item
    await buy(defaultSettingsProxy.upgradeItem.id as ItemKey, 1);
}

export async function equipHighestLevelItem() {
    // Find the item in our inventory
    const staffInventoryPosition: number = locate_item(
        defaultSettingsProxy.upgradeItem.id as ItemKey,
    );
    let inventoryStaffLevel: number;
    let equipmentStaffSlot: SlotType | null = null;
    let equipmentStaffLevel = 0;

    if (
        staffInventoryPosition !== undefined &&
        staffInventoryPosition !== null &&
        staffInventoryPosition !== -1
    ) {
        inventoryStaffLevel = character.items[staffInventoryPosition].level as number;
    } else {
        return;
    }

    // Find the item in our equipment slots
    for (const [key, value] of Object.entries(character.slots)) {
        // If the slot is not null and the item name matches the item we're looking for, we found the item
        if (
            value !== null &&
            value !== undefined &&
            value.name === (defaultSettingsProxy.upgradeItem.id as ItemKey)
        ) {
            equipmentStaffSlot = key as SlotType;
            equipmentStaffLevel = value.level as number;
            break;
        }
    }

    if (equipmentStaffSlot === undefined || equipmentStaffSlot === null) return;

    // If the one in our inventory is higher level, equip it.
    if (inventoryStaffLevel > equipmentStaffLevel) {
        equip(staffInventoryPosition, equipmentStaffSlot as SlotType);
        safe_log(`Equipped ${defaultSettingsProxy.upgradeItem.id} from inventory`);
    }
}

export async function upgradeItems() {
    // If all items are upgraded, return
    if (defaultSettingsProxy.allItemsUpgraded) {
        safe_log(`Current allItemsUpgraded: ${defaultSettingsProxy.allItemsUpgraded}`);
        safe_log("All items upgraded, returning");
        return;
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
        return;
    }

    // If we're not in upgrade mode, return
    if (!defaultSettingsProxy.upgrade_mode) return;

    // Choose an item to upgrade
    if (!chooseUpgradeItem()) {
        defaultSettingsProxy.allItemsUpgraded = true;
        defaultSettingsProxy.upgrade_mode = false;
        safe_log("All items upgraded, returning");
        return;
    }
    safe_log(`upgrading item: ${defaultSettingsProxy.upgradeItem.id}`);

    // If character not in town, teleport to town
    if (defaultSettingsProxy.doTeleportToTown === true) {
        await teleportIfWeNeedTo();
        defaultSettingsProxy.doTeleportToTown = false;
    }

    const currentScrolls = await needScrolls();
    const needItemForUpgrade = await doNeedItemForUpgrade();
    if (currentScrolls) {
        await buyScrolls(currentScrolls);
    }
    if (needItemForUpgrade) {
        safe_log(`We don't have ${defaultSettingsProxy.upgradeItem.id}, going to buy it.`);

        // Do we have enough gold to buy the item?
        if (
            defaultSettingsProxy.upgradeItem.id !== undefined &&
            character.gold < G.items[defaultSettingsProxy.upgradeItem.id as ItemKey].g
        ) {
            safe_log(`We don't have enough gold to buy ${defaultSettingsProxy.upgradeItem.id},
             killing monsters to get gold.`);
            defaultSettingsProxy.upgrade_mode = false;
            defaultSettingsProxy.attack_mode = true;
            return;
        }

        await buyItemForUpgrade();
    }

    await equipHighestLevelItem();

    // If we're not in upgrade mode, return
    if (!defaultSettingsProxy.upgrade_mode) return;

    // If we have less than the set amount of gold, stop upgrading
    if (character.gold < defaultSettingsProxy.minimumGoldToStopUpgrading) {
        defaultSettingsProxy.upgrade_mode = false;
        defaultSettingsProxy.attack_mode = true;
        return;
    }

    safe_log(`Walking to upgrade NPC`);
    await walkToUpgradeNpc();

    // Upgrade item
    await upgradeItem();

    // Keep upgrading until we've gotten to the minimum gold.
    await upgradeItems();
}
