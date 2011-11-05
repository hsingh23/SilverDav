/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * An example Entity derived character.
 * See the guy in the clinic.
 */
function Enemy(type) {
	//set the fields based on the type from enemy.json
	var Enemy = Object.beget(Entity);
	Enemy.type = type;
	
	
	return Enemy;
}



//some mode of detection is required

//then the enemy chases the player

//then the enemy attempts to hit the player

//if hit the enemy is destroyed

if (typeof Object.beget !== 'function') {
    Object.beget = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    };
}