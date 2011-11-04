/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * Loads a JSON file based on the JSON object from the manifest
 * (I heard you like JSON...).
 */

/**
 * Loads a JsonFile.
 *
 * The jsonNode used for initialization should have:
 *     "src": <string> Path to the JSON file to load
 *
 * @param jsonNode <object> An object node with a path to a json file
 * @param context <Context> The canvas context.
 * @param async <boolean> [optional] Whether the file is loaded asynchronously.
 *     Default: true
 */
function JsonFile(jsonNode, context, async) {
	// check if running locally
	if (document.URL.substr(0, 7).toLowerCase() === "file://") {
		this.REQUEST_SUCCESS = 0;
	}

	this.hasError = !this._initialize(jsonNode, context, !(async === false));
	return this;
}

JsonFile.prototype = {
	context: null,
	info: null,
	src: "",
	isLoaded: false,
	hasError: false,
	bytes: 1,
	REQUEST_SUCCESS: 200,	// 200 for internet requests, 0 for local file uri
	REQUEST_EXCEPTION: -1,
	REQUEST_READY: 4,
	
	/**
	 * Initializes this object and loads the file.
	 *
	 * @param jsonNode <object> An object node with a path to a json file
	 * @param context <Context> The canvas context.
	 * @param async <boolean> Whether the file is loaded asynchronously.
	 * @return <boolean> If the object successfully initialized.
	 */
	_initialize: function initialize(jsonNode, context, async) {
		if (!this._validateJson(jsonNode)) { return false; }
		
		this.context = context;
		this.src = jsonNode.src;
		
		if (typeof jsonNode.bytes === 'number') {
			this.bytes = Math.abs(Math.floor(jsonNode.bytes));
		}
		this._loadFile(async);
		return true;
	},
	
	/**
	 * Ensures that the initialization object has a src property.
	 *
	 * @param jsonNode <object> The object passed which has the location of the json file.
	 * @return <boolean> True iff the object validated successfully.
	 */
	_validateJson: function validateJson(jsonNode) {
		var result = true;

		if (typeof jsonNode !== 'object' || jsonNode === null) {
			return false;
		}

		result = result && (typeof jsonNode.src === 'string');
		
		if (!result) {
			console.error("Improper json object ", jsonNode, " for JsonFile", this);
		}
		
		return result;
	},
	
	/**
	 * Sends a http 'GET' request on the file.
	 *
	 * @param async <boolean> Whether to load the file asynchronously.
	 */
	_loadFile: function loadJsonFile(async) {
		var _this, request;
		_this = this;
		
		if (typeof ActiveXObject === 'function') {
			request = new ActiveXObject("MSXML2.XMLHTTP");	//IE compatibility
		} else {
			request = new XMLHttpRequest();
		}
		
		request.open('GET', this.src, async);
		
		// For async, set event function
		if (async) {
			request.onreadystatechange = function () {
				_this._parseJson(request);
			};
		}

		// Send request
		try {
			request.send(null);
		} catch (err) {
			console.error(err);
		}

		// For sync, parse it now
		if (!async) {
			_this._parseJson(request);
		}
	},
	
	/**
	 * Parses the http request response into a json object,
	 * and sets the 'info' property to the object.
	 *
	 * @param request <XMLHttpRequest> The http request object.
	 */
	_parseJson: function parseJson(request) {
		if (request.readyState === this.REQUEST_READY) {
			if (request.status === this.REQUEST_SUCCESS) {
				try {
					this.info = JSON.parse(request.responseText);
					this.isLoaded = true;
				} catch (err) {
					console.error(err, this);
					this.hasError = true;
				}
			} else {
				console.error(request.statusText, this);
				this.hasError = true;
			}
		}
	},
};