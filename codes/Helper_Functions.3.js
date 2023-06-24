// A file containing common functions used throughout the project

// Function: print(message)
// Prints a message to the game console using the <code>safe_log</code> function
//
// Parameters:
//     message - The message to print
async function print(message){
	safe_log(message);
}


/**
 * Returns the total quantity of a given item in the character's inventory.
 * @param {string} item_name - The name of the item to search for.
 * @returns {number} The total quantity of the item in the character's inventory.
 */
function get_item_quantity(item_name){
	let quantity = 0;
	for (var i = 0; i < character.items.length; i++) {
		if(character.items[i] == null){
			break;
		}
		if(character.items[i].name == item_name){
			quantity += character.items[i].q;
		}
	}
	return quantity;
}


/**
 * Checks if a given item exists in the character's inventory.
 * @param {string} item_name - The name of the item to search for.
 * @returns {boolean} True if the item exists in the character's inventory, false otherwise.
 */
function item_exists(item_name){
	for (var i = 0; i < character.items.length; i++) {
		if(character.items[i] == null){
			break;
		}
		if(character.items[i].name == item_name){
			return true;
		}
	}
	return false;
}


/**
 * Sleeps for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep for.
 * @returns {Promise<void>} A promise that resolves after the specified time has elapsed.
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}