/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * A class that loads an image file and provides basic draw functionality.
 */

/**
 * Creates a new Graphic object.
 *
 * The JSON object should contain the following:
 *
 *     "key": <string>		// Identifier for the content object
 *							//    should be unique for given content type
 *     "src": <string>		// Path from the html document to the image file
 *     "width": <integer>	// The width of the image
 *     "height": <integer>	// The height of the image
 *
 * @param jsonNode <object> A json node for sprites.
 * @param context <Context> The canvas context.
 */
function Graphic(jsonNode, context) {
	if (!this._initialize(jsonNode, context)) {
		this.hasError = true;
	}
	return this;
}

Graphic.prototype = {
	context: null,
	image: null,
	src: "",
	isLoaded: false,
	hasError: false,
	size: null,
	bytes: 1,
	srcCell: null,
	destCell: null,

	/**
	 * Initializes the instance variables for the object and
	 * begins the loading of the art asset.
	 *
	 * @param jsonNode <object> A json node for sprites.
	 * @param context <Context> The canvas context.
	 * @return <boolean> Whether the initialization succeeded
	 */
	_initialize: function initialize(jsonNode, context) {
		if (!this._validateJson(jsonNode)) { return false; }

		this.context = context;
		this.src = jsonNode.src;
		this.size = new Size(jsonNode.width, jsonNode.height);
		
		if (typeof jsonNode.bytes === 'number') {
			this.bytes = Math.abs(Math.floor(jsonNode.bytes));
		}
		this._loadImage();
		
		this.srcCell = new Rectangle();
		this.destCell = new Rectangle();
		return true;
	},

	/**
	 * Validates the json object used for initialization.
	 *
	 * @param jsonNode <object> A json node for sprites.
	 * @return <boolean> True iff the json node validated successfully.
	 */
	_validateJson: function validateJson(jsonNode) {
		var result = true;

		if (typeof jsonNode !== 'object' || jsonNode === null) {
			return false;
		}

		result = result && (typeof jsonNode.src === 'string');
		result = result && (typeof jsonNode.width === 'number');
		result = result && (typeof jsonNode.height === 'number');

		if (!result) {
			console.error("Improper json object ", jsonNode, " for Graphic", this);
		}

		return result;
	},

	/**
	 * Begins the loading of the image asset.
	 */
	_loadImage: function loadImage() {
		var _this = this;

		this.image = new Image();

		this.image.onload = function () { _this.isLoaded = true; };
		this.image.onerror = function () { _this.hasError = true; };
		this.image.onabort = function () { _this.hasError = true; };
		this.image.src = this.src;
	},

	/**
	 * Draws a section of the image.
	 *
	 * @param source <Rectangle> The region of this image to draw.
	 * @param destination <Rectangle> The region of the canvas on which to draw.
	 */
	draw: function drawGraphic(source, destination) {
		this.context.drawImage(
			this.image,
			source.point.x,
			source.point.y,
			source.size.width,
			source.size.height,
			destination.point.x,
			destination.point.y,
			destination.size.width,
			destination.size.height
		);
	},
	
	/**
	 * Draws the full image.
	 *
	 * @param destination <Rectangle> The region of the canvas on which to draw.
	 */
	drawFull: function drawFull(destination) {
		this.draw(
			new Rectangle(0, 0, this.size.width, this.size.height),
			destination
		);
	},
	
	/**
	 * Clips 'dest' to within 'clip' and 'src' to match 'dest'
	 *
	 * @param src <Rectangle> [mutant] A rectangle of a source image.
	 * @param dest <Rectangle> [mutant] The corresponding destination
	 *     rectangle for 'src' on the canvas.
	 * @param clip <Rectangle> The region to clip to in canvas space.
	 */
	_clipCell: function clipCell(src, dest, clip) {
		this._clipCellCut(src, dest, clip, 'x', 'width', true);
		this._clipCellCut(src, dest, clip, 'x', 'width', false);
		this._clipCellCut(src, dest, clip, 'y', 'height', true);
		this._clipCellCut(src, dest, clip, 'y', 'height', false);
	},
	
	/**
	 * Modified 'dest' and 'src' as needed to clip the cells appropriately.
	 *
	 * @param src,dest,clip <Rectangle> see _clipCell().
	 * @param axis <string> Either 'x' or 'y'. The direction of the cut.
	 * @param side <string> Either 'width' or 'height'. Should match 'axis'.
	 * @param isMoved <boolean> Whether cutting should change the position.
	 */
	_clipCellCut: function clipCellCut(src, dest, clip, axis, side, isMoved) {
		var dBound, cBound, difference, original, adjust;
		
		dBound = dest.point[axis];
		cBound = clip.point[axis];
		
		if (!isMoved) {
			dBound = -dBound - dest.size[side];
			cBound = -cBound - clip.size[side];
		}
		
		if (dBound < cBound) {
			difference = Math.abs(cBound - dBound);
			original = dest.size[side];
			adjust = difference * src.size[side] / original;
			dest.size[side] -= difference;
			src.size[side] -= adjust;
			if (isMoved) {
				dest.point[axis] += difference;
				src.point[axis] += adjust;
			}
		}
	},
	
	/**
	 * Draws a cell of the source image.
	 *
	 * @param column,row <integer> The column and row of the cell to draw.
	 * @param cellSize <Size> The size of a cell.
	 * @param destination <Rectangle> The canvas destination rectangle.
	 * @param clip <Rectangle> [optional] The canvas region to which to clip drawing.
	 */
	_drawCell: function drawCell(column, row, cellSize, destination, clip) {
		this.srcCell.point.x = column * cellSize.width;// + 0.25;
		this.srcCell.point.y = row * cellSize.height;// + 0.25;
		this.srcCell.size.width = cellSize.width;// - 0.5;
		this.srcCell.size.height = cellSize.height;// - 0.5;

		this.destCell.copy(destination);
		if (clip !== undefined) {
			this._clipCell(this.srcCell, this.destCell, clip);
		}
		
		if (this.destCell.size.width <= 0 || this.destCell.size.height <= 0) { return; }

		this.draw(this.srcCell, this.destCell);
	}
};