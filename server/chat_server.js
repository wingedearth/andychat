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

		console.log("checkpoint 1");
		joinRoom(socket, 'Lobby'); // place user in lobby upon connection

		handleMsgBroadcast(socket, nickNames); // handle user messages

		handleNameChangeAttempts(socket, nickNames, namesUsed);

		handleRoomJoin(socket);

		// send list of occupied rooms upon request
		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
		});

    // handleClientDisconnect(socket, nickNames, namesUsed);
    handleClientDisconnect(socket);
	});
};


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
	console.log("checkpoint 2");
	socket.join(room);
	currentRoom[socket.id] = room;
	socket.emit('joinResult', {room: room});
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + '.'
	});

	console.log("checkpoint 3");

	var usersInRoom = io.sockets.clients(room);
	console.log("checkpoint 4");

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
	socket.on('messsage', function(message) {
		socket.broadcast.to(message.room).emit('message', {
			text: nickNames[socket.id] + ': ' + message.text
		});
	});
}

function handleNameChangeAttempts(socket) {
	socket.on('nameAttempt', function(name) {

    if (name.indexOf('Guest') ==0) {
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest".'
			});

		} else {
			if (namesUsed.indexOf(name) == -1) {
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed.push(name);
				nickNames[socket.id] = name;
				delete namesUsed[previousNameIndex];
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message,', {
					text: previousName + ' shall now be referred to as ' + name + '.'
				});

			} else { // if name is already in use, return error message
				socket.emit('nameResult', {
					success: false,
					message: 'That name is already in use, and we value originality here.'
				});
			}
		}
	});
}

function handleRoomJoin(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

function handleClientDisconnect(socket) {
  socket.on('disconnect', function() {
    var nameIndex = names.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}

