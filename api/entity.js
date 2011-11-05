/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.01
 * @license LGPL
 *
 * The Entity represent a game world object and handles
 * updating and drawing a sprite in the world.
 */

/**
 * Creates a blank Entity.
 * Use setup to intialize the entity after the content has been loaded.
 *
 * Map json files may contain a property "entities" which is an array of
 * entity descriptor objects. Descriptors can include:
 *     // The key for the spriteSheet to be used (required)
 *     "sprite": <string>
 *
 *     // The world coordinates of the entity (default: 0,0)
 *     "position": {x: <integer>, y: <integer>}
 *
 *     // The number of cells the entity occupies (default: 1,1)
 *     "dimensions": {width: <integer>, height: <integer>}
 *
 *     // The name of the constructor to use (default: Entity)
 *     "type": <string>
 */
function Entity() {
	this.location = new Rectangle(0, 0, 1, 1);
	this.target = new Point();
	return this;
}

Entity.prototype = {
	output : null,
	location : null, // world location and size
	sprite : null,
	map : null,
	cellSize : null,
	DIRECTION : {
		UP : {
			name : '-up',
			axis : 'y',
			sign : -1
		},
		DOWN : {
			name : '-down',
			axis : 'y',
			sign : 1
		},
		LEFT : {
			name : '-left',
			axis : 'x',
			sign : -1
		},
		RIGHT : {
			name : '-right',
			axis : 'x',
			sign : 1
		},
		NONE : null
	},
	movement : null,
	attacking : null,
	facing : null,
	target : null,
	targetData : null,
	speed : 1 / 250, // tiles per ms
	onUse : undefined,

	/**
	 * Initializes the entity.
	 *
	 * @param descriptor <object> see Constructor. Data used to initialize.
	 * @param map <Map> The on which the entity resides.
	 * @param cellSize <Rectangle> The size of a cell of the viewport.
	 * @param loader <ContentLoader> The content loader object.
	 */
	setup : function setupEntity(descriptor, map, cellSize, loader, output) {
		var spriteSheet, metric;

		this.cellSize = new Size(Math.floor(cellSize.width), Math.floor(cellSize.height));

		if(descriptor.hasOwnProperty('position')) {
			this.location.point.copy(descriptor.position);
		}

		if(descriptor.hasOwnProperty('dimensions')) {
			this.location.size.copy(descriptor.dimensions);
		}

		if(descriptor.hasOwnProperty('sprite')) {
			spriteSheet = loader.getContent('SpriteSheet', descriptor.sprite);
			metric = new Rectangle(0, 0, this.location.size.width * this.cellSize.width, this.location.size.height * this.cellSize.height);
			this.sprite = new Sprite(spriteSheet, metric);
			this.speed = 1 / (spriteSheet.frames * spriteSheet.exposure);

			if(descriptor.hasOwnProperty('animation')) {
				this.sprite.playAnimation(descriptor.animation[1], descriptor.animation[2], descriptor.animation[3]);
				if(!descriptor.animation[0]) {
					this.sprite.stopAnimation(true);
				}
			}
		}

		if(descriptor.hasOwnProperty('onUse')) {
			eval("this.onUse = " + descriptor.onUse);
		}

		this.map = map;
		this.output = output;
	},
	/**
	 * Set the entity's state to move one tile in a given direction.
	 *
	 * @param direction <this.DIRECTION> The direction to move.
	 * @param mode <string> The type of movement. Should be the first part of the
	 *     movement animation name (eg animation:'walk-left' then mode:'walk')
	 */
	move : function moveEntity(direction, mode, vagrant) {
		var targetType, map, row, column, canMove, hasWarp;

		//already moving or attacking
		if(this.attacking !== this.DIRECTION.NONE) {
			return;
		}
		if(this.movement !== this.DIRECTION.NONE) {
			return;
		}

		//don't move
		if(direction === this.DIRECTION.NONE) {
			return;
		}
		this.facing = direction;
		this.sprite.playAnimation(mode + direction.name, false, true);
		this.sprite.stopAnimation(true);

		this.target.copy(this.location.point);
		this.target[direction.axis] += direction.sign;
		targetType = this.map.getTile(Math.floor(this.target.y), Math.floor(this.target.x));

		if(this.map.tileType === null) {
			return;
		}
		if(!this.map.tileType.hasOwnProperty(mode)) {
			return;
		}
		if(targetType === undefined) {
			return;
		}
		if(vagrant !== true && this.map !== targetType.data.map) {
			return;
		}
		map = targetType.data.map;
		row = targetType.data.row;
		column = targetType.data.column;
		if(map.checkHasEntity(row, column) !== null) {
			return;
		}
		canMove = this.map.tileType[mode].indexOf(targetType.tile) >= 0;
		canMove = canMove || (vagrant === true && map.getWarpTarget(row, column) !== undefined);

		if(canMove) {
			this.movement = direction;
			this.targetData = targetType.data;
			this.sprite.playAnimation(undefined, false, true);
		}
	},
	/**
	 * Set the entity's state to move one tile in a given direction.
	 *
	 * @param direction <this.DIRECTION> The direction to move.
	 * @param mode <string> The type of movement. Should be the first part of the
	 *     movement animation name (eg animation:'walk-left' then mode:'walk')
	 */
	attack : function attackEntity(direction, type) {
		var targetType, map, row, column, canMove, hasWarp;
		this.facing = direction;
		play_multi_sound('multiaudio2');
		if(direction === this.DIRECTION.NONE) {
			return;
		}
		this.facing = direction;if(direction === this.DIRECTION.NONE) {
			return;
		this.sprite.playAnimation("walk" + direction.name, false, true);
		this.sprite.stopAnimation(true);

		this.target.copy(this.location.point);
		this.target[direction.axis] += direction.sign;
		targetType = this.map.getTile(Math.floor(this.target.y), Math.floor(this.target.x));
		map = targetType.data.map;
		row = targetType.data.row;
		column = targetType.data.column;
		if(map.checkHasEntity(row, column) !== null) {
			return;
		}
		Sprite
		this.targetData = targetType.data;
		this.sprite.playAnimation(undefined, false, true);

		play_multi_sound('multiaudio3');
		

		//already moving or attacking
		/*if (this.attacking !== this.DIRECTION.NONE) { return; }
		 if (this.movement !== this.DIRECTION.NONE) { return; }
		 play_multi_sound('multiaudio3');
		 //drawGraphic()
		 //this.sprite.playAnimation("sward" + direction.name, false, true); //check this
		 //this.sprite.stopAnimation(true);
		 if (direction === this.DIRECTION.NONE) { return; }
		 this.facing =direction;
		 this.target.copy(this.location.point);
		 this.target[direction.axis] += direction.sign;

		 targetType = this.map.getTile(Math.floor(this.target.y), Math.floor(this.target.x));

		 if (this.map.tileType === null) { return; }
		 if (!this.map.tileType.hasOwnProperty(mode)) { return; }
		 if (targetType === undefined) { return; }

		 map = targetType.data.map;
		 row = targetType.data.row;
		 column = targetType.data.column;
		 if (map.checkHasEntity(row, column) !== null) { return; }
		 canMove = this.map.tileType[mode].indexOf(targetType.tile) >= 0;
		 if (canMove) {
		 }
		 */
	},
	/**
	 * Updates the entity's state and animation.
	 *
	 * @param elapsedTime <number> The time since the last update.
	 */
	update : function updateEntity(elapsedTime) {
		var axis, sign, delta, stopped = false;
		if(this.movement !== this.DIRECTION.NONE) {
			axis = this.movement.axis;
			sign = this.movement.sign;
			delta = sign * this.speed * elapsedTime;
			this.location.point[axis] += delta;
			if(this.location.point[axis] * sign >= this.target[axis] * sign) {
				this.location.point[axis] = this.target[axis];
				this.movement = this.DIRECTION.NONE;
				this.sprite.stopAnimation(true);
				stopped = true;
			}
		}

		this.sprite.update(elapsedTime);
		return stopped;
	},
	/**
	 * Draws the entity.
	 *
	 * @param mapPosition <Point> The position of the map in canvas coordinates.
	 * @param clip <Rectangle> The bounds of the viewport.
	 */
	draw : function drawEntity(mapPosition, clip) {
		this.sprite.boundingBox.point.set(mapPosition.x + this.location.point.x * this.cellSize.width, mapPosition.y + this.location.point.y * this.cellSize.height);

		this.sprite.draw(clip);
	}
};
