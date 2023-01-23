const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Helper function to generate random strings

const generateRandomString = (myLength) => {
    const chars =
      "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
      { length: myLength },
      (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );
  
    const randomString = randomArray.join("");
    return randomString;
  };

  function remove(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

class Player {
    ip = "";
    username = "";
    inLobby = false;
    constructor(ip)
    {
        this.ip = ip;
    }
}

class Game {
    players = [];
    chat = [];   
    id = "";
}

class Lobby {
    gameId = "";
    gameName = "";
    playerCount = 0;
    players = [];

    constructor(name)
    {
        this.gameId = generateRandomString(8);
        this.gameName = name;
        this.playerCount = 0;
    }
}

var players = [];

var lobbies = [];

var games = [];

lobbies.push();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    var p = new Player(socket.conn.remoteAddress);
    players.push(p);
    p.username = "Guest_" + generateRandomString(8);
    console.log('User connected from ' + p.ip + ' giving name ' + p.username);
    socket.on('disconnect', () => {
      console.log(p.username + ' disconnected.');
      lobbies.every(v => {
        var shouldDelete = false;
        v.players.every(pp => {
            console.log('checking ' + pp + ' against ' + p.username + p.ip);
            if (pp == p.username + p.ip)
            {
                shouldDelete = true;
                return false;
            }
            return true;
        });
        if (shouldDelete)
        {
            console.log('Removed ' + v.gameName);
            remove(lobbies, v);
            return false;
        }
        return true;
      });
    });

    socket.on('name', (v) => {
        p.username = v.replace(/<[^>]*>?/gm, '');
        console.log(p.username + ' is now playing!');
        socket.emit('lobbies', {list: lobbies, username: p.username});
    });

    socket.on('create', (v) => {
        console.log("hi");
        var name = v.replace(/<[^>]*>?/gm, '');

        var g = new Lobby(name);
        g.playerCount = 1;
        g.players.push(p.username + p.ip);

        console.log("Created " + g.gameName + " by " + p.username);

        lobbies.push(g);
        socket.emit('lobby', {lobby: g});
    });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});