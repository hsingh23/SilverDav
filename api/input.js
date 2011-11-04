/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * The Input object tracks the state of keyboard buttons (down/up)
 * and tracks clicks/touches. It also manages the draw and update
 * calls for registered Buttons (see Button).
 */
require('api/key.js');
require('api/button.js');

/**
 * Creates an Input object which manages keyboard button states,
 * and clicks/touches.
 *
 * @param canvas <Element> The canvas DOM element to associate with.
 */
function Input(canvas) {
	var hasTouch = false;
	this.buttons = [];
	this.clicks = {};
	this.BUTTON = {};
	this._addKeyListeners();

	canvas.setAttribute("ontouchstart", "");
	hasTouch = typeof canvas["ontouchstart"] === 'function';

	if (hasTouch) {
		this._addTouchListeners(canvas);
	} else {
		this._addMouseListeners(canvas);
	}

	return this;
}

Input.prototype = {
	BUTTON: null,	// Puedo-enum for custom Buttons
	keys: {},		// Shared among all instances of Input
	buttons: null,
	clicks: null,
	clickCount: 0,
	clickMax: 2,	// Max number of clicks to track

	/**
	 * Registers a keyboard key to be tracked.
	 * 
	 * If multiple instances of Input exist, then the key need
	 * only be registered once by ANY Input object as tracked
	 * key states are shared by all Input objects.
	 *
	 * @param key <KEY> The id of a key from the KEY pseudo-enum.
	 */
	registerKey: function registerKey(key) {
		this.keys[key] = {pressed: false, released: false, current: false};
	},

	/**
	 * Returns true if the key is currently pressed.
	 *
	 * @param key <KEY> The id of a key from the KEY pseudo-enum.
	 * @return <boolean> True iff key was registered and is down.
	 */
	isKeyDown: function isKeyDown(key) {
		if (!this.keys.hasOwnProperty(key)) { return false; }
		return this.keys[key].current;
	},

	/**
	 * Returns true if the key is pressed (its last and current state differ).
	 *
	 * @param key <KEY> The id of a key from the KEY pseudo-enum.
	 * @return <boolean> True iff key was registered, is down, and was not previously.
	 */
	isKeyPressed: function isKeyPressed(key) {
		if (!this.keys.hasOwnProperty(key)) { return false; }
		return this.keys[key].pressed;
	},

	/**
	 * Returns true if the key was released.
	 *
	 * @param key <KEY> The id of a key from the KEY pseudo-enum.
	 * @return <boolean> True iff key was registered, is down, and was not previously.
	 */
	isKeyReleased: function isKeyReleased(key) {
		if (!this.keys.hasOwnProperty(key)) { return false; }
		return this.keys[key].released;
	},
	
	/**
	 * Creates and adds a button to the UI.
	 *
	 * @see Button constructor.
	 * @param name <string> The key to be used to idenify the button.
	 *     Assumes name is unique for each button.
	 *     The key is added to BUTTON for use in isButtonDown().
	 */
	registerButton: function registerButton(name, spriteSheet, metric, formula, clamp, isDynamic) {
		var button = new Button(spriteSheet, metric, formula, clamp, isDynamic);
		
		this.BUTTON[name] = this.buttons.length;
		this.buttons.push(button);
	},

	/**
	 * Returns true if the button is currently down.
	 *
	 * @param button <this.BUTTON> The button id from the this.BUTTON psuedo-enum.
	 * @return <boolean> True iff the button exists and is down.
	 */
	isButtonDown: function isButtonDown(button) {
		if (!this.buttons.hasOwnProperty(button)) { return false; }
		return this.buttons[button].isDown;
	},

	/**
	 * Returns true if the button was pressed.
	 *
	 * @param button <this.BUTTON> The button id from the this.BUTTON psuedo-enum.
	 * @return <boolean> True iff the button exists and is down.
	 */
	isButtonPressed: function isButtonPressed(button) {
		if (!this.buttons.hasOwnProperty(button)) { return false; }
		return this.buttons[button].wasPressed;
	},

	/**
	 * Returns true if the button was released.
	 *
	 * @param button <this.BUTTON> The button id from the this.BUTTON psuedo-enum.
	 * @return <boolean> True iff the button exists and is down.
	 */
	isButtonReleased: function isButtonReleased(button) {
		if (!this.buttons.hasOwnProperty(button)) { return false; }
		return this.buttons[button].wasReleased;
	},

	/**
	 * Adds key listeners to track key events.
	 */
	_addKeyListeners: function addKeyListeners() {
		var _this = this;
		
		document.onkeydown = function onKeyDown(event) {
			if (_this.keys.hasOwnProperty(event.keyCode)) {
				if (!_this.keys[event.keyCode].current) {
					_this.keys[event.keyCode].pressed = true;
				}
				_this.keys[event.keyCode].current = true;
			}
		};
		document.onkeyup = function onKeyUp(event) {
			if (_this.keys.hasOwnProperty(event.keyCode)) {
				if (_this.keys[event.keyCode].current) {
					_this.keys[event.keyCode].released = true;
				}
				_this.keys[event.keyCode].current = false;
			}
		};
	},

	/**
	 * Draws all buttons.
	 *
	 * Not needed to be called if buttons are 'static' (see Button).
	 * 
     * @param clip <Rectangle> [optional] The canvas region to which to limit the draw.
	 */
	drawButtons: function drawButtons(clip) {
		var index;
		for (index = 0; index < this.buttons.length; index += 1) {
			this.buttons[index].draw(clip);
		}
	},

	/**
	 * Clears pressed and released buffers.
	 *
	 * @param elapsedTime <number> The time since the last frame in ms.
	 */
	update: function update(elapsedTime) {
		var key;
		for (key in this.keys) {
			this.keys[key].pressed = false;
			this.keys[key].released = false;
		}
		
		this.updateButtons(elapsedTime);
	},
	
	/**
	 * Updates all button sprites.
	 *
	 * @param elapsedTime <number> The time since the last frame in ms.
	 */
	updateButtons: function updateButtons(elapsedTime) {
		var index;
		for (index = 0; index < this.buttons.length; index += 1) {
			this.buttons[index].update(elapsedTime);
		}
	},

	/**
	 * Attempts to add a click to the clicks collection.
	 * If it already is in the collection, the data is update.
	 * If not at the max number of clicks, the click is added.
	 *
	 * @param id <number> The identifier of the click (touch.identifier or button).
	 * @param x,y <number> The x and y cooridinates relative to the canvas.
	 */
	_addClick: function addClick(id, x, y) {
		if (this.clicks.hasOwnProperty(id)) {
			this.clicks[id].x = x;
			this.clicks[id].y = y;
		} else if (this.clickCount < this.clickMax) {
			this.clicks[id] = new Point(x, y);
			this.clickCount += 1;
		}
	},

	/**
	 * Removes the click if it is being tracked.
	 *
	 * @param id <number> The identifier of the click (touch.identifier or button).
	 */
	_removeClick: function removeClick(id) {
		if (this.clicks.hasOwnProperty(id)) {
			delete this.clicks[id];
			this.clickCount -= 1;
		}
	},

	/**
	 * Tests to see if the all buttons are in the correct state
	 * based on the current clicks and toggles them if not.
	 */
	_checkButtons: function checkButtons() {
		var index, click, state;
		for (index = 0; index < this.buttons.length; index += 1) {
			state = false;
			for (click in this.clicks) {
				state = this.buttons[index].checkOnButton(this.clicks[click]);
				if (state) { break; }
			}
			if (state !== this.buttons[index].isDown) {
				this.buttons[index].toggle();
			}
		}
	},

	/**
	 * Adds mouse[down,up] listeners to track mouse events.
	 * Only call when touch is unavailable as mouse events are triggered
	 * still triggered on touch devices (on a delay for gesture detection).
	 * 
	 * @param canvas <Element> The canvas DOM element for which to track mouse events.
	 */
	_addMouseListeners: function addMouseListeners(canvas) {
		var _this = this;
	
		canvas.addEventListener(
			"mousedown",
			function onMouseStart(event) {
				var x = event.pageX - event.target.offsetLeft,
					y = event.pageY - event.target.offsetTop;
				
				_this._addClick(event.button, x, y);
				_this._checkButtons();
			},
			false
		);
		
		canvas.addEventListener(
			"mouseup",
			function onMouseEnd(event) {
				_this._removeClick(event.button);
				_this._checkButtons();
			},
			false
		);		
	},

	/**
	 * Adds touch[start,end,move] listeners to track touches.
	 * 
	 * @param canvas <Element> The canvas element for which to track touches.
	 */
	_addTouchListeners: function addTouchListeners(canvas) {
		var _this = this;
	
		canvas.addEventListener(
			"touchstart",
			function onTouchStart(event) {
				var index, x, y;
				for (index = 0; index < event.touches.length; index += 1) {
					x = event.touches[index].clientX - event.touches[index].target.offsetLeft;
					y = event.touches[index].clientY - event.touches[index].target.offsetTop;
					_this._addClick(event.touches[index].identifier, x, y);
				}
				_this._checkButtons();
			},
			false
		);
		
		canvas.addEventListener(
			"touchend",
			function onTouchEnd(event) {
				var index;
				for (index = 0; index < event.changedTouches.length; index += 1) {
					_this._removeClick(event.changedTouches[index].identifier);
				}
				_this._checkButtons();
			},
			false);
		
		canvas.addEventListener(
			"touchcancel",
			function onTouchCancel(event) {
				var index;
				for (index = 0; index < event.changedTouches.length; index += 1) {
					_this._removeClick(event.changedTouches[index].identifier);
				}
				_this._checkButtons();
			},
			false
		);
		
		canvas.addEventListener(
			"touchmove",
			function onTouchMove(event) {
				var index, x, y;
				for (index = 0; index < event.changedTouches.length; index += 1) {
					x = event.changedTouches[index].clientX - event.changedTouches[index].target.offsetLeft;
					y = event.changedTouches[index].clientY - event.changedTouches[index].target.offsetTop;
					_this._addClick(event.changedTouches[index].identifier, x, y);
				}
				_this._checkButtons();
				event.preventDefault();
			},
			false
		);
	},
};