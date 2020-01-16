//SERVER -> app
var express = require('express');
var app = express();
app.use(express.static('public'));

var server = require('http').Server(app);
var io = require('socket.io')(server);
const fetch = require("node-fetch");

var totalUsers = 0;
var wordToDraw;
var usersArray = [];
var connectedUsersArray;
var drawing_history = [];
var labels;

fetch('https://pictionnary-api.herokuapp.com/labels')
.then(res => res.json())
.then((out) => {
    labels = out['labels'];
});

io.on('connection', function(socket) {
    //Get labels for random word
    socket.emit('wordsToClient',labels);

    //CONNECTIONS
    //Server alarms the client of a new connection
    totalUsers++;
    console.log(totalUsers);

    socket.broadcast.emit('playerJoined', totalUsers);
    //Sets the usertype for this new connection: true for drawer, false for guesser
    if (totalUsers > 1) {
        socket.emit('userTypeCheck',false);
        //Update drawing history to a new connection
        for (var i in drawing_history){
            socket.emit('draw',drawing_history[i].x,drawing_history[i].y);
        }

    } else {
        socket.emit('userTypeCheck',true);
    }

    //When someone disconnects
    socket.on('disconnect', function() {
        totalUsers -= 2;
        socket.broadcast.emit('playerLeft', totalUsers);
        //Check a drawer still exists
        socket.broadcast.emit('serverToClientDrawerCheck');

        //This may be refactored
        usersArray = [io.sockets.clients()];
        connectedUsersArray = Object.getOwnPropertyNames(usersArray[0].server.nsps['/'].sockets);
    });

    //Gets the random word from client and sets wordToDraw
    socket.on('clientToServerWordCheck', function(randomWord) {
        wordToDraw = randomWord.word;
    });

    //Draw the picture in the canvas of the guessers
    socket.on('draw',function(x,y){
        drawing_history.push({x:x,y:y});
        socket.broadcast.emit('draw',x,y);
    });
    socket.on('drawBeginPath',function(){
        socket.broadcast.emit('drawBeginPath');
    });

    //Gets image data every mouseup event
    socket.on('sendImageToServer', function(data){
        var url = 'https://pictionnary-api.herokuapp.com/picture';
        var data = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({imageBase64: data})
        }
        fetch(url, data)
        .then(res => res.json())
        .then((out) => {
            if (out.guess == wordToDraw){
                io.sockets.emit('guessNN',{'guess':out.guess,'guessWord':true});
            }
            else{
                io.sockets.emit('guessNN',{'guess':out.guess,'guessWord':false});
            }
        }).catch(err => console.error(err));
    });

    //Receives guess from guessbox and checks if it is right
    socket.on('guessToServer', function(message) {
        if (message.guess.toLowerCase() === wordToDraw) {
            drawing_history = [];
            io.sockets.emit('guessToClient', {id: message.id, guessed: true});
        } else {
            io.sockets.emit('guessToClient',{id: message.id, guessed: false});
            //socket.broadcast.emit('guessToClient', message);
        }
    });

    var drawerHere = false;
    var drawerCheckCount = 0;
    //Check drawer exists if it doesnt it sets a drawer
    socket.on('drawerHere', function(clientToServerDrawerCheck) {
        drawerCheckCount++;
        // set drawer exist if any client is a drawer
        if (clientToServerDrawerCheck) {
            drawerHere = true;
        }
        if (drawerCheckCount === totalUsers) {
            if (drawerHere === false) {
                drawing_history = [];
                for (var i = 0; i < connectedUsersArray.length; i++) {
                    if (i === connectedUsersArray.length - 1) {
                        io.sockets.connected[connectedUsersArray[i]].emit('addNewDrawer');
                    } else {
                        io.sockets.connected[connectedUsersArray[i]].emit('resetGuessers');
                    }
                }
            }
            drawerCheckCount = 0;
            drawerHere = false;
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
