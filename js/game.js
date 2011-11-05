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

require('js/stab.js');

require('js/enemy.js');


 var localEnemies = [];
 


function Game(context, manifestPath) {
	this._load(context, manifestPath);
}
	var channel_max = 10;										// number of channels
	audiochannels = new Array();
	for (a=0;a<channel_max;a++) {									// prepare the channels
		audiochannels[a] = new Array();
		audiochannels[a]['channel'] = new Audio();						// create a new audio object
		audiochannels[a]['finished'] = -1;							// expected end time for this channel
	}
	function play_multi_sound(s) {
		for (a=0;a<audiochannels.length;a++) {
			thistime = new Date();
			if (audiochannels[a]['finished'] < thistime.getTime()) {			// is this channel finished?
				audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
				audiochannels[a]['channel'].src = document.getElementById(s).src;
				audiochannels[a]['channel'].load();
				audiochannels[a]['channel'].play();
				break;
			}
		}
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
		this.input.registerKey(KEY.E);
	    this.input.registerKey(KEY.Q);
	    this.input.registerKey(KEY[1]);
	    this.input.registerKey(KEY[2]);
	    this.input.registerKey(KEY[3]);
	    this.input.registerKey(KEY[4]);
		
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
		var pc = new PC({"sprite": "player", "position": {x:12, y:13}}, initialMap, scale, this.contentLoader, this.input);
		
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
	}
};