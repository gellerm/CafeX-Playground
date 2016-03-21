var serverPort = 8082;
var https = require('https');
var r = require('request');
var fs = require('fs');
var gatewayHost = "ec2-52-88-97-60.us-west-2.compute.amazonaws.com";
var gatewayPort = "8080";
var gatewayURLPath = "/gateway/sessions/session";
var websocketSecurePort = "8443";
var cafexAppID = "mgtestinthehouse";
var keyFileName = "keys/server.key";
var certFileName = "keys/server.crt";
var options = { key: fs.readFileSync(keyFileName),
				cert: fs.readFileSync(certFileName),
				ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
				honorCipherOrder: true
			  };

var url = "http://" + gatewayHost + ":" + gatewayPort + gatewayURLPath;
var jsonStr = { "webAppId": cafexAppID,
				"timeout": 1,
				"urlSchemeDetails": 
				{
					"secure": true,
					"host": gatewayHost,
					"port": websocketSecurePort
				},
				"voice": 
					{
						"domain": gatewayHost,
						"inboundCallingEnabled": true
					}
};

var app = https.createServer(options, function (req, res) {
	res.writeHead(200);
	res.end("Hello sessioID proxy");
});

var socket = require('socket.io').listen(app);
console.log("Starting socket server on: " + serverPort);

socket.on('connection', onConnectHandler);

function onConnectHandler(socket) {
	console.log("New socket connection");
	socket.on('sessionidrequest', function (message) {onSessionIDRequest(message, socket)});
}

function onSessionIDRequest (message, socket) {
	console.log("Session ID requested for username: " + message.username);
	jsonStr.voice.username = message.username;
	r.post(
			url,
			{json: jsonStr},
			function(error, response, body) {
				responseHandler(error, response, body, socket);
			}
			); 

}

function responseHandler(error, response, body, socket) {
	if (!error && response.statusCode == 200) {
		console.log(body)
		socket.emit('sessionidresponse', body);
	} else {
		console.log("Error: " + response.statusCode);
		socket.emit('sessionidresponse', {status: response.statusCode});
	}
}

app.listen(serverPort, function() {
	console.log('Server listening on %s', serverPort);
});
