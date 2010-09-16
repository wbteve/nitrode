var http = require('http'),
	sys	 = require('sys');

exports.createServer = function(handle, config) {

	if (typeof handle != 'function') {

		config = handle;
	}
	else {

		config = config || {};
		config.request = config.request || {};

		if ( ! 'handle' in config.request) {

			config.request.handle = handle;
		}
	}
	
	return new Server(config);
}

var Server = exports.Server = function(config) {

	var layers = {
		stats:	  {},
		vhost:	  {},
		server:   {},
		throttle: {},
		rewrite:  {},
		ssl:	  [],
		auth:	  [],
		filters:  {},
		pubdir:   {},
		request:  {},
	};

	this.config = {};
	this.stack  = [];

	for (var name in layers) {

		this.config[name] = config[name] || layers[name];
		
		require('./lib/' + name).call(this, this.config[name], this);
	}

	http.Server.call(this, this.handle);
}

Server.version = "0.4.1";

sys.inherits(Server, http.Server);

Server.prototype.handle = function(req, res) {
	
	var index = -1,
		self  = this;
	
	function next(err) {
		
		index++;
		
		if (err === false) {
			
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