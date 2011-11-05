function stab(descriptor, map, cellSize, loader) {

	this.setup(descriptor, map, cellSize, loader);
}

stab.prototype = new Entity();
stab.prototype.input = null;

stab.prototype._updateBase = stab.prototype.update;

