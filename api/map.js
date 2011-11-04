/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * Holds the data regarding a map (one game world area).
 * Includes drawing the region and the connections to other areas.
 *
 * Derived from JsonFile as Maps are read in from JSON files.
 */
require('api/entity.js');

/**
 * Creates a map object.
 *
 * The given object if from the manifest and merely contains a path to the level file.
 *
 * The level should have the following structure:
 *     "tileset": <string>     // The key for the Tileset used for the map
 *     "grid": [[<string>]]    // 2D array (row major) of keys for the tiles
 *                                    of each grid space
 *     "adjacency": [<string>] // The keys of the 4 adjacent maps:
 *                                    up,down,left,right.
 * 
 * @param jsonNode <object> An object with a src property of the map file's location
 * @param context <context> The canvas rendering context.
 */
function Map(jsonNode, context) {
	this.hasError = false;
	this.warps = {};
	this.warpNames = {};
	if (!this._initialize(jsonNode, context)) {
		this.hasError = true;
	}
	
	this.currentTile = new Rectangle();
	return this;
}

Map.prototype = new JsonFile();
Map.prototype.tileset = "";
Map.prototype.adjacency = null;	
Map.prototype.grid = null;
Map.prototype.NEIGHBOR = {UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3};
Map.prototype.currentTile = null;
Map.prototype.entities = null;
Map.prototype.tileType = null;
Map.prototype.warps = null;
Map.prototype.warpNames = null;

/**
 * Parse the http request response into a json object,
 * and initializes the map properties.
 *
 * @param request <XMLHttpRequest> The http request object.
 */
Map.prototype._parseJson = function parseJson(request) {
	var json;
	if (request.readyState === this.REQUEST_READY) {
		if (request.status === this.REQUEST_SUCCESS) {
			try {
				json = JSON.parse(request.responseText);
				this.isLoaded = true;
				this._mergeJson(json);
			} catch (err) {
				console.error(err, this);
				this.hasError = true;
			}
		} else {
			console.error(request.statusText, this);
			this.hasError = true;
		}
	}
};

/**
 * Adds certain properties of a given json object to this object.
 *
 * @param json <object> The json object parsed from file.
 */
Map.prototype._mergeJson = function mergeJson(json) {
	var warp, row, column;
	if (!this._validateJsonMap(json)) { return; }
	this.tileset = json.tileset;
	this.adjacency = json.adjacency;
	this.grid = json.grid;
	if (json.hasOwnProperty('entities')) {
		this.entities = json.entities;
	}
	if (json.hasOwnProperty('tileType')) {
		this.tileType = json.tileType;
	}
	if (json.hasOwnProperty('warps')) {		
		for (warp in json.warps) {
			if (json.warps.hasOwnProperty(warp)) {
				row = json.warps[warp].row;
				column = json.warps[warp].column;
				this.warpNames[warp] = new Cell(row, column);
				if (this.warps[row] === undefined) {
					this.warps[row] = {};
				}
				this.warps[row][column] = {
					"targetMap": json.warps[warp].targetMap,
					"targetWarp": json.warps[warp].targetWarp
				};
			}
		}
	}	
};

/**
 * Validates a json object as a Map object representaion.
 *
 * @param json <object> The object to test.
 * @return <boolean> True iff the object passes validation.
 */
Map.prototype._validateJsonMap = function validateJsonMap(json) {
	var result = true, row, length;

	result = result && (json.hasOwnProperty('tileset'));
	result = result && (json.adjacency instanceof Array);
	result = result && (json.adjacency.length === 4);
	result = result && (json.grid instanceof Array);
	result = result && (json.grid[0] instanceof Array);
	
	if (result) {
		length = json.grid[0].length;
		for (row = 1; row < json.grid.length; row += 1) {
			result = result && (json.grid[row] instanceof Array);
			result = result && (json.grid[row].length === length);
		}
	}
	
	if (!result) {
		console.error("Improper json map object ", jsonNode, " for ", this);
	}

	return result;
};

/**
 * To be run during the setup phase after the content has been loaded.
 * Alters this Map's properties for tileset and adjacency to hold references
 * to the objects rather than hold their keys.
 *
 * Must be called for all maps before using them.
 *
 * @param contentLoader <ContentLoader> The content loader object which holds
 *     the maps and tilesets.
 * @param cellSize <Size> The dimensions of a canvas viewport cell.
 * @param output <Output> The output object.
 */
Map.prototype.setup = function setupMap(contentLoader, cellSize, output) {
	var tileset, index, adj, map, row, column, warp;
	tileset = contentLoader.getContent('Tileset', this.tileset);
	if (tileset === null) {
		console.error("Map tileset ", tileset, " not found. ", this);
	} else {
		this.tileset = tileset;
	}
	
	for (index = 0; index < this.adjacency.length; index += 1) {
		adj = this.adjacency[index];
		if (adj === null) { this.adjacency[index] = null; continue; }
		
		map = contentLoader.getContent('Map', adj);
		if (map === null) {
			console.error("Map adjacency ", adj, " not found. ", this);
		}
		this.adjacency[index] = map;
	}
	
	if (this.warps !== null) {
		for (row in this.warps) {
			for (column in this.warps[row]) {
				warp = this.warps[row][column].targetMap;
				this.warps[row][column].targetMap = contentLoader.getContent('Map', warp);
			}
		}
	}
	
	this._buildEntities(contentLoader, cellSize, output);
};

/**
 * Creates the entities as they were described in the loaded json map file.
 *
 * @param loader <ContentLoader> The content loader object.
 * @param cellSize <Size> Dimensions on canvas of a cell.
 * @param output <Output> The output object.
 */
Map.prototype._buildEntities = function buildEntities(loader, cellSize, output) {
	var index, descriptor, Type;
	
	if (this.entities === null) { return; }
	
	for (index = 0; index < this.entities.length; index += 1) {
		descriptor = this.entities[index];
		
		if (typeof descriptor.type === 'string') {
			Type = document.defaultView[descriptor.type];
		} else {
			Type = Entity;
		}
		
		this.entities[index] = new Type();
		this.entities[index].setup(descriptor, this, cellSize, loader, output);
	}
};

/**
 * Updates the entities on the map.
 *
 * @param elapsedTime <number> The time since the last update.
 */
Map.prototype.update = function update(elapsedTime) {
	var index;
	
	if (this._updated === true) { return; }
	this._updated = true;
	
	if (this.entities === null) { return; }
	for (index = 0; index < this.entities.length; index += 1) {
		this.entities[index].update(elapsedTime);
	}
};

/**
 * Draw the map to the canvas.
 *
 * @param rect <Rectangle> A rectangle with a position on the Canvas and
 *    size for the top left grid cell of this map region.
 * @param clip <Rectangle> [optional] The region to which to restrict the drawing.
 */
Map.prototype.drawMap = function drawMap(rect, clip) {
	var row, column, tile, rowStart, columnStart, rowEnd, columnEnd, columnReset;
	this.currentTile.copy(rect);
	
	columnEnd = columnStart = clip.point.x - rect.point.x;
	columnStart = Math.max(Math.floor(columnStart / rect.size.width), 0);
	columnEnd = Math.ceil((columnEnd + clip.size.width) / rect.size.width);
	columnEnd = Math.min(columnEnd, this.grid[0].length);
	
	rowEnd = rowStart = clip.point.y - rect.point.y;
	rowStart = Math.max(Math.floor(rowStart / rect.size.height), 0);
	rowEnd = Math.ceil((rowEnd + clip.size.height) / rect.size.height);
	rowEnd = Math.min(rowEnd, this.grid.length);
	
	this.currentTile.point.x += columnStart * rect.size.width;
	this.currentTile.point.y += rowStart * rect.size.height;
	columnReset = this.currentTile.point.x;
	
	for (row = rowStart; row < rowEnd; row += 1) {
		for (column = columnStart; column < columnEnd; column += 1) {
			tile = this.grid[row][column];
			this.tileset.drawTile(tile, this.currentTile, clip);
			this.currentTile.point.x += this.currentTile.size.width;
		}
		this.currentTile.point.x = columnReset;
		this.currentTile.point.y += this.currentTile.size.height;
	}
	
	this._drawEntities(rect, clip);
	this._updated = false;
};

/**
 * Draws the entities on this map.
 *
 * @param rect <Rectangle> see Map.draw
 * @param clip <Rectangle> see Map.draw
 */
Map.prototype._drawEntities = function drawMapEntities(rect, clip) {
	var index;
	if (this.entities === null) { return; }
	
	for (index = 0; index < this.entities.length; index += 1) {
		this.entities[index].draw(rect.point, clip);
	}
};

/**
 * Returns the target info of the warp on a given tile.
 * Assumes row and column are a valid cell on this map.
 *
 * @param row <integer> The row of the look up.
 * @param column <integer> The column of the look up.
 * @return {targetMap: <Map>, targetWarp: <string>}
 *     Returns undefined if no warp exists.
 */
Map.prototype.getWarpTarget = function getWarpTarget(row, column) {
	var result;
	if (this.warps === null) { return undefined; }
	result = this.warps[row];
	if (result === undefined) { return undefined; }
	result = result[column];
	return result;
};

/**
 * Gets a warp by its name.
 *
 * @param name <string> The name of the warp.
 * @return {targetMap:<Map>, targetWarp:<Cell>} Returns undefined if not found.
 */
Map.prototype.getWarpByName = function getWarp(name) {
	if (this.warpNames !== null) {
		return this.warpNames[name];
	}
};

/**
 * Looks up a tile.
 * Called recursively on adjacent maps as needed.
 *
 * @param row <integer> The row of the look up.
 * @param column <integer> The column of the look up.
 * @return Returns {tile:<string>, data: {map:<Map>, row:<int>, column:<int>}}
 *     The tile and map or undefined if there is no data for the tile.
 *     Also gives the returning map and the coordinates of the tile on that map.
 */
Map.prototype.getTile = function getTile(row, column) {
	var neighbor;
	if (column < 0) {
		neighbor = this.adjacency[this.NEIGHBOR.LEFT];
		if (neighbor !== null) {
			column += neighbor.grid[0].length;
			return neighbor.getTile(row, column);
		} else {
			return undefined;
		}
	}
	
	if (column >= this.grid[0].length) {
		neighbor = this.adjacency[this.NEIGHBOR.RIGHT];
		if (neighbor !== null) {
			column -= this.grid[0].length;
			return neighbor.getTile(row, column);
		} else {
			return undefined;
		}
	}
	
	if (row < 0) {
		neighbor = this.adjacency[this.NEIGHBOR.UP];
		if (neighbor !== null) {
			row += neighbor.grid.length;
			return neighbor.getTile(row, column);
		} else {
			return undefined;
		}
	}
	
	if (row >= this.grid.length) {
		neighbor = this.adjacency[this.NEIGHBOR.DOWN];
		if (neighbor !== null) {
			row -= this.grid.length;
			return neighbor.getTile(row, column);
		} else {
			return undefined;
		}
	}
	
	//if (this.checkHasEntity(row, column) !== null) { return undefined; }
	
	return {
		"tile": this.grid[row][column],
		"data": { "map": this, "row": row, "column": column }
	};
};

/**
 * Checks to see if a tile is occupied by an entity.
 *
 * @param row <integer> The row of the look up.
 * @param column <integer> The column of the look up.
 * @return Returns <Entity> Returns the entity on the tile or else null.
 */
Map.prototype.checkHasEntity = function checkHasEntity(row, column) {
	var x, y, entity;
	if (this.entities === null) { return null; }

	for (index = 0; index < this.entities.length; index += 1) {
		entity = this.entities[index];
		x = Math.round(entity.location.point.x);
		y = Math.round(entity.location.point.y);
		
		if (column >= x && column < x + entity.location.size.width) {
			if (row >= y && row < y + entity.location.size.height) {
				return entity;
			}
		}
	}
	
	return null;
};