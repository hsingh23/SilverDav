/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * The Button is a virtual on-screen button.
 * Should be registered with and created by an Input object.
 */
require('api/sprite.js');

/**
 * Creates a new Button object.
 *
 * The SpriteSheet used should have 2 animations (can be single frame)
 * "on" and "off"
 *
 * @param spriteSheet <SpriteSheet> A SpriteSheet used to render the button.
 * @param metric <Rectangle|Point> See Sprite.
 * @param formula <function> (Rectangle, Point) -> boolean
 *     Given the sprite's bounding box and a point, returns if that point should
 *     be treated a on the button. Defaults to if point is in the rectangle. 
 * @param clamp <boolean> Whether to clamp the click area to the sprite's
 *     bounding box. Default: false.
 * @param isStatic <boolean> Static Buttons auto redraw on state changes
 *     and only need to be explicitly draw once at the start. Static buttons
 *     do not update. Default: true.
 */
function Button(spriteSheet, metric, formula, clamp, isStatic) {
	this.formula = typeof formula === 'function' ? formula : this._isInRectangle;
	this.isClamped = clamp === true;
	this.isStatic = !(isStatic === false);
	this.sprite = new Sprite(spriteSheet, metric);
	this.sprite.playAnimation('off', false, true);
	return this;
}

Button.prototype = {
	sprite: null,
	formula: undefined,
	isDown: false,
	isStatic: true,		// Static buttons don't update and auto redraw on state changes.
	isClamped: false,	// Clamp signifies the button click must be inside the sprite's bbox.
	wasPressed: false,
	wasReleased: false,

	/**
	 * Updates the sprite if button is not static.
	 * Clears the wasPressed and wasRelease flags.
	 *
	 * @param elapsedTime <integer> The number of ms since the last update.
	 */
	update: function updateButton(elapsedTime) {
		this.wasPressed = false;
		this.wasReleased = false;
		
		if (this.isStatic) { return; }
		
		this.sprite.update(elapsedTime);
	},

	/**
	 * Draws the button sprite.
     * @param clip <Rectangle> [optional] The canvas region to which to limit the draw.
	 */
	draw: function drawButton(clip) {
		this.sprite.draw(clip);
	},

	/**
	 * Changes the button state to down and changes the animation to 'on'
	 */
	press: function press() {
		this.sprite.playAnimation('on', false, true);
		this.isDown = true;
		this.wasPressed = true;
	},

	/**
	 * Changes the button state to up and changes the animation to 'off'
	 */
	release: function release() {
		this.sprite.playAnimation('off', false, true);
		this.isDown = false;
		this.wasReleased = true;
	},

	/**
	 * Flips the current state of the button.
	 */
	toggle: function toggle() {
		if (this.isDown) {
			this.release();
		} else {
			this.press();
		}

		if (this.isStatic) {
			this.draw();
		}
	},

	/**
	 * Checks if a point is considered on the button.
	 *
	 * @param position <Point> A canvas coordinate to test.
	 * @return <boolean> True if the Point is considered on the button.
	 */
	checkOnButton: function checkOnButton(position) {
		var passClamp = !this.isClamped ||
			this._isInRectangle(this.sprite.boundingBox, position);
		return passClamp && this.formula(this.sprite.boundingBox, position);
	},

	/**
	 * Checks if a point is inside a rectangle.
	 * Used as the default formula and for clamping.
	 *
	 * @param rect <Rectangle> The rectangle bounds.
	 * @param point <Point> The point to test.
	 * @return <boolean> True if the point is inside the rectangle.
	 */
	_isInRectangle: function isInRectangle(rect, point) {
		if (point.x < rect.point.x) { return false; }
		if (point.y < rect.point.y) { return false; }
		if (point.x >= rect.point.x + rect.size.width) { return false; }
		if (point.y >= rect.point.y + rect.size.height) { return false; }
		return true;
	}
};