var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var busy_sockets = []
var sock_list = []

io.on('connection',function(socket){

    var partner ;
    var chat_socket= ''
  socket.on('essentials',function(){
    chat_socket = sock_list[0]
    if(chat_socket)
    {   console.log('inside');
        sock_list.splice(0,1);
        socket.emit('addrs',chat_socket.id)
        chat_socket.emit('addrs',socket.id)
        busy_sockets.push(socket)
        busy_sockets.push(chat_socket)
    }
    else
    { console.log('pushing socket');
      sock_list.push(socket)

    }

  })
    socket.on('sender_addrs',function(data){
      partner = data 
      console.log('sender address receieved ')

    })
    socket.on('send_msg',function(msg_data){
      console.log(msg_data.addrs)
      for(var i = 0; i<busy_sockets.length;i++)
        if(busy_sockets[i].id == msg_data.addrs)
        {console.log('here');
          busy_sockets[i].emit('recv_msg',msg_data.msg)

        }

    })
    socket.on('disconnect',function(){
      console.log('disconncet');
      for(var ind = 0;ind<sock_list.length;ind++)
        if(sock_list[ind].id==socket.id)
          sock_list.splice(ind,1)
      for(var ind = 0; ind<busy_sockets.length;ind++)
        if(busy_sockets[ind].id == socket.id)
          {busy_sockets.splice(ind,1)
            break
          }
      for(var ind = 0; ind<busy_sockets.length;ind++)
        if(busy_sockets[ind].id == partner)
          {busy_sockets[ind].emit('info',"Partner Disconnected")
           sock_list.push(busy_sockets[ind])
           console.log('sended message to partner')
           busy_sockets.splice(ind,1)
           break
          }
          
    })


})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

server.listen(3000,function(){})
module.exports = app;
