var path = require('path'),
	fs	 = require('fs'),
	url	 = require('url'),
	sys	 = require('sys');
	
module.exports = function(config, server) {

	config.index = config.index || 'index.html';
	config.cache = config.cache || 3600 * 24 * 365;
	
	var files = [
		'/etc/mime.types',
		'/etc/apache2/mime.types',			  	// Apache 2
		'/etc/apache/mime.types',			  	// Apache 1
		'/etc/httpd/mime.types',				// Mac OS X <=10.5
		'/etc/httpd/conf/mime.types',		   	// Apache
		'/usr/local/etc/httpd/conf/mime.types',
		'/usr/local/lib/netscape/mime.types',
		'/usr/local/etc/httpd/conf/mime.types',	// Apache 1.2
		'/usr/local/etc/mime.types'				// Apache 1.3
	];

	var mimes = JSON.parse(fs.readFileSync('./conf/mime.json'));

	files.forEach(function(value) {

		try {

			var data = fs.readFileSync(value);

			data.split(/[\r\n]+/).forEach(function(line) {

				line = line.trim();

				if (line.charAt(0) !== '#') {

					var words = line.split(/\s+/);

					if (words.length >= 2) {

						var type = words.shift().toLowerCase();

						words.forEach(function(suffix) {

							mimes[suffix.toLowerCase()] = type;
						});
					}
				}
			});
		}
		catch(e) { }
	});

	for (var ext in config.mimes) {

		mimes[ext] = config.mimes[ext];
	}

	config.mimes = mimes;

	this.stack.push(function(req, res, next, server) {
		
		res.setFileHeaders = function(file, callback) {
			
			fs.stat(file, function(err, stats) {
				
				if (err || ! stats.isFile()) {
					
					callback(404);
				}
				else {
					
					var modsince = Date.parse(req.headers['if-modified-since'] || req.headers['if-unmodified-since']);
					
					if ( ! isNaN(modsince) && stats.mtime <= modsince) {
						
						callback(304);
					}
					else {

						if (res.headers['Content-Type'] === undefined) {
							
							var mime = 'application/octet-stream',
								ext  = path.extname(file);

							if (ext in config.mimes) {

								mime = config.mimes[ext];
							}
							
							res.headers['Content-Type'] = mime;
						}
						
						res.headers['Content-Length'] = stats.size;
						res.headers['Last-Modified']  = stats.mtime.toUTCString();
						res.headers['Cache-Control']  = 'public max-age=' + config.cache;
						
						callback();
					}
				}
			});
		}
		
		res.sendfile = function(file, onsent) {
			
			res.sendFileName = file;
			
			res.setFileHeaders(file, function(err) {
				
				if (err) {

					onsent(err);
				}
				else {
					
					var range   = req.headers.range || req.headers['request-range'],
						options = {};

					if (range && range.match(/bytes=([0-9]+)-([0-9]+)/)) {

						var values = range.split('=')[1].split('-');

						options.from = values[0];
						options.to   = values[1];
					}
					
					res.writeHead(200);
					
					sys.pump(fs.createReadStream(file, options), res, onsent);
				}
			});
		};

		var pathname = req.uri.pathname;
		
		if (pathname.match(config.path)) {
			
			var file = path.join(config.location, pathname),
				ext  = path.extname(file);

			if (ext == '') {

				file = path.join(file, config.index);
				ext  = path.extname(config.index);
			};
			
			res.sendfile(file, next);
		}
		else {
			
			next();
		}
	});
}