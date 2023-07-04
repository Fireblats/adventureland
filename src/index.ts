// Import mainLoop from Fireblats_Mage.ts
import { mainLoop as Fireblats_Mage } from "./Fireblats_Mage";
import { mainLoop as Fireblats_Warrior } from "./Fireblats_Warrior";
import { mainLoop as Fireblats_Ranger } from "./Fireblats_Ranger";
import { mainLoop as Fireblats_Rogue } from "./Fireblats_Rogue";

// @TODO: Create party manager to determine a leader and invite party members.
// @TODO: Create an emergency teleport function if HP is below 10%.
// @TODO: Respawn if dead.
// @TODO: Flesh out the warrior class so he attacks properly.
// @TODO: Take a gander at some of the skills, maybe we can use them.

switch (character.id || character.ctype) {
    case "Fireblats" || "mage":
        safe_log("Mage detected, activating Fireblats_Mage.ts");
        Fireblats_Mage();
        break;

    case "FireblatsW" || "warrior":
        safe_log("Warrior detected, activating Fireblats_Warrior.ts");
        Fireblats_Warrior();
        break;

    case "FireblatsR" || "ranger":
        safe_log("Ranger detected, activating Fireblats_Ranger.ts");
        Fireblats_Ranger();
        break;

    case "FireblatsRo" || "rogue":
        safe_log("Rogue detected, activating Fireblats_Rogue.ts");
        Fireblats_Rogue();
        break;

    default:
        safe_log("Failed to load character/class file.");
        break;
}
