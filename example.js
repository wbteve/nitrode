var nitrode = require('../nitrode');

var srv = nitrode.createServer({
	
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
	vhost: [{
		host: /comet\..+/,
		server: nitrode.createServer({
			comet: {
				message: function(client, message, channel) {

					this.publish(channel, message);
				},
				connect: function(client, req) {

					var username = req.uri.querystr.username;

					if ( ! username) {

						return false;
					}
					else {

						for (var id in this.clients) {

							if (this.clients[id].username == username) {

								return false;
							}
						}

						this.publish('user/connect')

						return accept();
					}
				},
				subscribe: function(client, channel) {

					var path = channel.split('/');

					switch (path[0]) {

						case 'pm' : {

							return path[1] == client.username;
						}
						case 'msg' : {

							return true;
						}
						case default: {

							return false;
						}
					}
				},
				unsubscribe: function(client, channel) { },
				disconnect: function(client) {

					this.publish('user/disconnect', client.id);
				}
			}
		})
	}],
	server: {
		port: 80,
		host: undefined,
		expose: true,
		keepalive: true,
		timeout: 30000, // 30 Seconds
		mimes: { },
		throttle: 15000,
		ssl: {
			cert: undefined,
			key: undefined
		}
	},
	rewrite: [{
		path: /favicon.ico/,
		location: '../../' + __dirname
	}],
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
	filters: {
		ssi: {
			mimes: [/text\/x-server-parsed-html/],
			config: { }
		},
		parrot: {
			mimes: [/.+/],
			config: { }
		},
		/*
		compress: {
			mimes: [/text\/.+/, /message\/.+/, /.+\/.+\\+xml/, /.+\/xml-.+/, /.+\/atom+xml/, /.+\/xml-dtd/, /.+\/javascript/, /.+\/json/, /.+\/rtf/, /.+\/xml/],
			config: { }
		}
		*/
	},
	pubdir: {
		path: /.+/,
		location: __dirname + '/public',
		cache: 1000,
		mimes: { },
		index: 'index.shtml'
	}
});