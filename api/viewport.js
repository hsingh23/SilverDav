/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * The Viewport manages a draw window for the world.
 */

/**
 * Creates a new viewport window for rendering the game world.
 *
 * @param context <Context> The canvas rendering context.
 * @param rectangle <Rectangle> The region on Canvas to draw the world.
 *     It is recommended that the size be a multiple of cells.
 * @param cells <Cell> The number of rows/columns of grid cells to display.
 * @param map <Map> The initial map.
 * @param position <Point> [optional] The world space coordinate of the top left
 *     corner of the viewport. (1 unit = 1 grid cell)
 */
function Viewport(context, rectangle, cells, map, position, player) {
	this.context = context;
	this.clip = rectangle;
	this.currentMap = player.map;
	this.player = player;

	this.gridCorner = rectangle.clone();
	this.gridCorner.size.width /= cells.column;
	this.gridCorner.size.height /= cells.row;
	this.gridCorner.size.width = Math.floor(this.gridCorner.size.width);
	this.gridCorner.size.height = Math.floor(this.gridCorner.size.height);
	this.corner = new Rectangle();
	
	this.offset = new Point(
		-Math.floor(cells.column / 2),
		-Math.floor(cells.row / 2)
	);
	
	this.location = this.player.location.point.clone();
	this.location.x += this.offset.x;
	this.location.y += this.offset.y;

	this.gridCorner.point.x -= Math.floor(this.gridCorner.size.width * this.location.x);
	this.gridCorner.point.y -= Math.floor(this.gridCorner.size.height * this.location.y);
	
	this.playerMapLoc = new Point();
	
	this._relocate();
	return this;
}

Viewport.prototype = {
	context: null,		// Canvas rendering context
	clip: null,			// The bounds of the viewport
	player: null,		// Player entity to follow
	offset: null,		// Offset of viewport top-left from player position

	clearColor: 'black',
	fadeTime: 500,		// Time in ms for the fade effect
	currentFade: 0,	// Value [0,fadeTime] where 0 is normal and fadeTime is faded
	isFadingOut: false,	// Whether fade is moveing to fadeColor
	fadeColor: 'black',	

	currentMap: null,	// Map which covers the current top left corner
	location: null,		// Viewport position in the world (relative to current map)
	gridCorner: null,	// The rectangle for the top left grid cell of the current map

	corner: null,		// Used as scratch space for drawing
	playerMapLoc: null,
	
	/**
	 * Changes the current map to be consistent with the upper left corner.
	 */
	_relocate: function relocate() {
		var moved = false, check;
		while (this.location.x < 0) {
			check = this._relocateStep(this.currentMap.NEIGHBOR.LEFT);
			moved = moved || check;
			if (!check) { break; }
		}
		
		while (this.location.x >= this.currentMap.grid[0].length) {
			check = this._relocateStep(this.currentMap.NEIGHBOR.RIGHT);
			moved = moved || check;
			if (!check) { break; }
		}
		
		while (this.location.y < 0) {
			check = this._relocateStep(this.currentMap.NEIGHBOR.UP);
			moved = moved || check;
			if (!check) { break; }
		}
		
		while (this.location.y >= this.currentMap.grid.length) {
			check = this._relocateStep(this.currentMap.NEIGHBOR.DOWN);
			moved = moved || check;
			if (!check) { break; }
		}
		
		this._updateGridCorner();
	},
	
	/**
	 * Helper for the relocate function. Moves one map in a given direction.
	 *
	 * @param direction <Map.NEIGHBOR> The direction in which to move.
	 */
	_relocateStep: function relocateStep(direction) {
		var neighbor, reference, axis, delta;
		
		neighbor = this.currentMap.adjacency[direction];
		if (neighbor === null || !(neighbor instanceof Map)) { return false; }
		
		reference = direction % 2 === 0 ? neighbor : this.currentMap;
		delta = direction >= 2 ? reference.grid[0].length : reference.grid.length;
		axis = direction >= 2 ? 'x' : 'y';
		delta *= direction % 2 === 0 ? 1 : -1;
		
		this.location[axis] += delta;
		this.currentMap = neighbor;
		
		return true;
	},
	
	/**
	 * Updates the grid corner rectangle to the nearset pixel coordinates specified by this.location.
	 */
	_updateGridCorner: function updateGridCorner() {
		this.gridCorner.point.x = this.clip.point.x - Math.floor(this.gridCorner.size.width * this.location.x);
		this.gridCorner.point.y = this.clip.point.y - Math.floor(this.gridCorner.size.height * this.location.y);
	},
	
	/**
	 * Updates the viewport.
	 *
	 * @param elapsedTime <number> The time since the last draw call.
	 */
	update: function updateViewport(elapsedTime) {
		var adjacent, end, map;
		this.currentFade += this.isFadingOut ? elapsedTime : -elapsedTime;
		this.currentFade = Math.min(Math.max(this.currentFade, 0), this.fadeTime);
		
		this.player.update(elapsedTime);
		
		//Recenter on player
		if (this.player !== null) {
			this.currentMap = this.player.map;
			this.location.copy(this.player.location.point);
			this.location.x += this.offset.x;
			this.location.y += this.offset.y;
			this._relocate();
		}
		
		//Update visible maps
		this.corner.copy(this.gridCorner);
		end = this.clip.point.y + this.clip.size.height;
		map = this.currentMap;
		
		while (this.corner.point.y < end) {
			if (map === null || !(map instanceof Map)) { break; }
			this._updateRow(this.corner, map, elapsedTime);
			this.corner.point.y += this.corner.size.height * map.grid.length;
			map = map.adjacency[map.NEIGHBOR.DOWN];
		}
	},
	
	_updateRow: function updateRow(corner, map, elapsedTime) {
		var end = this.clip.point.x + this.clip.size.width;
		while (corner.point.x < end) {
			if (map === null || !(map instanceof Map)) { break; }
			map.update(elapsedTime);
			corner.point.x += corner.size.width * map.grid[0].length;
			map = map.adjacency[map.NEIGHBOR.RIGHT];
		}
		corner.point.x = this.gridCorner.point.x;
	},
	
	/**
	 * Draws a rectangle to the canvas over the viewport window.
	 * Uses current context (ie color)
	 */
	_clearViewport: function clearViewport() {
		this.context.fillRect(this.clip.point.x, this.clip.point.y, this.clip.size.width, this.clip.size.height);
	},
	
	/**
	 * Draws the viewport (visible maps and such).
	 *
	 * Maps draw row by row. First map of each row start with current and uses
	 * the next map downward in adajcency. (See _drawRow)
	 */
	draw: function drawViewport() {
		var end, map;
		this.corner.copy(this.gridCorner);
		end = this.clip.point.y + this.clip.size.height;
		map = this.currentMap;
		
		if (this.currentFade === this.fadeTime) {
			this.context.fillStyle = this.fadeColor;
			this._clearViewport();
			return;
		}
		
		this.context.fillStyle = this.clearColor;
		this._clearViewport();
		
		while (this.corner.point.y < end) {
			if (map === null || !(map instanceof Map)) { break; }
			this._drawRow(this.corner, map);
			this.corner.point.y += this.corner.size.height * map.grid.length;
			map = map.adjacency[map.NEIGHBOR.DOWN];
		}
		
		if (this.currentFade > 0) {
			this.context.fillStyle = this.fadeColor;
			this.context.globalAlpha = this.currentFade / this.fadeTime;
			this._clearViewport();
			this.context.globalAlpha = 1;
		}
		
		//Determine player's map draw location
		if (this.player !== null) {
			this.playerMapLoc.copy(this.player.location.point);
			this.playerMapLoc.x += this.offset.x;
			this.playerMapLoc.y += this.offset.y;
			
			this.playerMapLoc.x *= -this.gridCorner.size.width;
			this.playerMapLoc.y *= -this.gridCorner.size.height;
			this.playerMapLoc.x += this.clip.point.x;
			this.playerMapLoc.y += this.clip.point.y;
			
			this.player.draw(this.playerMapLoc, this.clip);
		}
	},
	
	/**
	 * Draws a row of map for the viewport.
	 *
	 * Rows are draw from the starting map and uses the next map
	 * right-ward in the adjacency.
	 *
	 * @param corner <Rectangle> The corner for the starting map of the row.
	 *     Note: mutated, but reset at the end of the function using gridCorner.
	 * @param map <Map> The first map of the row to draw.
	 */
	_drawRow: function drawViewportRow(corner, map) {
		var end = this.clip.point.x + this.clip.size.width;
		while (corner.point.x < end) {
			if (map === null || !(map instanceof Map)) { break; }
			map.drawMap(corner, this.clip);
			corner.point.x += corner.size.width * map.grid[0].length;
			map = map.adjacency[map.NEIGHBOR.RIGHT];
		}
		corner.point.x = this.gridCorner.point.x;
	},
};