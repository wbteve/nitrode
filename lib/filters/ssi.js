var fs 		= require('fs'),
	path	= require('path'),
	Script 	= process.binding('evals').Script;

module.exports.render = function(data, config, ondata, req, res) {
	
	res.headers['Content-Type'] = 'text/html';
	
	var buffer = '';
	
	if ( ! data) {
		
		return ondata(data);
	}
	
	data = data.toString();
	
	data = data.replace(/"/gm, '\\"');
	data = '__write("' + data + '"); __end();';
	data = data.replace(/<!--#if expr=\\"([^"]+)\\"-->/gim, '"); if ($1) { __write("');
	data = data.replace(/<!--#elif expr=\\"([^"]+)\\"-->/gim, '"); } else if ($1) { __write("');
	data = data.replace(/<!--#else-->/gim, '"); else { __write("');
	data = data.replace(/<!--#endif-->/gim, '")} __write("');
	data = data.replace(/<!--#include (file|virtual)=\\"([^"]+)\\"-->/gim, '"); __include("$2","$1"); __write("');
	data = data.replace(/<!--#set var=\\"([^"]+)\\" value="([^"]+)"-->/gim, '"); $1=$2; __write("');
	data = data.replace(/<!--#exec (cgi|cmd)=\\"([^"]+)\\"-->/gim, '"); __exec("$2","$1"); __write("');
	data = data.replace(/<!--#config (timefmt|sizefmt|errmsg)=\\"([^"]+)\\"-->/gim, '"); __config("$2","$1"); __write("');
	data = data.replace(/<!--#echo var=\\"([^"]+)\\"-->/gim, '"); __echo("$1"); __write("');
	data = data.replace(/<!--#(flastmod|fsize) (file|virtual)=\\"([^"]+)\\"-->/gim, '"); __$1("$3","$2")');
	data = data.replace(/<!--#printenv-->/gim, '"); __printenv(); __write("');
	data = data.replace(/(\r\n|\r|\n)/gm, '\\$1');

	Script.runInNewContext(data, {
		
		__write: function(value) {
			
			buffer += value;
		},
		__echo: function(httpvar) {
			
			//TODO
		},
		__include: function(filepath, type) {

			if (type == 'file') {

				filepath = path.join(path.dirname(res.sendFileName || __dirname), filepath);
			}
			else {

				filepath = path.join(config.location, filepath);
			}
			
			buffer += fs.readFileSync(filepath);
		},
		__exec: function(cmd, type) {
		   
		   //TODO
		},
		__config: function(key, value) {
		   
		   //TODO
		},
		__flastmod: function(file, type) {
		   
		   //TODO
		},
		__fsize: function(file, type) {
		   
		   //TODO
		},
		__end: function() {
			
			ondata(buffer);
		}
	});
}