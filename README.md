Steven Stapleton
Tianxu Zhou 


  Version: node.js v8.9.4 and macOS10.12.2
  Install: npm install
  Launch:  node server.js
  Testing:
  visit “http://localhost:3000/assignment3.html"
  When you visit assignment3.html you will be introduced with a text box to enter a username
  once a username that is not a duplicate has been selected you will see the game view and your paddle will light up
  once two players are connected you can control your paddle assuming you are not a spectator using WASD

  the server automatically selects player1 and player2. So if you have three browsers and you close browser 1 for player 1 the third
  browser now becomes player 1

  For requirement 3.6 saying that the player should be able to give up control of their paddle. This is handled by the disconnect so it will
  happen when you close the browser

  Our extra implementation was to add scoring. When the puck hits a net the game section where it saids player 1 and player 2 score
  will be updated.

  Physics for collision is a little spotty but the puck does bounce off of paddle and walls.
  When a goal is scored the positions will reset


