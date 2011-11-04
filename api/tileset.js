/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 * 
 * Extends Graphic. Provides an interface for drawing
 * tiles from a tileset image.
 */

/**
 * Creates a new Tileset object.
 *
 * The JSON object should describe fulfill the requirements
 * of a Graphic. It should also have the following:
 * 
 *     "tiles": [[<string>]]	// 2D Array of strings (row major)
 *								//   each row should have the same
 *								//   number of tiles
 *
 * @param jsonNode <object> A json node for sprites.
 * @param context <Context> The canvas context.
 * @see Graphic
 */
function Tileset(jsonNode, context) {
	this.hasError = false;
	if (!this._initTileset(jsonNode, context)) {
		this.hasError = true;
	}
	return this;
}

Tileset.prototype = new Graphic();
Tileset.prototype.cellSize = null;
Tileset.prototype.rows = 0;
Tileset.prototype.columns = 0;

/**
 * Initializes the instance variables for the object and
 * begins the loading of the art asset.
 *
 * @return <boolean> Whether the initialization succeeded
 */
Tileset.prototype._initTileset = function initTileset(jsonNode, context) {
	var row, column;
	if (!this._initialize(jsonNode, context)) { return false; }
	if (!this._validateJsonTileset(jsonNode)) { return false; }

	this.rows = jsonNode.tiles.length;
	this.columns = jsonNode.tiles[0].length;
	this.tiles = {};
	for (row = 0; row < this.rows; row += 1) {
		for (column = 0; column < this.columns; column += 1) {
			this.tiles[jsonNode.tiles[row][column]] = new Cell(row, column);
		}
	}

	this.cellSize = new Size(
		this.size.width / this.columns,
		this.size.height / this.rows
	);
	return true;
};

/**
 * Validates the json object used for initialization.
 * 
 * @return <boolean> True iff the json node validated successfully.
 */
Tileset.prototype._validateJsonTileset = function validateJsonTileset(jsonNode) {
	var result = true, index, length;

	if (typeof jsonNode !== 'object' || jsonNode === null) { return false; }

	result = result && (jsonNode.tiles instanceof Array);
	result = result && (jsonNode.tiles[0] instanceof Array);
	
	if (result) {
		length = jsonNode.tiles[0].length;
		for (index = 1; index < jsonNode.tiles.length; index += 1) {
			result = result && (jsonNode.tiles[index] instanceof Array);
			result = result && (length === jsonNode.tiles[index].length);
		}
	}

	if (!result) {
		console.error("Improper json object ", jsonNode, " for Tileset", this);
	}

	return result;
};

/**
 * Draws a tile from the tileset.
 * If the tile name does not exist, no drawing is done.
 *
 * @param tile <string> The tile name used in the 2d array.
 *     Can use 'tiles' to look-up index from name.
 * @param dest <Rectangle> The canvas destination region to which to draw.
 * @param clip <Rectangle> [optional] The canvas region to which to limit the draw.
 */
Tileset.prototype.drawTile = function drawTile(tile, dest, clip) {
	var cell;
	if (!this.tiles.hasOwnProperty(tile)) { return; }
	
	cell = this.tiles[tile];
	this._drawCell(cell.column, cell.row, this.cellSize, dest, clip);
};