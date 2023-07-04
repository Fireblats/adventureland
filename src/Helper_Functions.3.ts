import { defaultSettingsProxy } from "./StorageManager";
import { customCharacters } from "./CustomCharacters";

export function is_in_party(potentialPartyMember: string): boolean {
    const party = get_party();
    if (party[potentialPartyMember]) return true;
    return false;
}

export function PartyManager(leader: boolean) {
    // Leader invites
    if (leader) {
        for (const chars of get_characters()) {
            if (chars.name === character.id) {
                game_log(`Can't invite self to party: ${chars.name}`, "#ffff00");
                continue;
            }

            if (!is_in_party(chars.name) && chars.online !== 0) {
                game_log(`Sending party invite to ${chars.name}`, "#ffff00");
                send_party_invite(chars.name);
                continue;
            }
        }
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
// Function: print(message)
// Prints a message to the game console using the <code>safe_log</code> function
//
// Parameters:
//     message - The message to print
export async function print(message: any) {
    safe_log(message);
}

/**
 * Returns the total quantity of a given item in the character's inventory.
 * @param {string} item_name - The name of the item to search for.
 * @returns {number} The total quantity of the item in the character's inventory.
 */
export function get_item_quantity(item_name: string): number {
    if (item_name === null || item_name === undefined) return 0;
    let quantity = 0;
    for (let i = 0; i < character.items.length; i++) {
        if (character.items[i] == null) {
            break;
        }
        if (character.items[i] !== undefined && character.items[i].name === item_name) {
            quantity += character.items[i].q ?? 0;
        }
    }
    return quantity;
}

/**
 * Checks if a given item exists in the character's inventory.
 * @param {string} item_name - The name of the item to search for.
 * @returns {boolean} True if the item exists in the character's inventory, false otherwise.
 */
export function item_exists(item_name: string): boolean {
    for (let i = 0; i < character.items.length; i++) {
        if (character.items[i] == null) {
            break;
        }
        if (character.items[i].name === item_name) {
            return true;
        }
    }

    return false;
}

export async function customHPandMP() {
    if (character.hp < character.max_hp - 200) {
        use_skill("use_hp");
    }
    if (character.mp < character.max_mp - 300 || character.mp < 20) {
        use_skill("use_mp");
    }
}

export function Test_Func() {
    print("Test_Func");
}

export async function teleportToTown() {
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

export async function teleportIfWeNeedTo() {
    if (character.map === "main" && Math.abs(character.x) < 500 && Math.abs(character.y) < 500) {
        await teleportToTown();
    }
}

export async function checkHealthPotions() {
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
        safe_log("Potions are making us teleport to town.");
        await teleportIfWeNeedTo();
        safe_log(`defaultSettingsProxy.buyingPotions: ${defaultSettingsProxy.buyingPotions}`);
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
