

module.exports = function(config) {
	
	config.forEach(function(rewrite) {
		
		if ( ! rewrite.path instanceof RegExp) {
			
			rewrite.path = new RegExp(rewrite.path.toString());
		}
	});
		
	this.stack.push(function(req, res, next, server) {
		
		config.forEach(function(rewrite) {
			
			if (rewrite.path.test(req.url)) {
				
				for (var i = 0; match = req.url.match(rewrite.path); i++) {
					
					req.url = req.url.replace('$' + i, match);
				}
			}
		});

		for (var i in config) {
			
			var rewrite = config[i],
				matches = req.url.match(rewrite.path);

			if (matches) {

				for (var i in matches) {

					req.url = req.url.replace('$' + i, matches[i]);
				}
			}
		}

		next();
	});
}