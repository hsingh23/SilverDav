/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 * 
 * Provides basic global methods (require, setWrappedTimeout, mod) and
 * includes the rest of the api.
 *
 * This file should be included in the <head>.
 */

/**
 * Appends a javascript <script> to the <head> if it does not already exist.
 * Aliases of same file are treated as different elements.
 *
 * Assumes there is a <head> element.
 *
 * The behavior is undefined when called within a function.
 * Required files should only have definitions and requires.
 *
 * Derived classes should NOT use require to include the base object (does not work).
 * Always require the base object first.
 *
 * @param javascriptFile <string> The path to the .js file to load relative from the .html.
 *                       (A leading '/' denotes absolute path)
 */
function require(javascriptFile) {
	var scripts, index;

	scripts = document.getElementsByTagName('head')[0].getElementsByTagName('script');
	javascriptFile = javascriptFile.toLowerCase();

	//check if script was already added
	if (scripts !== null) {
		for (index = 0; index < scripts.length; index += 1) {
			if (scripts[index].getAttribute('src').toLowerCase() === javascriptFile) {
				return;
			}
		}
	}

	document.write('<script type="text/javascript" src="', javascriptFile, '"></script>');
}

/**
 * Calls an instance method after a delay like setTimeout.
 *
 * @param object <object> The object instance to which the function is attached.
 *        		 If 'undefined' or 'null', 'window' is used instead.
 * @param functionName <string> A string of the name of the function to call.
 * @param milliseconds <number> The time in milliseconds to delay the call.
 * @param param <var> [optional] A parameter passed to the function when called.
 */
function setWrappedTimeout(object, functionName, milliseconds, param) {
	var curried;

	if (object === null || object === undefined) {
		object = window;
	}
	if (typeof object[functionName] !== 'function') {
		console.error('Expected function "' + functionName + '" in: ', object);
		return;
	}

	curried = function () {
		object[functionName](param);
	};
	setTimeout(curried, milliseconds);
}

/**
 * Returns the a modulo b.
 * Behaves differently than normal js '%' for negative numbers.
 * mod gives: -2 mod 7 = 5.
 *
 * @param a,b <integer> Inputs for mod operatation
 * @return <integer> Returns a modulo b
 */
function mod(a, b) {
	return ((a % b) + b) % b;
}

/**
 * Wraps a function belonging to an object as a global function.
 *
 * @param obj <object> The object which holds the function.
 * @param funcName <string> The name of the function to call.
 */
function wrapper(obj, funcName) {
	var result;
	
	result = function wrap() { obj[funcName](); };
	
	return result;
};

//load api scripts
require('api/structs.js');
require('api/main.js');
require('api/content-loader.js');
require('api/input.js');
require('api/viewport.js');
require('api/output.js');
require('api/pc.js');