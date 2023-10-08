async function send_audio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    const response = await fetch('/api/mp3tonotes', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    console.log(result);
    console.log(result.transcription)
}

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/ogg; codecs=flac' });
    

    const audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    record = document.getElementById('record')

    record.onclick = () => {
        mediaRecorder.start();
    }
    
    stopRecord = document.getElementById('stopRecord')

    stopRecord.onclick = () => {
        mediaRecorder.stop();
    }
    

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks, {type: "audio/ogg; codecs=flac"});
      send_audio(audioBlob)
    });
  }
);