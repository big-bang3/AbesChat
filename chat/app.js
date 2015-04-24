var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var routes = require('./routes/index');
var users = require('./routes/users');
var mongoskin = require('mongoskin');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var db = mongoskin.db('mongodb://localhost:27017/chat')


app.options(/\.*/, function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
        res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
        res.send(200);
    });

var sockets = {};

io.on('connection',function(socket){
    var user_name,user_id
     socket.on('mob_list',function(data){
      db.collection('user').find().toArray(function(err,res){
      socket.emit('users_list',res);
    
    })

     });

     socket.on('image',function(data){
      db.collection('user').update({_id : mongoskin.ObjectID(user_id)},{'$set':{image:data}},function(err,res){
        if(err) throw err;
        });
    socket.emit('image_updated',data)
     });

    var call_list = function(){
      db.collection('user').find().toArray(function(err,result){
        if (err) throw err;
        io.emit('list',result)

      })
    }

    socket.on('message_list',function(data){
      
      db.collection('message').find({$or:[{from:data.id1,mes_to:data.id2},{from:data.id2,mes_to:data.id1}]}).toArray(function(err,result){
        if(err) console.log(err);
        sockets[data.id2].emit('display_msgs',{res:result,rec:data.id1});
      });
      db.collection('message').count({from:data.id1,mes_to:data.id2,read:false},function(err,count){
        for(var q=0;q<count;q++)
        db.collection('message').update({from:data.id1,mes_to:data.id2,read:false},{'$set':{read:true}},function(err){
        if(err) throw err;
          })
      });
      
    });

      

    socket.on('message',function(data){
      if(data.on){
      db.collection('user').findOne({_id: new mongoskin.ObjectID(data.m.from)},function(err,res){
        if(err) throw err;
        try{
          sockets[data.m.mes_to].emit('new_text',{d:data.m,r:res});  
        }
        catch(err){
          console.log('client offline');
        }
      })
      
      
      }
      db.collection('message').insert({from:data.m.from,mes_to:data.m.mes_to,message:data.m.message,read:false},function(err,res){
        if(err) throw err;
      });

    });
    socket.on('make_msgs_true',function(data){
      db.collection('message').update({from:data.sender,mes_to:data.recv},{'$set':{read:true}},function(err){
      
        })

    });

    socket.on('user_data',function(data){
      user_name = data.name
      user_id = data.id
      sockets[user_id] = socket
      
      user_ondb = db.collection('user').find({name:user_name})
      
      db.collection('user').update({name:data.name}, {'$set':{socket_id:socket.id}}, function(err) {
        if (err) throw err;
        call_list();
      });
      
      db.collection('message').find({mes_to:data.id,read:false}).toArray(function(err,res){
        if(err) throw err;
        if(res)
          for(var i =0;i<res.length;i++)
            db.collection('user').findOne({_id : mongoskin.ObjectID(res[i].from)},function(err,re){
              socket.emit('unread_msg',re)
              //socket.emit('unread_msg',temp); // remove duplicates
              
            });
        
   
      });
    })

    socket.on('disconnect',function(data){
      try{
      if(user_name) //change socket_id using _id property not name
      db.collection('user').update({name:user_name}, {'$set':{socket_id:false}}, function(err) {
        if (err) throw err;
        call_list();
        console.log('here!!!!' + user_name);
      });
        }
        catch(err){
          console.log('error');
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
app.use(session({
    secret: 'my secret string',
    maxAge: 3600000,
    resave:false,
    saveUninitialized:false,
    httpOnly:true
}));

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



server.listen(3000);

module.exports = app;
