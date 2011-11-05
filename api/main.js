/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 * 
 * The main entry point of the javascript canvas game.
 *
 * Assumes a 'Game' object is defined (see js/sample-game.js).
 */
 
 //Global reference to the game object for debugging
 var game = null;
/**
 * Begins the execution of the game.
 * Should be called on the 'onload' event for the <body>
 *
 * @param canvasId <string> The id of the canvas element used for the game.
 * @param manifestPath <string> The url path to the context manifest json file.
 */
function main(canvasId, manifestPath) {
	var canvas, context;

	canvas = document.getElementById(canvasId);
	if (canvas === null) {
		console.error('No element with id="' + canvasId + '" found.');
		return;
	}
	if (canvas.tagName.toLowerCase() !== 'canvas') {
		console.error('Element with id="' + canvasId + '" was not a <canvas>.');
		return;
	}

	context = canvas.getContext('2d');
	game = new Game(context, manifestPath);
}