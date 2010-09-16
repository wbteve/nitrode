var sys		= require('sys'),
	Buffer  = require('buffer').Buffer;

module.exports = function(config) {

	this.stack.push(function(req, res, next, server) {
		
		req.auth = req.auth || {

			check: function(callback, realm) {

				if ('authorization' in req.headers) {

					var parts = req.headers.authorization.split(' ');

					if (parts[0].toLowerCase() == 'basic') {

						var credentials = new Buffer(parts[1], 'base64')
							.toString('utf8')
							.split(':');

						if ( !! callback.call(this, credentials[0], credentials[1])) {

							req.auth.user = credentials[0];

							return true;
						}
					}
				}

				res.headers['WWW-Authenticate'] =
					'Basic realm="' + config.realm + '"';

				return false;
			},

			authorized: function() {
				
				return req.auth.user !== undefined;
			}
		};
		
		for (var i in config) {
			
			var conf = config[i];
			
			if (req.uri.pathname.match(conf.path)) {
				
				if ( ! req.auth.check(conf.callback, conf.realm)) {
					
					return next(401);
				}
			}
		}
		
		next();
	});
}