import { customHPandMP, checkHealthPotions, PartyManager } from "./Helper_Functions.3";
import { defaultSettingsProxy, createDefaultSettings } from "./StorageManager";
import { battleMonsters } from "./MonsterManager";
import { upgradeItems } from "./UpgradeManager";
import { customMonsters } from "./CustomMonsters";

const maxHitsToKill = 3; // The maximum number of hits to kill a monster, this determines which monsters to attack.
const leader = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function on_party_invite(name: string) {
    if (name === "MyChar") {
        accept_party_invite(name);
    }
}

createDefaultSettings();

// Main Loop
export async function mainLoop() {
    PartyManager(leader);
    await customHPandMP();
    await checkHealthPotions(); // Needs done by id
    await upgradeItems(); // Needs ID check

    const lastMonster = defaultSettingsProxy.currentMonster.name;
    await battleMonsters(
        defaultSettingsProxy.currentMonster as unknown as typeof customMonsters,
        maxHitsToKill,
        leader,
    ); // Needs ID check
    if (lastMonster !== defaultSettingsProxy.currentMonster.name) {
        safe_log(`Switched to ${defaultSettingsProxy.currentMonster.name}`);
    }

    loot();

    setTimeout(mainLoop, 1000 / 4); // Loops every 1/4 seconds.
}
