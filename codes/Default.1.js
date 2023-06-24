load_code("Helper_Functions");

// This code is for the coding game "Adventure Land"
// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!


// Monsters
var monsters = {
	"Bee": {
		"x": 496.78379392236116,
		"y": 1028.891401478082,
		"skin": "bee"
	},
	"Crab": {
		"x": -1109.817804196006,
		"y": -22.08245134980268,
		"skin": "crab"
	}
}

var characters = {
	// Upgrade Scrolls
	"Lucas": {
		"x": -460.9737110795928,
		"y": -77.41004909360228
	},
	// T1 Weapons
	"Gabriel": {
		"x": -89.26400993247745,
		"y": -143.6246820060477
	},
	// Upgrading
	"Cue": {
		"x" : -207.37506379157145,
		"y" : -184.9999999
	}
}

const items = {
	"Upgrade_Scroll": {
		"low_grade" : {
			"id" : "scroll0",
			"vendor" : "Lucas"
		},
		"mid_grade" : {
			"id" : "scroll1",
			"vendor" : "Lucas"
		},
		"high_grade" : {
			"id" : "scroll2",
			"vendor" : "Lucas"
		}
	},
	"Compound_Scroll": {
		"low_grade" : "scroll0",
		"mid_grade" : "scroll1",
		"high_grade" : "scroll2"
	},
	"Stat_Scroll": {
		"str" : "strscroll",
		"int" : "intscroll",
		"dex" : "dexscroll",
	},
	"Weapons": {
		"T1": {
			"Staff": {
				"price": 12400,
				"scroll": "scroll0",
				"vendor": "Gabriel",
				"id": "staff"
			}
		}

	}

}


// Defines the shape of the settings object
const settings_shape = {
	reset_settings_to_default: false,
	attack_mode: true,
	debug: false,
	max_health_potions: 200,
	max_mana_potions: 200,
	min_health_potions: 10,
	min_mana_potions: 10,
	farm_monster: "Crab",
	current_upgrade: items.Weapons.T1.Staff,

	min_upgrade_scrolls: 0,
	max_upgrade_scrolls: 20,
	min_upgrade_money: 15000,
	max_upgrade_money: 75000,
	upgrading: false
};


// Global Vars
const default_settings = {
	reset_settings_to_default: false,
	attack_mode: true,
	debug: false,
	max_health_potions: 200,
	max_mana_potions: 200,
	min_health_potions: 10,
	min_mana_potions: 10,
	farm_monster: "Crab",
	current_upgrade: items.Weapons.T1.Staff,
	min_upgrade_scrolls: 0,
	max_upgrade_scrolls: 20,
	min_upgrade_money: 15000,
	max_upgrade_money:75000,
	upgrading: false
};


function test_func(){
	console.log("test_func");
	set_message("test_func");
	print("test_func");
	game_log("test_func");
}


function custom_use_hp_or_mp(){
	if(character.hp<character.max_hp-200){
		use('use_hp');
	}
	if(character.mp<character.max_mp-300){
		use('use_mp');
	}
}


function custom_buy_potions(){
	// Potion Costs
	const hp_cost = 20;
	const mp_cost = 20;
	const total_hp_cost = settings_proxy.max_health_potions * hp_cost;
	const total_mp_cost = settings_proxy.max_mana_potions * mp_cost;

	// Get amount of potions in inventory
	let current_hp_potions = 0
	let current_mp_potions = 0

	for (var i = 0; i < character.items.length; i++) {
		if(character.items[i] == null){
			break;
		}
		if(character.items[i].name == "hpot0"){
			current_hp_potions += character.items[i].q;
		} else if(character.items[i].name == "mpot0"){
			current_mp_potions += character.items[i].q;
		}
		else {
			break;
		}
	}

	// If we have enough potions, return
	if(current_hp_potions >= settings_proxy.min_health_potions && current_mp_potions >= settings_proxy.min_mana_potions){
		settings_proxy.attack_mode = true;
		return;
	} else {
		settings_proxy.attack_mode = false;
	}

	// If we don't have enough gold to buy all the potions, return
	if(character.gold < total_hp_cost + total_mp_cost){
		print("Not enough gold to buy potions.");
		settings_proxy.attack_mode = true;
		return;
	}

	// Cast town portal
	if(!is_on_cooldown("use_town")){
		use_skill("use_town");
	}

	// Wait for town portal to cast
	while(is_on_cooldown("use_town")){
		print("Waiting for town portal to cast.");
		sleep(1000);
	}

	// Buy potions
	buy("hpot0", settings_proxy.max_health_potions - current_hp_potions);
	buy("mpot0", settings_proxy.max_mana_potions - current_mp_potions);

	// Travel to potion seller.
	// Are we in town?
}


function get_item(item_name){
	for (var i = 0; i < character.items.length; i++) {
		if(character.items[i] == null){
			break;
		}
		if(character.items[i].name == item_name){
			return character.items[i];
		}
	}
	return null;
}


function buy_weapon(weapon){
	// Move to vendor
	smart_move({x: characters[weapon.vendor].x, y: characters[weapon.vendor].y});

	// Wait for movement to finish
	while(character.moving){
		sleep(1000);
	}

	// Buy weapon
	buy(weapon.id);

	// Wait for purchase to finish
	while(is_on_cooldown("buy")){
		sleep(1000);
	}

	// Make sure weapon is in inventory
	if(item_exists(weapon.id)){
		print("Purchased weapon: " + weapon.id);
	}
	else {
		print("Failed to purchase weapon: " + weapon.id);
	}
}


function load_settings(){
	// Reset settings to default
	if(default_settings.reset_settings_to_default) {
		localStorage.clear();
	}

	// Create local storage if it doesn't exist
	if(localStorage.getItem("settings") == null || localStorage.getItem("settings") == undefined) {
		let settingsString = JSON.stringify(default_settings);
		localStorage.setItem("settings", settingsString);
		return settings;
	}

	// Load settings from local storage
	let settingsString = localStorage.getItem("settings");
	let settings = JSON.parse(settingsString);
	return settings;
}


// Define a function to save settings to local storage
function save_settings(){
	localStorage.setItem("settings", JSON.stringify(settings_proxy));
}


function Is_In_Range(target){
	const char_x = character.real_x;
	const char_y = character.real_y;
	const target_x = target.x;
	const target_y = target.y;

	const distance = Math.sqrt(Math.pow(char_x - target_x, 2) + Math.pow(char_y - target_y, 2));

	if(distance > 30 || distance < -30){
		return false;
	}

	return true;
}


async function Upgrade_Items(){
	// Search inventory for weapon to upgrade
	let have_weapon = false;
	let current_gold = character.gold;

	if(current_gold < min_upgrade_money){
		print("Not enough gold left to upgrade.");
		settings_proxy.upgrading = false;
		return;
	}

	if(item_exists(current_upgrade.id)){
		have_weapon = true;
	} else {
		print('You need to purchase the weapon.');
	}

	if(!have_weapon){
		print("Could not find weapon to upgrade. Buying new weapon.");
		buy_weapon(current_upgrade);
	}

	// If item is already at t7, return
	if(get_item(current_upgrade.id).level >= 7){
		print("Item is already at t7.");
		return;
	}

	// Upgrade scrolls
	let upgrade_scroll = items.Upgrade_Scroll[current_upgrade.scroll];
	let upgrade_scroll_quantity = get_item_quantity(upgrade_scroll);

	// If we don't have enough scrolls, buy more
	if(upgrade_scroll_quantity < min_upgrade_scrolls){
		// Make sure we have enough gold to buy scrolls
		if(character.gold < upgrade_scroll.price * (max_upgrade_scrolls - upgrade_scroll_quantity)){
			print("Not enough gold to buy scrolls.");
			return;
		}

		// Move to upgrade scroll vendor
		if(!smart.moving) {
			await smart_move({x: characters[upgrade_scroll.vendor].x, y: characters[upgrade_scroll.vendor].y});
		}

		// Buy scrolls
		buy(upgrade_scroll.id, max_upgrade_scrolls - upgrade_scroll_quantity);

		// Wait for purchase to finish
		while(is_on_cooldown("buy")){
			sleep(1000);
		}

		// Make sure scrolls are in inventory
		if(item_exists(upgrade_scroll.id)){
			print("Purchased scrolls: " + upgrade_scroll.id);
		}
		else {
			print("Failed to purchase scrolls: " + upgrade_scroll.id);
		}
	}

	// Walk to Cue if we aren't there.
	if(character.real_x != characters.Cue.x || character.real_y != characters.Cue.y){
		print("Walking to Cue");
		if(!smart.moving){
			await smart_move({x: characters.Cue.x, y: characters.Cue.y});
		}
		return;
	}


	// If we aren't already upgrading, start upgrading
	if(!is_on_cooldown("upgrade")){
	// Upgrade the item
		upgrade(locate_item(current_upgrade.id),locate_item(current_upgrade.scroll)).then(
			function(data){
				game_log("Upgrade call completed");
			},
			function(data){
				game_log("Upgrade call failed with reason: "+data.reason);
			},
		);
	}
}


// Load settings
var settings = load_settings();
let settings_proxy = new Proxy(settings_shape, {
	set: function(target, property, value, receiver) {
		target[property] = value;
		save_settings();
		return true;
	}
});

// Main Loop
setInterval(async function () {

	// Custom functions
	custom_use_hp_or_mp();
	custom_buy_potions();
	await loot();

	// Upgrade items
	if (character.gold >= settings_proxy.max_upgrade_money) {
		print("Upgrading items");
		settings_proxy.upgrading = true;
		await Upgrade_Items();
		return;
	}

	// Don't do anything if we're not in attack mode, dead, or moving
	if (!attack_mode || character.rip || is_moving(character)) return;

	// Debug info
	if (debug) {
		print("Character position: " + character.real_x + ", " + character.real_y);
	}

	// Move to the monster
	if (character.real_x != monsters[farm_monster].x || character.real_y != monsters[farm_monster].y) {
		smart_move({ x: monsters[farm_monster].x, y: monsters[farm_monster].y });
		return;
	}

	// Get the target
	var target = get_targeted_monster();
	if (!target) {
		target = get_nearest_monster({ min_xp: 150, max_att: 100, max_xp: 1000 });
		if (target) change_target(target);

		else {
			set_message("No Monsters");
			return;
		}
	}

	// Move towards the monster if we're not in range
	if (!is_in_range(target)) {
		move(
			character.x + (target.x - character.x) / 2,
			character.y + (target.y - character.y) / 2
		);
		// Walk half the distance
	}

	// Attack the monster
	else if (can_attack(target)) {
		set_message("Attacking");
		attack(target);
	}

}, 1000 / 4); // Loops every 1/4 seconds.

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland