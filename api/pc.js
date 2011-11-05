/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * PC - Player Character/Player Controller.
 * Extends the Entity object for a player controlled character.
 *
 * Modify or use as a template for your own player character.
 */
require('js/stab.js');
var key=0;
var keys=0;
var old=0;
var oldm=null;

sta=Object();
function PC(descriptor, map, cellSize, loader, input, output) {
	this.input = input;
	this.setup(descriptor, map, cellSize, loader, output);
	sta = new stab({"sprite": "beamSword", "position": {x:12, y:13}}, map, cellSize, loader);
}

PC.prototype = new Entity();
PC.prototype.input = null;




PC.prototype._updateBase = PC.prototype.update;
/**
 * Adds basic movement and interaction controls
 *
 * @param elapsedTime <number> Time since the last update in ms.
 */
PC.prototype.update = function updatePC(elapsedTime) {
	var stopped;

	// Basic movement controls - feel free to change

	
	if(this.input.isKeyDown(KEY.W) || this.input.isButtonDown(this.input.BUTTON.UP)) {
var keys=0;

		this.move(this.DIRECTION.UP, 'walk', true);
	} else if(this.input.isKeyDown(KEY.S) || this.input.isButtonDown(this.input.BUTTON.DOWN)) {
		this.move(this.DIRECTION.DOWN, 'walk', true);
	} else if(this.input.isKeyDown(KEY.A) || this.input.isButtonDown(this.input.BUTTON.LEFT)) {
		this.move(this.DIRECTION.LEFT, 'walk', true);
	} else if(this.input.isKeyDown(KEY.D) || this.input.isButtonDown(this.input.BUTTON.RIGHT)) {
		this.move(this.DIRECTION.RIGHT, 'walk', true);
	} else if(this.input.isKeyDown(KEY.ARROW_UP)) {
		this.attack(this.DIRECTION.UP, 'walk', true);
	} else if(this.input.isKeyDown(KEY.ARROW_DOWN)) {
		this.attack(this.DIRECTION.DOWN, 'walk', true);
	} else if(this.input.isKeyDown(KEY.ARROW_LEFT)) {
		this.attack(this.DIRECTION.LEFT, 'walk', true);
	} else if(this.input.isKeyDown(KEY.ARROW_RIGHT)) {
		this.attack(this.DIRECTION.RIGHT, 'walk', true);
	}

	else if (this.input.isKeyDown(KEY[1]) || this.input.isButtonDown(this.input.BUTTON.RIGHT)) {
		this.move(this.DIRECTION.RIGHT, 'walk', true);
	}
		else if (this.input.isKeyDown(KEY[2]) || this.input.isButtonDown(this.input.BUTTON.RIGHT)) {
		this.move(this.DIRECTION.RIGHT, 'walk', true);
	}
	else if (this.input.isKeyDown(KEY[3]) || this.input.isButtonDown(this.input.BUTTON.RIGHT)) {
		this.move(this.DIRECTION.RIGHT, 'walk', true);
	}
	else if (this.input.isKeyDown(KEY[4]) || this.input.isButtonDown(this.input.BUTTON.RIGHT)) {

		game.ps.delete;

		console.log("log is working");
	}
	

	// Basic action
	if(this.input.isButtonPressed(this.input.BUTTON.A) || this.input.isKeyPressed(KEY.SPACE)) {
		this.use(); 
		console.log("use is being called stage3");
	}

	// Check for warping on entering a tile
	stopped = this._updateBase(elapsedTime);
	if(stopped) {
		console.log("no");
		this._transitionAndWarp();
		console.log("yes");
	}
};
/**
 * Transports the PC through a warp
 */
PC.prototype._transitionAndWarp = function transitionAndWarp() {
	//reset local enemies
	var localEnemies = [];
	var warp, cell;
	this.mkeyap = this.targetData.map;
	this.location.point.set(this.targetData.column, this.targetData.row);
	warp = this.map.getWarpTarget(this.targetData.row, this.targetData.column);
	if(warp !== undefined) {
		cell = warp.targetMap.getWarpByName(warp.targetWarp);
		if(cell !== undefined) {
			this.map = warp.targetMap;
			this.location.point.set(cell.column, cell.row);
		}
	}
};
/**
 * Attemptkeys to execute the onUse function of an entity infront of the PC.
 */
PC.prototype.use = function use() {
	var front = {}, tileData, entity;
	if(this.facing === this.DIRECTION.NONE) {
		return;
	}
	console.log("use is being called0 2");
	front.x = Math.round(this.location.point.x);
	front.y = Math.round(this.location.point.y);
	front[this.facing.axis] += this.facing.sign;
	tileData = (this.map.getTile(front.y, front.x)).data;
	entity = tileData.map.checkHasEntity(tileData.row, tileData.column);
	if(entity !== null && entity.onUse !== undefined) {
		entity.onUse(this);
	}
}

PC.prototype.getKey = function key(name) {
	console.log("add one", keys);
	keys=keys+1;
	if (keys === 6 ){if (oldm!==null){oldm.location.point.x = 1000;}}
	console.log("end", keys);
	name.location.point.x = 1000;
	
	console.log(name);
	
	
	
};
PC.prototype.getold = function old(name) {
	
	if (keys === 6 ){name.location.point.x = 1000;name.output.setMessage(["'You have all the keys. You may go on!"]);}
	oldm=name;
	console.log("end", keys);
	
	console.log(name);

};
