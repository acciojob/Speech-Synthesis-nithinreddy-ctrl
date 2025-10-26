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

function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';
  if (!voices.length) {
    voiceSelect.innerHTML = '<option>No voices available</option>';
    speakBtn.disabled = true;
    msg.textContent = 'No voices found';
    return;
  }
  voices.forEach((voice, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${voice.name} (${voice.lang})` + (voice.default ? ' — DEFAULT' : '');
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
  if (speechSynthesis.speaking) speechSynthesis.cancel();
  const text = textArea.value.trim();
  if (!text) return msg.textContent = 'Enter some text!';
  if (!voices.length) return msg.textContent = 'No voices loaded!';
  utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[parseInt(voiceSelect.value, 10)];
  utterance.rate = parseFloat(rateSlider.value);
  utterance.pitch = parseFloat(pitchSlider.value);
  utterance.onstart = () => { msg.textContent = 'Speaking...'; };
  utterance.onend = () => { msg.textContent = 'Finished.'; };
  utterance.onerror = err => { msg.textContent = 'Error: ' + err.error; };
  speechSynthesis.speak(utterance);
}
function stop() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    msg.textContent = 'Stopped.';
  }
}
voiceSelect.onchange = () => { if (speechSynthesis.speaking) { stop(); setTimeout(speak, 180); }};
rateSlider.onchange = () => { if (speechSynthesis.speaking) { stop(); setTimeout(speak, 180); }};
pitchSlider.onchange = () => { if (speechSynthesis.speaking) { stop(); setTimeout(speak, 180); }};
speakBtn.onclick = speak;
stopBtn.onclick = stop;
speakBtn.disabled = true;
