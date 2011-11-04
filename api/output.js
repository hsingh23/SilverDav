/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * Output handles outputing text to the screen.
 */
function Output(context, rectangle, input) {
	this.context = context;
	this.input = input;

	this.bounds = new Rectangle();
	this.bounds.copy(rectangle);

	this.textPosition = new Point();
	this.textPosition.copy(this.bounds.point);
	//this.textPosition.x += 4;
	//this.textPosition.y += 2;

	this.textHeight = Math.floor(this.bounds.size.height / this.lines) - 2;
	this.font = "" + this.textHeight + 'px Verdana, Geneva, sans-serif';
	this.textHeight += 1;

	this.messages = [];
	this.choices = [];
}

Output.prototype = {
	context: null,
	input: null,
	bounds: null,
	font: "",
	textPosition: null,
	textHeight: 0,
	messages: null,
	choices: null,
	currentMessage: 0,		// index of the top message line being displayed
	lines: 3,				// number of lines to show at a time
	clearColor: 'black',
	textColor: 'white',
	showingChoices: false,	// which menu you are in
	currentChoice: 0,		// index of the currently select choice

	/**
	 * Redraws any 'live' components (things that need to be redrawn every frame)
	 */
	draw: function drawOutput() {
	},

	/**
	 * Updates the state of the output object. (input processing)
	 */
	update: function updateOutput() {
		if (!this.isActive()) { return; }
		
		if (!this.showingChoices) {
			this.showMessages();
		} else {
			this.showChoices();
		}
		
		this.input.update(0);
	},
	
	/**
	 * Clears the message area of the canvas.
	 */
	clear: function clearOutput() {
		this.context.fillStyle = this.clearColor;
		this.lineWidth = 1;
		this.context.textBaseline = 'top';
		this.context.font = this.font;
		this.context.fillRect(
			this.bounds.point.x,
			this.bounds.point.y,
			this.bounds.size.width,
			this.bounds.size.height
		);
		this.context.fillStyle = this.textColor;
	},

	/**
	 * Manages the input controls for the messages menu.
	 */
	showMessages: function showMessages() {
		if (this.input.isKeyPressed(KEY.S) || this.input.isButtonPressed(this.input.BUTTON.DOWN)) {
			this._scrollMessages(false);
		}
		if (this.input.isKeyPressed(KEY.W) || this.input.isButtonPressed(this.input.BUTTON.UP)) {
			this._scrollMessages(true);
		}
		
		if (this.input.isKeyPressed(KEY.SPACE) || this.input.isButtonPressed(this.input.BUTTON.A)) {
			if (this.choices.length === 0) {
				this.clearMessages();
				return;
			}
			this.showingChoices = true;
			this.clear();
			this._drawChoices();
		}		
		if (this.input.isKeyPressed(KEY.ESCAPE) || this.input.isButtonPressed(this.input.BUTTON.B)) {
			this.clearMessages();
		}
	},
	
	/**
	 * Manages the input controls for the choices menu.
	 */
	showChoices: function showChoices() {
		var picked;
		if (this.input.isKeyPressed(KEY.S) || this.input.isButtonPressed(this.input.BUTTON.DOWN)) {
			this._scrollChoices(false);
		}
		if (this.input.isKeyPressed(KEY.W) || this.input.isButtonPressed(this.input.BUTTON.UP)) {
			this._scrollChoices(true);
		}
		if (this.input.isKeyPressed(KEY.A) || this.input.isButtonPressed(this.input.BUTTON.LEFT)) {
			//this._scrollChoices(false);
		}
		if (this.input.isKeyPressed(KEY.D) || this.input.isButtonPressed(this.input.BUTTON.RIGHT)) {
			//this._scrollChoices(true);
		}
		
		if (this.input.isKeyPressed(KEY.ESCAPE) || this.input.isButtonPressed(this.input.BUTTON.B)) {
			if (this.messages.length === 0) {
				this.clearMessages();
				return;
			}
			this.showingChoices = false;
			this.clear();
			this._drawMessages();
		} else if (this.input.isKeyPressed(KEY.SPACE) || this.input.isButtonPressed(this.input.BUTTON.A)) {
			picked = this.choices[this.currentChoice].func;
			if (typeof picked === 'function') { picked(); }
		}
	},
	
	/**
	 * Changes the current message text and choice options.
	 *
	 * Choices will act as a menu to be displayed after the message.
	 *
	 * @param messages <array> An array of string messages to display.
	 * @param choices <array> [{label:<string>, func:<function>}]
	 *     An array of objects describing the choices. The function should
	 *     be global. (eg wrap 'this' in a closure if needed)
	 */
	setMessage: function setMessage(messages, choices) {
		this.clear();
		if (messages !== null && typeof messages === 'object') {
			this.messages = messages;
		}
		if (choices !== null && typeof choices === 'object') {
			this.choices = choices;
		}
		this.currentMessage = 0;
		this.showingChoices = this.messages.length === 0;
		this.currentChoice = 0;
		
		this._drawMessages();
	},
	
	/**
	 * Draws the current choices dialog.
	 */
	_drawChoices: function drawChoices() {
		var index, last, limit, y, x, start;
		
		start = this.currentChoice;
		last = this.choices.length;
		limit = this.currentChoice + this.lines;
		if (limit > last) {
			start = Math.max(this.choices.length - this.lines, 0);
		} else {
			last = limit;
		}
		
		y = this.textPosition.y;
		x = this.textPosition.x + 10;
		
		for (index = start; index < last; index += 1) {
			this.context.fillText(this.choices[index].label, x, y);
			y += this.textHeight;
		}
		
		this._drawIndicators(start, this.choices);
		
		y = this.textPosition.y + 5;
		y += this.textHeight * (this.currentChoice - start);
		this.context.fillStyle = this.textColor;
		this.context.fillRect(
			this.bounds.point.x,
			y,
			5,
			5
		);
	},
	
	/**
	 * Draws the current set of messages.
	 * Limited to this.lines number of messages.
	 */
	_drawMessages: function drawMessages() {
		var index, last, limit, y;
		
		last = this.messages.length;
		limit = this.currentMessage + this.lines;
		last = last < limit ? last : limit;
		y = this.textPosition.y;
		for (index = this.currentMessage; index < last; index += 1) {
			this.context.fillText(this.messages[index], this.textPosition.x, y);
			y += this.textHeight;
		}
		
		this._drawIndicators(this.currentMessage, this.messages);
		
		if (this.choices.length !== 0) {
			this.context.fillRect(
				this.bounds.point.x + this.bounds.size.width - 10,
				this.bounds.point.y + this.bounds.size.height - 5,
				5,
				5
			);
		}
	},

	/**
	 * Draws indicators to indicate additional text.
	 */
	_drawIndicators: function drawIndicators(current, list) {
		if (current > 0) {
			this.context.fillStyle = this.textColor;
			this.context.fillRect(
				this.bounds.point.x + this.bounds.size.width - 5,
				this.bounds.point.y,
				5,
				5
			);
		}
		
		if (current + this.lines < list.length) {
			this.context.fillStyle = this.textColor;
			this.context.fillRect(
				this.bounds.point.x + this.bounds.size.width - 5,
				this.bounds.point.y + this.bounds.size.height - 5,
				5,
				5
			);
		}
	},

	/**
	 * Scrolls the choices dialog by one.
	 *
	 * @param rewind <boolean > [optional] Default false. If true, then moves to previous option.
	 */
	_scrollChoices: function scrollChoices(rewind) {
		var end;
		this.currentChoice += rewind === true ? -1 : 1;
		end = this.choices.length - 1;
		if (this.currentChoice > end) {
			this.currentChoice = end;
		}
		if (this.currentChoice < 0) { this.currentChoice = 0; }
		this.clear();
		this._drawChoices();
	},

	/**
	 * Moves the current message and redraws the messages.
	 *
	 * @param rewind <boolean> [optional] Default false. If true, then moves to previous message.
	 */
	_scrollMessages: function scrollText(rewind) {
		var end;
		this.currentMessage += rewind === true ? -1 : 1;
		end = this.messages.length - this.lines;
		if (this.currentMessage > end) {
			this.currentMessage = end;
		}
		if (this.currentMessage < 0) { this.currentMessage = 0; }
		this.clear();
		this._drawMessages();
	},
	
	/**
	 * Checks if there is any content draw for output.
	 * Used to know if the game should wait on the output menu.
	 */
	isActive: function isActive() {
		return this.messages.length !== 0 || this.choices.length !== 0;
	},
	
	/**
	 * Clears all messages and choices.
	 */
	clearMessages: function clearMessages() {
		this.messages = [];
		this.choices = [];
		this.clear();
	}
};