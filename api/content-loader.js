/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * Loads the content files listed in a json manifest file
 * and draws a loading bar screen until all content is loaded.
 */
require('api/json.js');
require('api/map.js');
require('api/graphic.js');
require('api/sprite-sheet.js');
require('api/tileset.js');

/**
 * Creates a ContentLoader and begins the loading.
 *
 * @param context <Context> The canvas drawing context.
 * @param manifestPath <string> The path to the json manifest file.
 * @param callback <function> The function to be called upon finished loading.
 *     The function will be detached from the loader before calling.
 */
function ContentLoader(context, manifestPath, callback) {
	this.context = context;
	this.callback = callback;
	this.content = {};

	this._initializeContext();

	//this._fetchJsonFile(manifestPath, false, this, 'manifest');
	this.manifest = new JsonFile({src: manifestPath}, context, false);

	// checck if manifest loaded successfully
	if (!this.manifest.hasError && this.manifest.isLoaded) {
		this.manifest = this.manifest.info;
		this._loadContent();
		this._draw();
	} else {
		this.context.fillStyle = 'red';
		this.context.fillRect(
			0,
			0,
			this.context.canvas.width,
			this.context.canvas.height
		);
	}

	return this;
}

ContentLoader.prototype = {
	manifest: null,
	callback: undefined,
	context: null,			// canvas context
	refreshTime: 60,		// milliseconds between redrawing the preloader
	content: null,			// object holding references to all content
	errorMessage: undefined,
	loadingBar: null,

	/**
	 * Initializes the canvas' context for drawing the loading screen.
	 * Also sets up the dimensions of the loading bar.
	 */
	_initializeContext: function initialzeContext() {
		var width, height, barWidth, barHeight, x, y;
		width = this.context.canvas.width;
		height = this.context.canvas.height;

		this.context.fillStyle = 'black';
		this.context.strokeStyle = 'white';
		this.context.textBaseline = 'bottom';

		this.context.fillRect(0, 0, width, height);

		// relative sizing of progress bar
		barWidth = Math.floor(width * 0.75);
		barHeight = Math.floor(height * 0.0625);
		x = Math.floor((width - barWidth) / 2) + 0.5;
		y = 9 * barHeight + 0.5;
		this.context.font = barHeight + 'px sans-serif';

		this.loadingBar = new Rectangle(x, y, barWidth, barHeight);
	},

	/**
	 * Draw the loading screen with the loading bar.
	 *
	 * @param percent <number> A value [0,1] for the percent to display.
	 * @param message <string> The message to display on the loading screen.
	 */
	_drawLoadingScreen: function drawLoadingScreen(percent, message) {
		var width, height, pos, size;
		width = this.context.canvas.width;
		height = this.context.canvas.height;
		pos = this.loadingBar.point;
		size = this.loadingBar.size;

		this.context.fillStyle = 'black';

		// Draw progress bar border
		this.context.fillRect(0, 0, width, height);
		this.context.strokeRect(pos.x, pos.y, size.width, size.height);

		// Display text
		this.context.fillStyle = 'white';
		this.context.fillText(message, pos.x, pos.y - 5);

		// Fill progress bar
		this.context.fillRect(
			Math.ceil(pos.x),
			Math.ceil(pos.y),
			percent * (size.width - 1),
			size.height - 1
		);
	},

	/**
	 * Generates a loading message where the trailing dots
	 * move over time.
	 *
	 * @return <string> A loading message (eg "Loading...  ")
	 */
	_makeLoadingMessage: function makeLoadingMessage() {
		var spots, dots, dot, time, pos, message;

		spots = 5; dots = 3;
		time = Math.floor((new Date()).getTime() / 250) % spots;

		message = "Loading";
		// Add moving dots based on time
		for (dot = 0; dot < spots; dot += 1) {
			pos = dot - time;
			pos += dot < time ? spots : 0;
			message = message + (pos < dots ? '.' : ' ');
		}

		return message;
	},

	/**
	 * Draws the preloader and checks if all content was laoded.
	 * On completed loading, the callback is called.
	 */
	_draw: function drawLoader() {
		var total, loaded, percent, message, callback;

		// Aggregate content counts
		total = this._countContent();
		loaded = this._countLoadedContent();
		percent = loaded / total;

		// Check for loading errors
		if (this.errorMessage !== undefined) {
			message = "Failed to load content :(";
			console.error(this.errorMessage);
		} else {
			message = this._makeLoadingMessage();
		}

		this._drawLoadingScreen(percent, message);

		// Check for load completion
		if (loaded === total) {
			callback = this.callback;
			callback();
		} else if (this.errorMessage === undefined) {
			setWrappedTimeout(this, '_draw', this.refreshTime);
		}
	},

	/**
	 * Initiates the loading of all the content in the manifest.
	 * The names of each type in the manifest should match the constructor name.
	 */
	_loadContent: function loadContent() {
		var that, type;
		that = document.defaultView;
		
		for (type in this.manifest) {
			if (this.manifest.hasOwnProperty(type)) {
				if (that.hasOwnProperty(type)) {
					this._loadContentType(type, that[type]);
				} else {
					console.warn("No matching constructor found for type: ", type);
				}
			}
		}
	},

	/**
	 * Initiates loading of a certain type of content.
	 *
	 * The constructor will be passed a json node and the canvas context.
	 *
	 * @param type <string> The name of the content type as in the manifest.
	 * @param Constructor <function> The constructor function for the content type.
	 */
	_loadContentType: function loadContentType(type, Constructor) {
		var index, json, content;

		if (this.manifest[type] === null) { return; }

		// Add type entry
		if (this.content[type] === undefined) {
			this.content[type] = {"objs": [], "keys": {}, "bytes": 0};
		}
		content = this.content[type];

		// Generate content for each json node
		for (index = 0; index < this.manifest[type].length; index += 1) {
			json = this.manifest[type][index];
			content.objs[index] = new Constructor(json, this.context);
			content.keys[json.key] = index;
			content.bytes += content.objs[index].bytes;
		}
	},

	/**
	 * Counts the amount of content listed in the manifest.
	 *
	 * @return <integer> The total number of bytes over all content type as
	 *     specified in the manifest.
	 */
	_countContent: function countContent() {
		var type, total = 0;
		for (type in this.content) {
			if (this.content.hasOwnProperty(type)) {
				total += this.content[type].bytes;
			}
		}

		return total;
	},

	/**
	 * Counts the amount of content which has been loaded.
	 *
	 * @return <integer> Total bytes over the loaded content.
	 */
	_countLoadedContent: function countLoadedContent() {
		var type, total = 0;

		for (type in this.content) {
			if (this.content.hasOwnProperty(type)) {
				total += this._countLoadedContentType(type);
			}
		}

		return total;
	},

	/**
	 * Counts the amount of content of a given type which has been loaded.
	 *
	 * If a file has been flagged with an error, then the errorMessage will be set.
	 * The errorMessage will have the name of the last file which has an error.
	 *
	 * @param type <string> See loadContentType().
	 */
	_countLoadedContentType: function countLoadedContentType(type) {
		var index, array, total = 0;
		array = this.content[type].objs;

		for (index = 0; index < array.length; index += 1) {
			if (array[index].isLoaded) {
				total += array[index].bytes;
			} else if (array[index].hasError) {
				this.errorMessage = "Failed to load: " + array[index].src;
			}
		}

		return total;
	},

	/**
	 * Retrieves a content object.
	 *
	 * @param type <string> The type of content as named in the manifest.
	 * @param key <string> The key string of the content item from the manifest.
	 * @return <object> The specified content object, else null.
	 */
	getContent: function getContent(type, key) {
		var content, index;

		content = this.content[type];
		if (content === undefined) {
			console.error("Unknown content type: ", type);
			return null;
		}

		index = content.keys[key];
		if (index === undefined) {
			console.error("Unknown key: ", key, " for type: ", type);
			return null;
		}

		return content.objs[index];
	},
	
	/**
	 * Executes the setup call for each Map.
	 * 
	 * @param cellSize <Size> The dimensions of a viewport cell on canvas
	 * @param output <Output> The output object for the game.
	 */
	setup: function setup(cellSize, output) {
		var map, maps;
		
		if (!this.content.hasOwnProperty('Map')) { return; }
		
		maps = this.content.Map.objs;
		for (map = 0; map < maps.length; map += 1) {
			maps[map].setup(this, cellSize, output);
		}
	}
};