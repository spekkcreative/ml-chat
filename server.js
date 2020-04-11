"use strict";
var fs = require('fs');
var numUsers = 0;
var options = {
    key: fs.readFileSync(__dirname + '/shared/config/private.pem'),
    cert: fs.readFileSync(__dirname + '/shared/config/pub.pem'),
    ca: fs.readFileSync(__dirname + '/shared/config/chain.pem')
};
var app = require('express')();
var https = require('https');
var io = require('socket.io')(https);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var server = https.createServer(options, app);
server.listen(8443);

var io = require('socket.io').listen(server);
io.set('origins', '*:*.mikeslessons.com');

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
});