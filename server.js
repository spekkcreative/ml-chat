var app = require('express')();
var fs = require('fs');
var https = require('https');

var sslOptions = {
  key: fs.readFileSync('shared/config/key.pem'),
  cert: fs.readFileSync('shared/config/cert.pem'),
  passphrase: 'test'
};

var server = https.createServer(sslOptions,app).listen(8443);

var io = require('socket.io')(server);
io.set('origins', '*:*.mikeslessons.com');

server.listen(8443, function(){
    console.log('listening on *:443');
});

var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });
    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
    /*
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });


    */
});
