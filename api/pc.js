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
function PC(descriptor, map, cellSize, loader, input, output) {
	this.input = input;
	this.setup(descriptor, map, cellSize, loader, output);
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
	if (this.input.isKeyDown(KEY.W) || this.input.isButtonDown(this.input.BUTTON.UP)) {
		this.move(this.DIRECTION.UP, 'walk', true);
	} else if (this.input.isKeyDown(KEY.S) || this.input.isButtonDown(this.input.BUTTON.DOWN)) {
		this.move(this.DIRECTION.DOWN, 'walk', true);
	} else if (this.input.isKeyDown(KEY.A) || this.input.isButtonDown(this.input.BUTTON.LEFT)) {
		this.move(this.DIRECTION.LEFT, 'walk', true);
	} else if (this.input.isKeyDown(KEY.D) || this.input.isButtonDown(this.input.BUTTON.RIGHT)) {
		this.move(this.DIRECTION.RIGHT, 'walk', true);
	}
	
	// Basic action
	if (this.input.isButtonPressed(this.input.BUTTON.A) || this.input.isKeyPressed(KEY.SPACE)) {
		this.use();
	}

	// Check for warping on entering a tile
	stopped = this._updateBase(elapsedTime);
	if (stopped) {
		this._transitionAndWarp();
	}
};

/**
 * Transports the PC through a warp
 */
PC.prototype._transitionAndWarp = function transitionAndWarp() {
	var warp, cell;
	this.map = this.targetData.map;
	this.location.point.set(this.targetData.column, this.targetData.row);
	warp = this.map.getWarpTarget(this.targetData.row, this.targetData.column);
	if (warp !== undefined) {
		cell = warp.targetMap.getWarpByName(warp.targetWarp);
		if (cell !== undefined) {
			this.map = warp.targetMap;
			this.location.point.set(cell.column, cell.row);
		}
	}
};

/**
 * Attempts to execute the onUse function of an entity infront of the PC.
 */
PC.prototype.use = function use() {
	var front = {}, tileData, entity;
	if (this.facing === this.DIRECTION.NONE) { return; }
	
	front.x = Math.round(this.location.point.x);
	front.y = Math.round(this.location.point.y);
	front[this.facing.axis] += this.facing.sign;
	tileData = (this.map.getTile(front.y, front.x)).data;
	entity = tileData.map.checkHasEntity(tileData.row, tileData.column);
	if (entity !== null && entity.onUse !== undefined) {
		entity.onUse(this);
	}
};