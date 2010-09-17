var Buffer		= require('buffer').Buffer,
	url			= require('url'),
	querystr	= require('querystring'),
	fs			= require('fs'),
	crypto		= require('crypto'),
	path		= require('path'),
	sys			= require('sys');

module.exports = function(config) {

	config.port			= config.port		|| 80;
	config.expose		= config.expose		|| true;
	config.chunked		= config.chunked	|| true;
	config.keepalive	= config.keepalive	|| true;

	this.httpVersion = '1.1';
	this.listen(config.port, config.host);

	this.stack.push(function(req, res, next, server) {

		//req.connection.setKeepAlive( !! config.keepalive, config.timeout);

		req.uri = url.parse(req.url, true);

		var writeHead = res.writeHead;
			
		res.writeHead = function(code, headers) {
			
			if ( ! (code == 204 || code == 304)) {
				
				if ( ! res.headers['Content-Type']) {

					res.headers['Content-Type'] = 'text/plain; charset=utf8';
				}

				if ( ! res.headers['Content-Encoding']) {

					res.headers['Content-Encoding'] = 'utf8';
				}
			}

			if (res.cookies.length > 0) {
				
				var cookies = [];
				
				for (var name in res.cookies) {

					var val = res.cookies[name];

					if (val instanceof Date) {

						val = val.toUTCString();
					}
					else if(typeof val == 'boolean') {

						if (val === true) {

							cookies.push(name);
						}

						continue;
					}

					cookies.push(name + '=' + val);
				}
				
				res.headers['Set-Cookie'] = cookies.join('; ');
			}

			if (headers) {

				for (var name in headers) {

					res.headers[name] = headers[name];
				}
			}
			
			res.headers['Date'] = new Date().toUTCString();

			if (config.expose) {

				res.headers['Server'] = 'Nitrode ' + server.constructor.version;
			}
			
			return writeHead.call(res, code, res.headers);
		}
		
		res.headers = {};
		res.cookies = {};

		if ('cookies' in req.headers) {

			req.cookies = req.headers.cookies.split(/[;,] */);

			req.cookies.forEach(function(value) {

				var pair = value.split('=');

				if (pair[0] == 'expires') {
					pair[1] = Date.parse(pair[1].trim());
				}
				else if(pair[0] == 'secure') {
					pair[1] = true;
				}
				else
				{
					var val = pair[1].trim(),
						key = pair[0];

					if (val[0] === '"') {
						val = val.slice(1, -1);
					}

					if (req.cookies[key] === undefined) {
						req.cookies[key] = querystr.unescape(pair[1].trim(), true);
					}
				}
			});
		}
		
		if ('accept' in req.headers) {
			
			req.accept = req.headers['accept'].split(',');
		}
		
		next();
	});
}