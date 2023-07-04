// Import mainLoop from Fireblats_Mage.ts
import { mainLoop as Fireblats_Mage } from "./Fireblats_Mage";

if (character.id === "Fireblats" || character.ctype === "mage") {
    safe_log("warriors come out and play");
    // Run Fireblats_Mage.ts
    Fireblats_Mage();
} else {
    safe_log("test******************************");
}
