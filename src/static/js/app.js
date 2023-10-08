//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording() {
	console.log("recordButton clicked");

	var constraints = { audio: true, video: false }

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false

	navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		audioContext = new AudioContext();

		gumStream = stream;

		input = audioContext.createMediaStreamSource(stream);

		rec = new Recorder(input, { numChannels: 1 })

		rec.record()

		console.log("Recording started");

	}).catch(function (err) {
		recordButton.disabled = false;
		stopButton.disabled = true;
		pauseButton.disabled = true
	});
}

function pauseRecording() {
	console.log("pauseButton clicked rec.recording=", rec.recording);
	if (rec.recording) {
		//pause
		rec.stop();
		pauseButton.innerHTML = "Resume";
	} else {
		//resume
		rec.record()
		pauseButton.innerHTML = "Pause";

	}
}

function stopRecording() {
	console.log("stopButton clicked");

	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	pauseButton.innerHTML = "Pause";

	rec.stop();

	gumStream.getAudioTracks()[0].stop();

	rec.exportWAV(sendAudio);
}

async function sendAudio(blob) {
	startLoadingAnimation();

	const formData = new FormData();
	formData.append('audio', blob, 'audio.wav');

	const response = await fetch('/api/mp3tonotes', {
		method: 'POST',
		body: formData,
	});

	json = await response.json();

	if (json.error) {
		document.getElementById('notes').innerHTML = json.error
	} else {
		document.getElementById('notes').innerHTML = json.notes
		document.getElementById('transcript').innerHTML = json.transcription
		document.getElementById('change-view').style.display = 'block'
	}
	stopLoadingAnimation();
}

async function wav_to_text() {
	audio_file = document.getElementById('audio').files[0];
	sendAudio(audio_file);
}

function startLoadingAnimation() {
	document.getElementById('notes').style.display = 'none';
	document.getElementById('options').style.display = 'none';
	document.getElementById('loader').style.display = 'block';

	document.getElementById('audioSubmit').disabled = true;
	document.getElementById('recordButton').disabled= true;
}

function stopLoadingAnimation() {
	document.getElementById('notes').style.display = 'block';
	document.getElementById('options').style.display = 'block';
	document.getElementById('loader').style.display = 'none';

	document.getElementById('audioSubmit').disabled = false;
	document.getElementById('audioSubmit').disabled = false;
}
