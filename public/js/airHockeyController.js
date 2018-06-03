  var canvas = document.getElementById("canvas1"); //our drawing canvas
  var timer; //used to control the free moving word
  var timer2;
  var editorFont = "Arial"; //font for your editor
  var socket = io('http://' + window.document.location.host)
  var role = '';
  var context = canvas.getContext("2d");
  //Set up images for each game objects
  var p1=new Image();
  var p2=new Image();
  var img=new Image();
  var bkimg=new Image();

  //KEY CODES
  var D_KEY = 68;
  var A_KEY = 65;
  var W_KEY = 87;
  var S_KEY = 83;
  /*
    prototype lobby
     purpose: Structure to store information on lobby
  */
  let lobby = {
    player1: {x:125, y:125, height:60, width:60,score:0},
    player2: {x:425, y:125, height:60, width:60,score:0},

    isGameActive:false,
    puck: {
      word: "puck",
      x: 300,
      y: 150,
      xDirection: 1, //+1 for leftwards, -1 for rightwards
      yDirection: 1, //+1 for downwards, -1 for upwards
    }
  };
  /*
    prototype nets
     purpose: Structure to store information on nets
  */
  let nets = {
    player1Net: {x:0, y:150, height:90, width:5},
    player2Net: {x:600, y:150, height:90, width:5},
  };

  /*
    prototype updatePaddle
     purpose: poll server and get update pos
  */
  /* Check permission from server as to which paddle we are allowed to update */
  socket.on('updatePaddle', function(data)
  {
    //console.log('update paddle called!!!!!!!');
    var obj = JSON.parse(data);
    lobby.player1 = obj.player1;
    lobby.player2 = obj.player2;
    lobby.puck = obj.puck;
    //Update score bored
    $('#player1Score').text('Player 1 Score: ' + lobby.player1.score);
    $('#player2Score').text('Player 2 Score: ' + lobby.player2.score);
    drawCanvas();
  });

  /*
    prototype joinSuccess
     purpose: when you register this handles your role
  */
  socket.on('joinSuccess', function(data)
  {
    var obj = JSON.parse(data);
    role = obj.role;
    $(".user-form").hide();

    if(role == 'player1')
    {
      role = 'Player 1';
      p1.src="images/player1.png"
    }
    if(role == 'player2')
    {
      role = 'Player 2';
      p2.src="images/player1.png"
    }
    if(role == 'spectater')
    {
      role = 'Spectator'
      p1.src="images/player2.png"
      p2.src="images/player2.png"
    }

    $('#username-info').text(obj.name);
    $('#user-role').text(role);
    $('#game-info').show();
    timer2 = setInterval(update, 100);
  });

  /*
    prototype joinFailed
     purpose: you selected a username in use
  */
  socket.on('joinFailed', function(data)
  {
    alert("Joined Failed name already taken");
  });

  /*
    prototype start
     purpose: start game
  */
  socket.on('start', function(data)
  {
    timer = setInterval(update, 100);
  });

  /*
    prototype resetPos
     purpose: on score reset everyones position
  */
  socket.on('resetPos', function(data)
  {
    console.log('reset called');
    lobby.player1.x = 125;
    lobby.player1.y = 125;
    lobby.player2.x = 425;
    lobby.player2.y = 125;
    lobby.puck.x = 275;
    lobby.puck.y = 150;
  });
  /*
    prototype spectatorView, player1View, player2View
     purpose: handle view based on your role
  */
  socket.on('spectatorView', function(data)
  {
    $('#user-role').text('Spectater');
    if(role = 'spectater')return;
    $('.user-form').hide();
    $('#user-role').text('Spectator');
    $('#game-info').show();
  });

  socket.on('player1View', function(data)
  {
    p1.src="images/player1.png"
    $('#user-role').text('Player 1');
    if(role = 'player1')return;
    $('.user-form').show();
    $('#game-info').show();
  });

  socket.on('player2View', function(data)
  {
    p2.src="images/player1.png"
    $('#user-role').text('Player 2');
    if(role = 'player2')return;
    $('.user-form').show();
    $('#game-info').show();
  });

  /*
    prototype drawCanvas
     purpose: draw canvas using structures
  */
  var drawCanvas = function()
  {
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas
    // img.addEventListener('load', function() {}, false);
    context.drawImage(bkimg,0, 0);
    context.drawImage(img,lobby.puck.x - img.width/2, lobby.puck.y - img.height/2);
    context.drawImage(p1,lobby.player1.x - p1.width/2, lobby.player1.y - p1.height/2);
    context.drawImage(p2,lobby.player2.x - p2.width/2, lobby.player2.y - p2.height/2);
  };

  /*
    prototype handle events
     purpose: Handle when a user selects a key
  */
  function handleKeyDown(e)
  {
    var dXY = 10;
    /* Player 1 Controlls */
    if (e.which == W_KEY)
    {
      socket.emit('W');
    }
    if (e.which == D_KEY)
    {
      socket.emit('D');
    }
    if (e.which == A_KEY)
    {
      socket.emit('A');
    }
    if(e.which == S_KEY)
    {
      socket.emit('S');
    }
    drawCanvas();
  }

    /*
      prototype handle key up
       purpose: emit event when key clicked
    */
  function handleKeyUp(e)
  {
    var dataObj = {event: e.which};
    var jsonString = JSON.stringify(dataObj);
    socket.emit('keyUp', jsonString);
  }

  /*
    prototype startDraw
     purpose: draw canvas on interval
  */
  function startDraw()
  {
    drawCanvas();
  }

  /*
    prototype ready
     purpose: Initialize data when ready
  */
  $(document).ready(function() {
    p1.src='images/player2.png';
    p2.src='images/player2.png';
    img.src = 'images/puck.png';
    bkimg.src = 'images/background.png';
    timer = setInterval(startDraw, 100);
    timer2 = setInterval(update, 100);
    $(".button-collapse").sideNav();
    $(document).keydown(handleKeyDown);
    $(document).keyup(handleKeyUp);
    $(".user-form").show();
    $("#game-info").hide();
    socket.emit('checkRole');
  });

  /*
    prototype getUserName
     purpose: Get user name then send to server
  */
  function getUserName()
  {
    socket.emit('intro', $("#user-id").val());
    $("#user-id").val('');
  }

  /*
    prototype update
     purpose: constantly check for collision and score
  */
  function update()
  {
    drawCanvas();
    socket.emit('checkRole');
    if(checkCollision(nets.player1Net))
    {
      socket.emit('scored', 1);
    }
    if(checkCollision(nets.player2Net))
    {
      socket.emit('scored', -1);
    }
  }

  /*
    prototype checkCollision
     purpose: check for a collisions for goals
  */
  function checkCollision(object)
  {
    var distX = Math.abs(lobby.puck.x - object.x);
        var distY = Math.abs(lobby.puck.y - object.y);

        if ((distX <= (object.width/2)+25)&&(distY <= (object.height/2)))
          return true;
        else
          return false;
  }
