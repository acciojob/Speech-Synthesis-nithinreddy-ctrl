// Your script here.
const synth = window.speechSynthesis;
let voices = [];
let currentUtterance = null;
let isPaused = false;

const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const rate = document.getElementById('rate');
const rateValue = document.getElementById('rateValue');
const pitch = document.getElementById('pitch');
const pitchValue = document.getElementById('pitchValue');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');

function populateVoiceList() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = index;
    voiceSelect.appendChild(option);
  });
}

if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = populateVoiceList;
} else {
  populateVoiceList();
}

rate.addEventListener('input', () => rateValue.textContent = rate.value);
pitch.addEventListener('input', () => pitchValue.textContent = pitch.value);

function speak() {
  if (synth.speaking) synth.cancel();

  const text = textInput.value.trim();
  if (!text) {
    statusText.textContent = 'Please enter some text.';
    return;
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.voice = voices[voiceSelect.value];
  currentUtterance.rate = parseFloat(rate.value);
  currentUtterance.pitch = parseFloat(pitch.value);

  currentUtterance.onstart = () => {
    statusText.textContent = 'Speaking...';
    speakBtn.disabled = true;
  };

  currentUtterance.onend = () => {
    statusText.textContent = 'Finished speaking.';
    speakBtn.disabled = false;
    isPaused = false;
  };

  currentUtterance.onerror = (event) => {
    statusText.textContent = `Error: ${event.error}`;
    speakBtn.disabled = false;
  };

  synth.speak(currentUtterance);
}

speakBtn.addEventListener('click', speak);

pauseBtn.addEventListener('click', () => {
  if (!synth.speaking) return;
  if (isPaused) {
    synth.resume();
    isPaused = false;
    statusText.textContent = 'Resumed speaking.';
  } else {
    synth.pause();
    isPaused = true;
    statusText.textContent = 'Paused.';
  }
});

stopBtn.addEventListener('click', () => {
  if (synth.speaking) {
    synth.cancel();
    isPaused = false;
    statusText.textContent = 'Speech stopped.';
    speakBtn.disabled = false;
  }
});
