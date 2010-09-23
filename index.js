var http = require('http'),
	sys	 = require('sys');

exports.createServer = function(handle, config) {
	
	return new Server(handle, config);
}

var Server = exports.Server = function(handle, config) {

	this.stack  = [];
	
	if (typeof handle != 'function') {

		config = handle;
	}
	else {

		config = config || {};
	}
	
	this.on('processed', handle);
	
	for (var layer in config) {
		
		require('./lib/' + layer)
			.call(this, this.config[layer], this);
	}

	http.Server.call(this, this.handle);
}

Server.version = "0.5.0";

sys.inherits(Server, http.Server);

Server.prototype.handle = function(req, res) {
	
	var index = -1,
		self  = this;
	
	function next(err) {
		
		index++;
		
		if (index == self.stack.length) {
			
			self.emit('processed', req, res);
			return;
		}
		else if (err === false) {
			
			return;
		}
		else if ( ! isNaN(err)) {
			
			res.writeHead(err);
			res.end();
			
			return;
		}
		else {
			
			self.stack[index].call(self, req, res, next, self);
		}
	}
	
	next();
};