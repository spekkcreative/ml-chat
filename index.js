var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//var user = "billythefridge";

app.get('/', function(req, res){
  res.sendfile('index.php');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(443, function(){
  console.log('listening on *:443');
});

io.on('connection', function(socket){
  socket.on('message', function(msg){
    console.log('message: ' + msg);
  });
});

io.emit('some event', { for: 'everyone' });

io.on('connection', function(socket){
  socket.broadcast.emit('hi');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', user+": "+msg);
  });
});
