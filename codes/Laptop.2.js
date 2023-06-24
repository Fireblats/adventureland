// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!

// Global Vars
var attack_mode=false;
var max_health_potions = 200;
var max_mana_potions = 200;

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
	const total_hp_cost = max_health_potions * hp_cost;
	const total_mp_cost = max_mana_potions * mp_cost;

	// If we don't have enough gold to buy all the potions, return
	if(character.gold < total_hp_cost + total_mp_cost){
		return;
	}

	// Travel to potion seller.
	console.log("Character position: " + character.real_x + ", " + character.real_y);
}

setInterval(function(){

	custom_use_hp_or_mp();
	loot();
	custom_buy_potions();

	if(!attack_mode || character.rip || is_moving(character)) return;

	var target=get_targeted_monster();
	if(!target)
	{
		target=get_nearest_monster({min_xp:150,max_att:300});
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}

	if(!is_in_range(target))
	{
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		set_message("Attacking");
		attack(target);
	}

},1000/4); // Loops every 1/4 seconds.

// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
