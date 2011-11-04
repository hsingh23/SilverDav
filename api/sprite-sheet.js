/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 * 
 * Entends Graphic for drawing sprite sheets.
 * SpriteSheets are used by Sprite for drawing.
 * Multiple Sprites can use the same SpriteSheet.
 */
require('api/sprite.js');

/**
 * Creates a SpriteSheet based on a JSON object.
 *
 * The JSON object should describe fulfill the requirements
 * of a Graphic. It should also have the following:
 * 
 *     "frame": <integer>		// number of frames per animation
 *     "exposure": <integer>	// time in ms to display each frame
 *     "animations": [<string>]	// Array of identifiers for each animation
 *								//   (each row on sheet is considered an animation)
 *
 * @param jsonNode <object> A json node for sprites.
 * @param context <Context> The canvas context.
 * @see Graphic
 */
function SpriteSheet(jsonNode, context) {
	this.hasError = false;
	if (!this._initSpriteSheet(jsonNode, context)) {
		this.hasError = true;
	}
	return this;
}

SpriteSheet.prototype = new Graphic();
SpriteSheet.prototype.cellSize = null;
SpriteSheet.prototype.frames = 0;
SpriteSheet.prototype.exposure = 0;
SpriteSheet.prototype.animations = null;
SpriteSheet.prototype.animationCount = 0;

/**
 * Initializes the instance variables for the object and
 * begins the loading of the art asset.
 *
 * @return <boolean> Whether the initialization succeeded
 */
SpriteSheet.prototype._initSpriteSheet = function initSpriteSheet(jsonNode, context) {
	var index;
	if (!this._initialize(jsonNode, context)) { return false; }
	if (!this._validateJsonSprite(jsonNode)) { return false; }

	this.frames = Math.floor(jsonNode.frames);
	this.exposure = Math.floor(jsonNode.exposure);
	this.animations = {};
	this.animationCount = jsonNode.animations.length;
	for (index = 0; index < this.animationCount; index += 1) {
		this.animations[jsonNode.animations[index]] = index;
	}

	this.cellSize = new Size(
		this.size.width / this.frames,
		this.size.height / this.animationCount
	);
	return true;
};

/**
 * Validates the json object used for initialization.
 *
 * @return <boolean> True iff the json node validated successfully.
 */
SpriteSheet.prototype._validateJsonSprite = function validateJsonSprite(jsonNode) {
	var result = true;

	if (typeof jsonNode !== 'object' || jsonNode === null) { return false; }

	result = result && (typeof jsonNode.frames === 'number');
	result = result && (typeof jsonNode.exposure === 'number');
	result = result && (jsonNode.animations instanceof Array);

	if (!result) {
		console.error("Improper json object ", jsonNode, " for SpriteSheet", this);
	}

	return result;
};

/**
 * Draws a frame of the sprite animation.
 *
 * @param frame <integer> The frame number (indexed from 0).
 * @param animation <integer> The animation index (indexed from 0).
 * @param dest <Rectangle> The canvas destination region to which to draw.
 * @param clip <Rectangle> [optional] The canvas region to which to limit the draw.
 */
SpriteSheet.prototype.drawFrame = function drawFrame(frame, animation, dest, clip) {
	//frame = frame % this.frames;
	//animation = animation % this.animations.length;

	this._drawCell(frame, animation, this.cellSize, dest, clip);
};