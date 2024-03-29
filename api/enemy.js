/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * An example Entity derived character.
 * See the guy in the clinic.
 */
function Enemy(name) {
	var Enemy = Object.beget(Entity);
	Enemy.name = name;
	
	//set the fields based on the name from enemy.json
	JsonNode = JsonFile({"\\content\\enemies.json"}, null, true);
	Enemy.key = JsonNode[name].key;
	Enemy.attack = JsonNode[name].attack;
	Enemy.speed = JsonNode[name].statistics.speed;
	Enemy.strength = JsonNode[name].statistics.strength;
	Enemy.dexterity = JsonNode[name].statistics.dexterity;
	Enemy.intelligence = JsonNode[name].statistics.intelligence;
	Enemy.stamina = JsonNode[name].statistics.stamina;
	
	return Enemy;
}



//some mode of detection is required

//then the enemy chases the player

//then the enemy attempts to hit the player

//if hit the enemy is destroyed
function destroy(){
	this.delete;
}


if (typeof Object.beget !== 'function') {
    Object.beget = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    };
}