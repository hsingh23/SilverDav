/**
 * @file
 * @author Harry Hsiao - UIUC ACM GameBuilders
 * @version 1.11.04.00
 * @license LGPL
 *
 * Defines simple data objects.
 */

/**
 * Creates a Point object. (pair of numbers)
 *
 * @param x,y <number> If neither are specified (0,0) is returned.
 *			  If y is unspecified then x is used for both values.
 */
function Point(x, y) {
	this.x = x === undefined ? 0 : x;
	this.y = y === undefined ? this.x : y;
	return this;
}
Point.prototype = {
	x:0,
	y:0,
	clone: function clonePoint() { return new Point(this.x, this.y); },
	set: function setPoint(x, y) { this.x = x; this.y = y; },
	copy: function copyPoint(point) { this.x = point.x; this.y = point.y; }
};

/**
 * Creates a Size object (behaves like Point)
 *
 * @param width,height <number> (See Point)
 */
function Size(width, height) {
	this.width = width === undefined ? 0 : width;
	this.height = height === undefined ? this.width : height;
	return this;
}
Size.prototype = {
	width:0,
	height:0,
	clone: function cloneSize() { return new Size(this.width, this.height); },
	set: function setSize(width, height) { this.width = width; this.height = height; },
	copy: function copySize(size) { this.width = size.width; this.height = size.height; }
};

/**
 * Creates a Cell object (pair of ints)
 *
 * @param row,column <integer> (See Point) Values will be floored.
 */
function Cell(row, column) {
	this.row = row === undefined ? 0 : Math.floor(row);
	this.column = column === undefined ? this.row : Math.floor(column);
	return this;
}
Cell.prototype = {
	row:0,
	column:0,
	clone: function cloneCell() { return new Cell(this.row, this.column); },
	set: function setCell(row, column) { this.row = Math.floor(row); this.column = Math.floor(column); },
	copy: function copyCell(cell) { this.row = cell.row; this.column = cell.column; }
};

/**
 * Creates a Rectangle which holds a Point and a Size.
 *
 * @param x,y <number> (see Point)
 * @param width,height <number> (see Size)
 */
function Rectangle(x, y, width, height) {
	this.point = new Point(x, y);
	this.size = new Size(width, height);
	return this;
}
Rectangle.prototype = {
	point:null,
	size:null,
	clone: function cloneRect() { return new Rectangle(this.point.x, this.point.y, this.size.width, this.size.height); },
	set: function setRect(point, size) { this.point = point.clone(); this.size = size.clone(); },
	copy: function copyRect(rect) { this.point.copy(rect.point); this.size.copy(rect.size); }
};