var io = require('socket.io-client');
var userN = process.argv[2];
console.log("username = %s", userN);

console.log("Connecting...");
var socket = io.connect("wss://localhost:8082");

socket.emit('sessionidrequest', {msg: 'give me session ID',
								 username: userN});

socket.on('sessionidresponse', responseHandler);

socket.on("connect", function() { console.log("connection success"); });
socket.on("connect-failed", function() { console.log("connection fail"); });


function responseHandler(message) {
	console.log(message);
}