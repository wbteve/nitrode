var cp		= require('child_process'),
	sys		= require('sys'),
	fs		= require('fs'),
	Buffer	= require('buffer').Buffer,
	clrf	= new Buffer([0x0d, 0x0a]).toString();

module.exports.render = function(data, config, onresult, req, res) {
	
	if (req.headers['accept-encoding'].match(/gzip/)) {
		
		var gzip = null;
		
		try {
				
			gzip = new require('compress').GzipStream();
		}
		catch(e) {
				
			gzip = cp.spawn('gzip', ['-9']);
		}
		
		res.headers['Content-Encoding'] = 'gzip';
		
		gzip.stdout.on('data', function(data) {

			onresult(data);
		});

		gzip.stdin.end(data);
	}
	else {
		
		onresult(data);
	}
};