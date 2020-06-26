// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

var config = {
    openSocket: function(config) {
        //var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';
        //var SIGNALING_SERVER = 'https://localhost:9559/';
		var SIGNALING_SERVER = 'https://192.168.0.180:9559/';

        //config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        config.channel = config.channel;
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRemoteStream: function(media) {
        var audio = media.audio;
		var divAudio = document.getElementById('footerIndex');	
		var clientText = document.getElementById('clientText');	
        audio.setAttribute('controls', true);
        audio.setAttribute('autoplay', true);

        //participants.insertBefore(audio, participants.firstChild);
		participants.insertBefore(audio, divAudio);
		clientText.innerHTML = "Disfruta del streaming.";
        audio.play();
    },
    onRoomFound: function(room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td>' + room.roomName + '</td>' +
            '<td><button type="button" class="join" id="' + room.roomToken + '">Unirse</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        tr.onclick = function() {
            tr = this;
            
            broadcastUI.joinRoom({
            roomToken: tr.querySelector('.join').id,
            joinUser: tr.id});

            /*
            captureUserMedia(function() {
                broadcastUI.joinRoom({
                    roomToken: tr.querySelector('.join').id,
                    joinUser: tr.id
                });
            });*/
            hideUnnecessaryStuff();
        };
    }
};

function createButtonClickHandler() {
    captureUserMedia(function() {
        broadcastUI.createRoom({
            roomName: (document.getElementById('conference-name') || { }).value || 'Anónima'
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var audio = document.createElement('audio');
	var divAudio = document.getElementById('divAudio');
    audio.setAttribute('autoplay', true);
    audio.setAttribute('controls', true);

    audio.muted = true;
    audio.volume = 0;

    //participants.insertBefore(audio, participants.firstChild);
	participants.insertBefore(audio, divAudio);

    getUserMedia({
        video: audio,
        constraints: { audio: true, video: false },
        onsuccess: function(stream) {
            config.attachStream = stream;
            callback && callback();

            audio.muted = true;
            audio.volume = 0;
        },
        onerror: function() {
            alert('unable to get access to your microphone.');
            callback && callback();
        }
    });
}

/* on page load: get public rooms */
var broadcastUI = broadcast(config);

/* UI specific */
var participants = document.getElementById("participants") || document.body;
var startConferencing = document.getElementById('start-conferencing');
var roomsList = document.getElementById('rooms-list');


if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
	var adminText = document.getElementById("adminText");
	adminText.innerHTML = "Estás en el aire.";
}

(function() {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
})();
