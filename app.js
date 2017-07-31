
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , apis = require('./routes/api')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
var mongoose = require('mongoose');

var messageApi = require("./routes/api/message");

var bodyParser = require('body-parser');

var multer  = require('multer');
var storage = multer.diskStorage({
	  destination: function (req, file, cb) {
	    cb(null, './public/uploads/');
	  },
	  filename: function (req, file, cb) {
	    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
	  }
	});
var upload = multer({ storage: storage });

var HashMap = require('hashmap');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);
var io = require('socket.io')(server);


var clients = new HashMap();

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

console.log("trying to make connection with mongodb");
// Using `mongoose.connect`...
mongoose.Promise = global.Promise;
var promise = mongoose.connect('mongodb://192.168.100.23/socketchat', {
  useMongoClient: true,
  /* other options */
});


promise.then(function(db){
	server.listen(app.get('port'), function(){
		  console.log('Express server listening on port ' + app.get('port'));
	});	
}).catch(function(reason) {
	console.error(reason);
});

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/api/', apis.index);
app.get('/api', apis.index);

var userApi = require('./routes/api/user');
var chatApi = require('./routes/api/chat');
var contactApi = require('./routes/api/contact');

app.post("/api/login",userApi.login);

app.post("/api/user",userApi.add);
app.get("/api/user/:id",userApi.user);
app.get("/api/user",userApi.userAll);

app.post("/api/chat",chatApi.createChat);
app.get("/api/chat",chatApi.chatList);
app.delete("/api/chat",chatApi.deleteChat);

app.post("/api/contact",contactApi.createContact);
app.get("/api/contact",contactApi.contactList);
app.delete("/api/contact",contactApi.deleteContact);

app.get("/api/message",messageApi.messageList);
app.post("/api/message",upload.single("image"),messageApi.sendPictureMessage);



io.sockets.on('connection', function(socket){
	
	 console.log("socket connected ");
	 
	 socket.on('join', function(data){
		  console.log("join",data);
		  socket.join(data.user_id);
		  clients.set(data.user_id,socket.id);
	  });
	 
	 socket.on('message', function(data){
		 console.log("message",data);
		 messageApi.sendMessage(data,socket);
	  });
	 
	 socket.on('typing', function(data){
		 console.log("typing",data);
		 messageApi.sendMessage(data,socket);
	  });
	  
	 socket.on('disconnect', function(){
		 var key = clients.search(socket.id);
		 if(key){
			 socket.leave(key, function(err){
				 console.log("user disconnected",err);
			 });
			 clients.remove(key);
		 }
		 console.log("clients",clients);
	  });
	  
});


