var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

// define listen method for use of chat_server in server.js
exports.listen = function(server) {

	io = socketio.listen(server); // start socket.io server
	io.set('log level', 1);

	// handle user connections
	io.sockets.on('connection', function (socket) {
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

		joinRoom(socket, 'Lobby'); // place user in lobby upon connection

		handleMsgBroadcast(socket, nickNames); // handle user messages

		handleNameChangeAttempts(socket, nickNames, namesUsed);

		handleRoomJoin(socket);

		// send list of occupied rooms upon request
		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
		})

	})
}


////////////////////////
// Define Functions
////////////////////////

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {

}

function joinRoom(socket, room) {

}

function handleMsgBroadcast(socket, nickNames) {

}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	
}

function handleRoomJoin(socket) {

}