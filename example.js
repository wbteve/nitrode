var nitrode = require('../nitrode');

var srv = nitrode.createServer({
	server: {
		port: 80,
		host: undefined,
		expose: true,
		keepalive: true,
		timeout: 30000, // 30 Seconds
		mimes: { }
	},
	pubdir: {
		path: /.+/,
		location: __dirname + '/public',
		cache: 1000,
		mimes: { },
		index: 'index.shtml'
	},
	filters: {
		ssi: {
			mimes: [/text\/x-server-parsed-html/],
			config: { }
		},
		parrot: {
			mimes: [/.+/],
			config: { }
		},
		compress: {
			mimes: [/text\/.+/, /message\/.+/, /.+\/.+\\+xml/, /.+\/xml-.+/, /.+\/atom+xml/, /.+\/xml-dtd/, /.+\/javascript/, /.+\/json/, /.+\/rtf/, /.+\/xml/],
			config: { }
		}
	},
	auth: [{
		path: /.+/,
		callback: function(user, pass) {
			return {
				'admin' : 'admin',
				'user'  : 'password'
			}[user] == pass;
		},
		realm: 'Secure Area'
	}],
	vhost: {
	},
	rewrite: [{
		path: /favicon.ico/,
		location: '../../' + __dirname
	}],
	ssl: {
		cert: undefined,
		key: undefined
	},
	request: {
		handle: function(req, res) {},
	},
	stats: {
		interval: 1000,
		callback: function(stats) {

			if (stats.requests > 0) {

				console.log('reqs: ' + stats.requests);
			}
		},
		request: function(stats) {

			console.log('request served in: ' + stats.time / 1000 + ' seconds.');
		}
	},
	trottle: {
		connections: 15000
	}
});