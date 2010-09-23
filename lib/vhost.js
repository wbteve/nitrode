

module.exports = function(config) {
	
	this.stack.push(function(req, res, next, server) {

		var host = req.headers.host.split(':')[0];
		
		config.forEach(function(vhost) {
			
			if (vhost.host.test(host)) {
				
				
			}
		})

		if (host in config) {

			config[host].emit('request', req, res, config[host]);

			next(false);
		}

		next();
	});
}