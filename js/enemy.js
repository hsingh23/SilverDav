/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * An example Entity derived character.
 * See the guy in the clinic.
 */
function Enemy() {
	name = "wolf";
	var Enemy = Object.beget(Entity);
	Enemy.name = name;
	
	//set the fields based on the name from enemy.json
	JsonNode = new JsonFile({src:"content/enemies.json"}, null, false);
	
	Enemy.key = JsonNode.info[name].key;
	Enemy.attack = JsonNode.info[name].attack;
	Enemy.speed = JsonNode.info[name].statistics.speed;
	Enemy.strength = JsonNode.info[name].statistics.strength;
	Enemy.dexterity = JsonNode.info[name].statistics.dexterity;
	Enemy.intelligence = JsonNode.info[name].statistics.intelligence;
	Enemy.stamina = JsonNode.info[name].statistics.stamina;
	
	localEnemies.push(this);
	
	return this;
}

Enemy.prototype = new Entity();

Enemy.prototype._setupBase = Enemy.prototype.setup;
Enemy.prototype.setup = function setupEnemy(descriptor, map, cellSize, loader, output) {
	this._setupBase(descriptor, map, cellSize, loader, output);
};
//some mode of detection is required

//then the enemy chases the player

//then the enemy attempts to hit the player

//if hit the enemy is destroyed
function destroy(entity){
	entity.delete;
}


if (typeof Object.beget !== 'function') {
    Object.beget = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    };
}