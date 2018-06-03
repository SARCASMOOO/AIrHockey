/*
  Server to handle requests
*/
const http = require('http').createServer(handler)
const io = require('socket.io')(http)
const fs = require("fs");
const url = require("url");
const PORT = 3000;
let movingBoxLocation = { x: 100, y: 100 }; //will be over-written by clients
const ROOT_DIR = "public"; //dir to serve static files from
const counter = 1000;
const dXY = 10;
let index =0;
const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  txt: "text/plain"
};


let userQueue = [];
/* Start server */
http.listen(PORT);

/* Helper function to get file type */
function get_mime(filename)
{
  let ext, type
  for (let ext in MIME_TYPES) {
    type = MIME_TYPES[ext]
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return type
    }
  }
  return MIME_TYPES["txt"]
}

function handler(request, response)
{
    let urlObj = url.parse(request.url, true, false)
    console.log("\n============================")
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    let receivedData = ""

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk
    })

    //event handler for the end of the message
    request.on("end", function() {
      console.log("REQUEST END: ")
      console.log("received data: ", receivedData)
      console.log("type: ", typeof receivedData)

      if (request.method == "GET") {
        //handle GET requests as static file requests
        fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404)
            response.end(JSON.stringify(err))
            return
          }
          response.writeHead(200, {
            "Content-Type": get_mime(urlObj.pathname)
          })
          response.end(data)
        })
      }
    })
  }

  /*
    Structure to hold data
  */
let lobby = {
    player1: {x:125, y:125, height:60, width:60,score:0},
    player2: {x:425, y:125, height:60, width:60,score:0},
    isGameActive: false,
    puck: {
      x: 275,
      y: 150,
      xDirection: 1, //+1 for leftwards, -1 for rightwards
      yDirection: 1, //+1 for downwards, -1 for upwards
    }
  };

  /*
    Two players are found start game
  */
function createGame(socket)
{
  timer = setInterval(handleTimer, 70);
  lobby.isGameActive = true;
  io.sockets.emit('start');
}

/*
  Handle key events
*/
function checkKey(socket)
{
  socket.on("W", function(data)
  {
    var jsonString = JSON.stringify(lobby);
    if (lobby.isGameActive == false) return;

    if(socket.role == 'player1')
    {
      if (lobby.player1.y >= dXY)
      {
        lobby.player1.y -= dXY; //up arrow
        console.log('player1.x: ' + lobby.player1.x + ' player1.y: ' + lobby.player1.y);
      }
    }
    else if(socket.role == 'player2')
    {
      if (lobby.player2.y >= dXY)
      {
        lobby.player2.y -= dXY; //up arrow
        console.log('player2.x: ' + lobby.player2.x + ' player2.y: ' + lobby.player2.y);
      }
    }
    io.sockets.emit("updatePaddle", jsonString);
  });

  socket.on("D", function(data)
  {
    var jsonString = JSON.stringify(lobby);
    if (lobby.isGameActive == false) return;
    if(socket.role == 'player1')
    {
      if (lobby.player1.x + lobby.player1.width + dXY <= 600)
      {
        lobby.player1.x += dXY; //right arrow
        console.log('player1.x: ' + lobby.player1.x + ' player1.y: ' + lobby.player1.y);
      }
    }
    else if(socket.role == 'player2')
    {
      if (lobby.player2.x + lobby.player2.width + dXY <= 600)
      {
        lobby.player2.x += dXY; //right arrow
        console.log('player2.x: ' + lobby.player2.x + ' player2.y: ' + lobby.player2.y);
      }
    }
    io.sockets.emit("updatePaddle", jsonString);
  });

  socket.on("A", function(data)
  {
    var jsonString = JSON.stringify(lobby);
    if (lobby.isGameActive == false) return;
    if(socket.role == 'player1')
    {
      if (lobby.player1.x >= dXY)
      {
        lobby.player1.x -= dXY;
      }
    }
    else if(socket.role == 'player2')
    {
      if (lobby.player2.x >= dXY)
      {
        lobby.player2.x -= dXY;
      }
    }
    io.sockets.emit("updatePaddle", jsonString);
  });

  socket.on("S", function(data)
  {
    var jsonString = JSON.stringify(lobby);
    if (lobby.isGameActive == false) return;

    if(socket.role == 'player1')
    {
      if(lobby.player1.y + lobby.player1.height + dXY <= 300)
      {
        lobby.player1.y += dXY;
        console.log('player1.x: ' + lobby.player1.x + ' player1.y: ' + lobby.player1.y);
      }
    }
    if(socket.role == 'player2')
    {
      if(lobby.player2.y + lobby.player2.height + dXY <= 300)
      {
        lobby.player2.y += dXY;
        console.log('player2.x: ' + lobby.player2.x + ' player2.y: ' + lobby.player2.y);
      }
    }
    var jsonString = JSON.stringify(lobby);
    io.sockets.emit("updatePaddle", jsonString);
  });
}
tempList = [];
/*
  Handle intro event from client when they register
*/
var onConnect = function(socket) {

	socket.on("intro", function(data)
  {
		// check if a user with that name already exists

      if(tempList[data] == data)
      {
        socket.emit("joinFailed");
        return;
      }

    if(Object.keys(userQueue).length == 0)
    {
      socket.role = "player1";
    }
    else if(Object.keys(userQueue).length == 1)
    {
      socket.role = "player2";
    }
    else
    {
      socket.role = "spectater"
      socket.emit('spectatorView');
    }

		socket.name = data;
    index++;
    tempList[data] = data;
		userQueue[socket.name] = socket;
    console.log('socket.name added: ' + socket.name);
    var dataObj = {role: socket.role, name: data};
    var jsonString = JSON.stringify(dataObj);
		socket.emit("joinSuccess", jsonString);

		// attempt to create a new game room if we have two users in the queue
		if (Object.keys(userQueue).length == 2)
    {
			createGame(socket);
      console.log("game made");
		}
	});
};
/*
  Hanlde reassigning roles and removing user
*/
var onDisconnect = function(socket)
{
	// listen for disconnect events
	socket.on("disconnect", function(data)
  {
    console.log('disconnect');
		let tempSocket;
    if(socket.name)
    {
      tempSocket = socket.role;
      console.log('User deleted was: ' + socket.name);
      delete userQueue[socket.name];
      delete tempList[socket.name]
      index--;
    }
    else
    {
      return;
    }
    updateRoles(tempSocket, socket);
	});
};

/*
  Matchmake for a new player
*/
function updateRoles(tempSocket, socket)
{
    //Matchmaking
    let key;
    for(key in userQueue)
    {
      console.log('name is' + userQueue[key].name);
      if(tempSocket == 'player1')
      {
        if(userQueue[key].role != 'player2')
        {
          console.log('player that is not player 2 was found and we made him player 1');
          userQueue[key].role = 'player1';
          userQueue[key].emit('player1View');
          return;
        }
      }
      else if(tempSocket == 'player2')
      {
        console.log(userQueue[key].role);
        if(userQueue[key].role != 'player1')
        {
          console.log('player that is not player 1 was found and we made him player 2');
          userQueue[key].role = 'player2';
          userQueue[key].emit('player2View');
          return;
        }
      }
    }
}

/*
  Update position, and check for a goal
*/
function update(socket)
{
  socket.on("updatePaddle", function()
  {
    var jsonString = JSON.stringify(lobby);
    io.sockets.emit("updatePaddle", jsonString);
  });

  socket.on("scored", function(data)
  {
    if(data > 0)
    {
      //player 2 scored
      lobby.player2.score += 1;
      io.sockets.emit("resetPos");
    }
    if(data < 0)
    {
      //player 1 scored
      lobby.player1.score += 1;
      io.sockets.emit("resetPos");
    }

    lobby.player1.x = 125;
    lobby.player1.y = 125;
    lobby.player2.x = 425;
    lobby.player2.y = 125;
    lobby.puck.x = 275;
    lobby.puck.y = 150;

  });
}
// Pass any new connections to our handler delegates
io.sockets.on("connection", function(socket)
{
  onConnect(socket);
  onDisconnect(socket);
  checkKey(socket);
  update(socket);
});

/*
  Handle puck movement
*/
function handleTimer()
{
      // collison detection
    if((Math.abs(lobby.puck.x-lobby.player1.x))==(Math.abs(lobby.puck.y-lobby.player1.y))){
      if((Math.abs(lobby.puck.y-lobby.player1.y))<=(25/2*Math.sqrt(2)+30))
      {
        lobby.puck.xDirection *= -1;
        lobby.puck.yDirection *= -1;
      }
    }
    else if((Math.abs(lobby.puck.x-lobby.player2.x))==(Math.abs(lobby.puck.y-lobby.player2.y))){
      if((Math.abs(lobby.puck.y-lobby.player2.y))<=(25/2*Math.sqrt(2)+30))
      {
        lobby.puck.xDirection *= -1;
        lobby.puck.yDirection *= -1;
      }
    }
    else{

        if((Math.abs(lobby.puck.x-lobby.player1.x)<=55)&&(Math.abs(lobby.puck.y-lobby.player1.y)<=30)){
          lobby.puck.xDirection *= -1;
        }

        if((Math.abs(lobby.puck.x-lobby.player2.x)<=55)&&(Math.abs(lobby.puck.y-lobby.player2.y)<=30)){
            lobby.puck.xDirection *= -1;
        }

        if((Math.abs(lobby.puck.y-lobby.player1.y)<=55)&&(Math.abs(lobby.puck.x-lobby.player1.x)<=30))
        {
          lobby.puck.yDirection *= -1;
        }

        if((Math.abs(lobby.puck.y-lobby.player2.y)<55)&&(Math.abs(lobby.puck.x-lobby.player2.x)<=30)){
            lobby.puck.yDirection *= -1;
        }
    }
    //puck movement
  lobby.puck.x = lobby.puck.x + 5 * lobby.puck.xDirection;
  lobby.puck.y = lobby.puck.y + 5 * lobby.puck.yDirection;
  //puck bounce back from the wall
  if ((lobby.puck.x - 25 < 0) || (lobby.puck.x + 25 > 600)) {
      lobby.puck.xDirection *= -1;
  }
  if ((lobby.puck.y - 25 < 0) || (lobby.puck.y + 25 > 300)) {
      lobby.puck.yDirection *= -1;
  }

  var jsonString = JSON.stringify(lobby);
  io.sockets.emit("updatePaddle", jsonString);
}

console.log("Server Running at PORT: 3000  CNTL-C to quit");
console.log("To Test: open several browsers at: http://localhost:3000/assignment3.html")
