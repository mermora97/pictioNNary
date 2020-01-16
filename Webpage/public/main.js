//CLIENT -> web page
function addItem(guess){
    var ul = document.getElementById("NNguesses");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(guess));
    ul.appendChild(li);
}

var pictionary = function() {
    console.log($('.name'));
    var socket = io();
    var userType;
    var words;
    var randomWord;

    var canvas = document.getElementById("myCanvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    var context = canvas.getContext('2d');

    socket.on('guessNN', (guessNN) => {
        addItem(guessNN.guess);
        $('.NNguess').text(guessNN.guess);
        console.log(guessNN);
        if (guessNN.guessWord){
            $('#NNguesses').css('border-color', 'green');
            $('#NNguesses').css('border-width', '5px');
        }
        else{
            $('#NNguesses').css('border-color', 'red');
            $('#NNguesses').css('border-width', '5px');
        }
        setTimeout(function() {
            $('#NNguesses').css('border-color', 'black');
            $('#NNguesses').css('border-width', '0px');
        }, 1000);
        
    });

    socket.on('wordsToClient',(labels) => {
        words = labels;
    });

    //Cambiar estos textos para simplemente tener un recuadro con numero de usuarios
    socket.on('playerJoined', function(totalUsers) {
        $('.totalPlayers').text(totalUsers);
        $('.playerJoined').fadeIn(1000, 'linear').delay(1000).fadeOut(1000, 'linear');
    });

    socket.on('playerLeft', function(totalUsers) {
        $('.totalPlayers').text(totalUsers);
        $('.playerLeft').fadeIn(1000, 'linear').delay(1000).fadeOut(1000, 'linear');
    });

    //Sets userType of the client and returns the corresponding html depending if it is drawer 
    socket.on('userTypeCheck', function(isDrawer) {
        userType = isDrawer;
        if (userType) {
            drawerReset();
            socket.emit('clientToServerWordCheck',{word: randomWord});
        } else {
            guesserReset();
        }
    });

    //DRAWER HTML
    var drawerReset = function() {
        randomWord = words[Math.floor(Math.random() * words.length)];
        $('#top-message #guess').css('display', 'none');
        $('#top-message .drawerTag').css('display', 'inline-block');
        $('.drawerTag span').text(randomWord);
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    //GUESSER HTML
    var guesserReset = function() {
        $('#top-message #guess').css('display', 'inline-block');
        $('#top-message .drawerTag').css('display', 'none');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    //Sends usertypes to server to check if drawer exists when someone disconnects
    socket.on('serverToClientDrawerCheck', function() {
        socket.emit('drawerHere', userType);
    });

    //Resets game when previous drawer disconnects
    socket.on('addNewDrawer', function() {
        userType = true;
        drawerReset();
        socket.emit('clientToServerWordCheck', {word: randomWord});
    });
    socket.on('resetGuessers', function() {
        guesserReset();
    });


    //GUESSING
    //On enter, it sends guess to the server
    var onKeyDown = function(event) {
        if (userType === false && event.keyCode === 13) {
            socket.emit('guessToServer', { id: socket.id, guess: guessBox.val()});
            guessBox.val('');
        }
    };
    var guessBox = $('input');
    guessBox.on('keydown', onKeyDown);

    //Receives if it was guessed or not by the user
    socket.on('guessToClient', function(information) {
        if (information.guessed){
            if (userType){
                userType = false;
                guesserReset();
            }
            else if (information.id === socket.id) {
                console.log(information.id, socket.id);
                userType = true;
                drawerReset();
                socket.emit('clientToServerWordCheck', { word: randomWord });
            }
            else {
                guesserReset();
            }
        } else {
            $('#guess-input').css('background-color', 'red');
            setTimeout(function() {
                $('#guess-input').css('background-color', 'white');
                $('#guess-input').css('border-width', '0px');
            }, 1000);
        }
    });

    //DRAWING

    var drawing = false;
    context.lineWidth = 20;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = '#000000';

    //function to draw on the canvas/context.
    var draw = (e) => {
        x = e.pageX - canvas.offsetLeft;
        y = e.pageY - canvas.offsetTop;
        socketDraw(x,y);

        socket.emit('draw',x,y);
    }
    var socketDraw = function(x,y) {
        context.lineTo(x,y);
        context.stroke();
    };

    canvas.addEventListener('mousemove', (data) => {
        if (drawing && userType){
            draw(data);
        }
    });
    
    canvas.addEventListener('mousedown', () => {
        drawing = true;
        context.beginPath();
        socket.emit('drawBeginPath');
    });

    var getIntensityVals = function(array) {
        var intensityVals = [];
        for (var i = 0; i < array.length; i += 4) {
            intensityVals.push(array[i+3]);}
        return intensityVals;
    }

    canvas.addEventListener('mouseup', () => {
        drawing = false;
        var img_data = context.getImageData(0, 0, canvas.width, canvas.height);
        socket.emit('sendImageToServer',getIntensityVals(img_data.data));
    });

    //This serverToClient listener will use the draw function when it is emmited. Which
    //will be in the server due to the mousemove event.
    socket.on('draw', (x,y) => socketDraw(x,y));
    socket.on('drawBeginPath', () => context.beginPath());
};

$(document).ready(function() {
    pictionary();
});