/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 * 
 * A demo Game object.
 */
// You can require your files here.
require('js/guy.js');

function Game(context, manifestPath) {
	this._load(context, manifestPath);
}

Game.prototype = {
	context: null,
	size: null,
	contentLoader: null,
	input: null,
	output: null,
	viewport: null,
	timestamp: null,
	maxDeltaTime: 120,		//ms

	/**
	 * Loads assest (images and levels) and initializes the game object.
	 *
	 * @param context The canvas 2d context to use to draw.
	 */
	_load: function loadGame(context, manifestPath) {
		var callback;
		callback = wrapper(this, '_setup');

		context.canvas.width = context.canvas.clientWidth;
		context.canvas.height = context.canvas.clientHeight;
		this.context = context;
		this.size = new Size(context.canvas.width, context.canvas.height);
		
		this.input = new Input(context.canvas);
		this.contentLoader = new ContentLoader(context, manifestPath, callback);
	},

	/**
	 * This functions is called after all content has been loaded
	 * and allows time to register input tracking, setup the viewport, and
	 * create of game elements (eg characters) which use preloaded images.
	 *
	 * Runs the game after setup.
	 */
	_setup: function setupGame() {
		// ensures that the contentLoader has been set.
		if (this.contentLoader === null) {
			setWrappedTimeout(this, '_setup', 500);
			return;
		}
		
		// Check the time (for elapsed time)
		this.timestamp = (new Date()).getTime();
		
		// Clear away the preloader
		this.context.fillStyle = "black";
		this.context.fillRect(0, 0, this.size.width, this.size.height);

		/** Your code below **/
		// Register buttons and keys.
		this.input.registerKey(KEY.W);
		this.input.registerKey(KEY.A);
		this.input.registerKey(KEY.S);
		this.input.registerKey(KEY.D);
		this.input.registerKey(KEY.ARROW_UP);
		this.input.registerKey(KEY.ARROW_DOWN);
		this.input.registerKey(KEY.ARROW_LEFT);
		this.input.registerKey(KEY.ARROW_RIGHT);
		this.input.registerKey(KEY.ESCAPE);
		this.input.registerKey(KEY.SPACE);
		this.input.registerKey(KEY.TAB);
		this._registerButtons();
		
		// size of a cell for the viewport
		var scale = new Size(
			30 * this.context.canvas.width / 480,
			30 * this.context.canvas.height / 320
		);
		
		// create Output
		this.output = new Output(
			this.context,
			new Rectangle(
				1*this.context.canvas.width / 480,
				1 * this.context.canvas.height / 320,
				310 * this.context.canvas.width / 480,
				50 * this.context.canvas.height / 320
			),
			this.input
		);
		
		// setup content
		this.contentLoader.setup(scale, this.output);
		
		// get starting map
		var initialMap = this.contentLoader.getContent('Map', 'zone 1');
		
		// create a new Player Character
		var pc = new PC({"sprite": "red", "position": {x:2, y:5}}, initialMap, scale, this.contentLoader, this.input);
		
		// create the Viewport
		this.viewport = new Viewport(
			this.context,
			new Rectangle(0,0,
				2*240 * this.context.canvas.width / 480,
				2*240 * this.context.canvas.height / 320
			),
			new Cell(16, 16),
			initialMap,
			new Point(0, 0),
			pc
		);

		// Initial draw for the buttons
		//this.input.drawButtons();
		
		// Let's Go!
		this._run();
	},

	/**
	 * Executes the update step of the game loop.
	 *
	 * @param elapsedTime <number> The delta time in ms since the last call.
	 */	
	_update: function updateGame(elapsedTime) {
		this.output.update(elapsedTime);
		if (!this.output.isActive()) {
			this.viewport.update(elapsedTime);
		}
		this.input.update();
	},

	/**
	 * Executes the draw step of the game loop.
	 */
	_draw: function drawGame() {
		this.viewport.draw();
		this.output.draw();
	},

	/**
	 * Executes the game loop.
	 */
	_run: function runGame() {
		var elapsedTime;

		elapsedTime = (new Date()).getTime() - this.timestamp;
		this.timestamp += elapsedTime;
		
		elapsedTime = Math.min(elapsedTime, this.maxDeltaTime);
		
		this._update(elapsedTime);
		this._draw();
		
		setWrappedTimeout(this, '_run', 0);
	},

	/**
	 * Create the UI buttons.
	 */
	_registerButtons: function registerButtons() {
		var width, height, rectangle, sprite;
		width = this.context.canvas.width;
		height = this.context.canvas.height;
		this._registerDpad(0, Math.round(3 * height / 32));
		
		rectangle = new Rectangle(0, 0, 0, 0);
		rectangle.size.width = Math.round(15 * width / 48);
		rectangle.size.height = Math.round(15 * height / 96);
		rectangle.point.y = height - rectangle.size.height;
		sprite = this.contentLoader.getContent('SpriteSheet', 'btn-start')
		this.input.registerButton('START', sprite, rectangle);
		
		rectangle.point.y -= rectangle.size.height;
		sprite = this.contentLoader.getContent('SpriteSheet', 'btn-select')
		this.input.registerButton('SELECT', sprite, rectangle);
		
		rectangle.size.width = Math.round(7 * width / 48);
		rectangle.size.height = Math.round(9 * height / 32);
		rectangle.point.x = width - rectangle.size.width;
		rectangle.point.y = Math.round(3 * height / 32);
		sprite = this.contentLoader.getContent('SpriteSheet', 'btn-a')
		this.input.registerButton('A', sprite, rectangle);
		
		rectangle.point.y = Math.round(14 * height / 32);
		sprite = this.contentLoader.getContent('SpriteSheet', 'btn-b')
		this.input.registerButton('B', sprite, rectangle);
	},
	
	/**
	 * Sets up a virtual d-pad on screen.
	 *
	 * @param x,y <number> The canvas coordinates of the d-pad.
	 */
	_registerDpad: function registerDpad(x, y) {
		var width, height, rectangle, sprite, formula;
		width = this.context.canvas.width;
		height = this.context.canvas.height;
		
		rectangle = new Rectangle(x, y, 0, 0);
		rectangle.size.width = Math.round(3 * width / 16);
		rectangle.size.height = Math.round(9 * height / 32);
		rectangle.point.x += Math.round(width / 16);
		sprite = this.contentLoader.getContent('SpriteSheet', 'dpad-up');
		formula = function (rect, point) {
			var x = point.x - rect.point.x,
				y = point.y - rect.point.y,
				rise = rect.size.height / 3,
				run = rect.size.width / 2;
			x = (x * rise / run) - rise;
			return (y < x + rect.size.height) && (y < -x + rect.size.height);
		};
		this.input.registerButton('UP', sprite, rectangle, formula, true);
		
		rectangle.point.y += rectangle.size.height;
		sprite = this.contentLoader.getContent('SpriteSheet', 'dpad-down');
		formula = function (rect, point) {
			var x = point.x - rect.point.x,
				y = point.y - rect.point.y,
				rise = rect.size.height / 3,
				run = rect.size.width / 2;
			x *= rise / run;
			return (y > x - rise) && (y > -x + rise);
		};
		this.input.registerButton('DOWN', sprite, rectangle, formula, true);
		
		rectangle.point.x = x;
		rectangle.point.y = y + Math.round(height / 8);
		rectangle.size.width = Math.round(5 * width / 32);
		rectangle.size.height = Math.round(5 * height / 16);
		sprite = this.contentLoader.getContent('SpriteSheet', 'dpad-left');
		formula = function (rect, point) {
			var x = point.x - rect.point.x,
				y = point.y - rect.point.y,
				rise = rect.size.height / 2,
				run = rect.size.width * 4 / 15;
			x = (x - rect.size.width) * rise / run;
			return (y > x + rise) && (y < -x + rise);
		};
		this.input.registerButton('LEFT', sprite, rectangle, formula, true);
		
		rectangle.point.x += rectangle.size.width;
		sprite = this.contentLoader.getContent('SpriteSheet', 'dpad-right');
		formula = function (rect, point) {
			var x = point.x - rect.point.x,
				y = point.y - rect.point.y,
				rise = rect.size.height / 2,
				run = rect.size.width * 4 / 15;
			x *= rise / run;
			return (y < x + rise) && (y > -x + rise);
		};
		this.input.registerButton('RIGHT', sprite, rectangle, formula, true);
	}
};