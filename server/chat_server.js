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
	var name = 'Guest' + guestNumber;
	nickNames[socket.id] = name;
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	namesUsed.push(name);
	return guestNumber + 1;
}

function joinRoom(socket, room) {
	socket.join(room);
	currentRoom[socket.id] = room;
	socket.emit('joinResult', {room: room});
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + '.'
	});

	var usersInRoom = io.sockets.clients(room);
	if (usersInRoom.length > 1) {
		var usersInRoomSummary = 'Participants currently in ' + room + ': ';
		for (var index in usersInRoom) {
			var userSocketId = usersInRoom[index].id;
			if (userSocketId != socket.id) {
				if (index > 0) {
					usersInRoomSummary += ', ';
				}
			usersInRoomSummary += nickNames[userSocketId];
			}
		}
		usersInRoomSummary += '.';
		socket.emit('message', {text: usersInRoomSummary});
	}
}


function handleMsgBroadcast(socket, nickNames) {

}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	
}

function handleRoomJoin(socket) {

}