/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * An example Entity derived character.
 * See the guy in the clinic.
 */
function Guy() {
	this.question1.choices[0].func = wrapper(this, '_setQuestion2');
	this.question1.choices[1].func = wrapper(this, '_setResponse');
	this.question1.choices[2].func = wrapper(this, '_setResponse');
	this.question2.choices[0].func = wrapper(this, '_setResponse');
	this.question2.choices[1].func = wrapper(this, 'onUse');
	return this;
}

Guy.prototype = new Entity();

/**
 * The generic response of the character.
 */
Guy.prototype.response = {
	msg: ["No, that doesn't sound right."],
	choices: []
};

/**
 * Sets the dialog to the first question.
 */
Guy.prototype.onUse = function talk(user) {
	this.output.setMessage(this.question1.msg, this.question1.choices);
};

/**
 * Sets the dialog to the response message.
 */
Guy.prototype._setResponse = function setResponse() {
	this.output.setMessage(this.response.msg, this.response.choices);
};

/**
 * Sets the dialog to the question2 message.
 */
Guy.prototype._setQuestion2 = function setQuestion2() {
	this.output.setMessage(this.question2.msg, this.question2.choices);
};

/**
 * The first question.
 */
Guy.prototype.question1 = {
	msg: ["How do you kill an undead dragon?"],
	choices: [
		{label: "An undead sword?", func: undefined},
		{label: "Sleeping pills?", func: undefined},
		{label: "Runaway screaming like a litte girl?", func: undefined}
	]
};

/**
 * The second question.
 */
Guy.prototype.question2 = {
	msg: ["How do you forge an undead sword?"],
	choices: [
		{label: "Undead metal?", func: undefined},
		{label: "Fire from a slain undead dragon?", func: undefined}
	]
};
