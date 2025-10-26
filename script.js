const textArea = document.getElementById('text');
const voiceSelect = document.getElementById('voice');
const rateSlider = document.getElementById('rate');
const pitchSlider = document.getElementById('pitch');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const speakBtn = document.getElementById('speak');
const stopBtn = document.getElementById('stop');
const msg = document.getElementById('msg');
let voices = [];
let utterance = null;
let speechInProgress = false;

function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';
  if (!voices.length) {
    voiceSelect.innerHTML = '<option>No voices available</option>';
    msg.textContent = 'No voices found (try refreshing)';
    speakBtn.disabled = true;
    return;
  }
  voices.forEach((voice, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — DEFAULT' : ''}`;
    voiceSelect.appendChild(opt);
  });
  speakBtn.disabled = false;
  msg.textContent = '';
}

if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
  speechSynthesis.onvoiceschanged = loadVoices;
}
window.onload = loadVoices;

rateSlider.oninput = () => { rateValue.textContent = rateSlider.value; };
pitchSlider.oninput = () => { pitchValue.textContent = pitchSlider.value; };

function speak() {
  const text = textArea.value.trim();
  if (!text) {
    msg.textContent = 'Enter some text!';
    return;
  }
  if (!voices.length) {
    msg.textContent = 'No voices loaded!';
    return;
  }
  if (speechSynthesis.speaking) speechSynthesis.cancel();

  utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = voices[parseInt(voiceSelect.value, 10)];
  utterance.voice = selectedVoice;
  utterance.rate = parseFloat(rateSlider.value);
  utterance.pitch = parseFloat(pitchSlider.value);

  utterance.onstart = () => {
    speechInProgress = true;
    msg.textContent = 'Speaking...';
  };
  utterance.onend = () => {
    speechInProgress = false;
    msg.textContent = 'Finished.';
  };
  utterance.onerror = err => {
    speechInProgress = false;
    msg.textContent = 'Error: ' + err.error;
  };
  speechSynthesis.speak(utterance);
}

function stop() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    msg.textContent = 'Stopped.';
    speechInProgress = false;
  }
}

voiceSelect.onchange = () => {
  if (speechInProgress) {
    stop();
    setTimeout(speak, 180);
  }
};
rateSlider.onchange = () => { if (speechInProgress) { stop(); setTimeout(speak, 180); }};
pitchSlider.onchange = () => { if (speechInProgress) { stop(); setTimeout(speak, 180); }};

speakBtn.onclick = speak;
stopBtn.onclick = stop;
speakBtn.disabled = true;
