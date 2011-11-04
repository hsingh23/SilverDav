/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 * 
 * Manages drawing and animating of a sprite.
 */

/**
 * Creates a new Sprite using the specified SpriteSheet.
 *
 * @param spriteSheet <SpriteSheet> The sprite sheet used to draw.
 * @param metric <Rectangle|Point> Sets the size and location of the draw 
 *     Rectangle. If a Point is given, the cell size of the sprite sheet is used.
 */
function Sprite(spriteSheet, metric) {
	if (!spriteSheet instanceof SpriteSheet) {
		console.error("Wrong type used to initialize Sprite", this, spriteSheet);
		return this;
	} else if (spriteSheet === null) {
		console.error("Sprite initialized with null SpriteSheet. ", this);
	}
	
	this.spriteSheet = spriteSheet;
	if (metric instanceof Rectangle) {
		this.boundingBox = metric.clone();
	} else if (metric instanceof Point) {
		this.boundingBox = new Rectangle(
			metric.x,
			metric.y,
			spriteSheet.cellSize.width,
			spriteSheet.cellSize.height
		);
	} else {
		this.boundingBox = new Rectangle(
			0,
			0,
			spriteSheet.cellSize.width,
			spriteSheet.cellSize.height
		);
	}
}

Sprite.prototype = {
	boundingBox: null,		// canvas coordinates
	spriteSheet: null,
	currentAnimation: 0,
	currentFrame: 0,
	currentExposure: 0,	// Time in ms spent on current frame
	isPlaying: false,
	isLooping: false,
	
	/**
	 * Begins playing of the animation.
	 *
	 * @param name <string> The name of the animation to play.
	 *     If name is not valid, the current animation plays.
	 * @param loop <boolean> Whether to loop the animation.
	 *     If loop is undefined, the looping state is unchanged.
	 * @param reset <boolean> See _resetAnimation(). Defaultly false.
	 */
	playAnimation: function playAnimation(name, loop, reset) {
		this.isPlaying = true;

		if (this.spriteSheet.animations.hasOwnProperty(name)) {
			this.currentAnimation = this.spriteSheet.animations[name];
		}

		if (typeof loop === 'boolean') {
			this.isLooping = loop;
		}
		if (reset === true) {
			this._resetAnimation();
		}
	},
	
	/**
	 * Stops the playing of the animation.
	 *
	 * @param reset <boolean> See _resetAnimation(). Defaultly false.
	 */
	stopAnimation: function stopAnimation(reset) {
		this.isPlaying = false;
		if (reset === true) {
			this._resetAnimation();
		}
	},
	
	/**
	 * Resets the animation to the first frame and clears
	 * the exposure time.
	 */
	_resetAnimation: function resetAnimation() {
		this.currentFrame = 0;
		this.currentExposure = 0;
	},
	
	/**
	 * Updates the animation state.
	 *
	 * @param elapsedTime <integer> The number of ms since the last update.
	 */
	update: function update(elapsedTime) {
		var exposure = this.spriteSheet.exposure,
			frames = this.spriteSheet.frames;

		if (!this.isPlaying) { return; }
		
		this.currentExposure += elapsedTime;

		if (this.currentExposure >= exposure) {
			this.currentFrame += Math.floor(this.currentExposure / exposure);
			if (this.isLooping) {
				this.currentFrame %= frames;
			} else if (this.currentFrame >= frames) {
				this.isPlaying = false;
				this.currentFrame = frames - 1;
			}
			this.currentExposure %= exposure;
		}
	},
	
	/**
	 * Draws the sprite instance.
     * @param clip <Rectangle> [optional] The canvas region to which to limit the draw.
	 */
	draw: function draw(clip) {
		this.spriteSheet.drawFrame(
			this.currentFrame,
			this.currentAnimation,
			this.boundingBox,
			clip
		);
	}
};