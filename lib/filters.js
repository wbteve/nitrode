
module.exports = function(config) {
	
	this.stack.push(function(req, res, next, server) {
		
		var end   		= res.end,
			writeHead 	= res.writeHead,
			write		= res.write,
			buffer 		= '',
			code 		= 200,
			headers 	= {},
			sent 		= false,
			size		= 0;
			
		res.writeHead = function(a, b) {
			
			code 	= a;
			headers = b;
			
			return res;
		}

		res.write = function(data, encoding) {

			buffer += data.toString();

			return true;
		}
		
		res.flush = function(onsent) {
			
			var keys   = Object.keys(config),
				index  = -1;

			function forwards(data) {
				
				index++;
				
				data = data.toString();
				
				if (index >= keys.length) {
					
					if ( ! sent) {
						
						if (size > 0) {
							
							res.headers['Content-Length'] = size;
						}
						
						sent = true;
						
						writeHead.call(res, code, headers);
					}
					
					write.call(res, data);
					
					if (onsent) {
						
						onsent();
					}
					
					return;
				}
				
				var filter  = keys[index],
					options = config[filter];
				
				if (res.headers['Content-Type'] && res.headers['Content-Type'].match(options.mime)) {
					
					require('./filters/' + filter)
						.render(data, options.config, forwards, req, res);
				}
				else {
					
					forwards(data);
				}
			}
			
			forwards(buffer);
		}
		
		res.end = function(data, encoding) {
			
			if (data) {
				
				buffer += data.toString();
			}
			
			if (buffer.length == 0) {
				
				writeHead.call(res, code, headers);
				end.call(res);
			}
			else {
				
				if ( ! sent) {
				
					size = buffer.size;
				}
			
				res.flush(function() {

					req.connection.end();
				});
			}
		}
		
		next();
	});
}