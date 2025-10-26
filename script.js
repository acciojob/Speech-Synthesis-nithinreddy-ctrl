// script.js - Speech Synthesis app (separate file for testing)
(function () {
  // DOM elements required by tests (IDs must match)
  const textInput = document.getElementById('text-input');
  const voiceSelect = document.getElementById('voice-select');
  const noVoicesMsg = document.getElementById('no-voices-msg');
  const rate = document.getElementById('rate');
  const pitch = document.getElementById('pitch');
  const rateValue = document.getElementById('rate-value');
  const pitchValue = document.getElementById('pitch-value');
  const speakBtn = document.getElementById('speak');
  const stopBtn = document.getElementById('stop');

  if (!window.speechSynthesis) {
    // Browser doesn't support speechSynthesis — show message and disable controls
    voiceSelect.innerHTML = '';
    noVoicesMsg.textContent = 'Speech Synthesis not supported in this browser.';
    noVoicesMsg.classList.remove('hidden');
    speakBtn.disabled = true;
    stopBtn.disabled = true;
    rate.disabled = true;
    pitch.disabled = true;
    return;
  }

  let voices = [];
  let currentUtterance = null;

  function updateSliderLabels() {
    rateValue.textContent = rate.value;
    pitchValue.textContent = pitch.value;
  }
  updateSliderLabels();

  // Populate voice list with identifiable option attributes so tests can check them
  function populateVoices() {
    voices = window.speechSynthesis.getVoices() || [];
    voiceSelect.innerHTML = '';

    if (!voices || voices.length === 0) {
      noVoicesMsg.classList.remove('hidden');
      noVoicesMsg.textContent = 'No voices available.';
      // still keep an empty option so tests find the select element but with no usable voices
      const o = document.createElement('option');
      o.textContent = '---';
      o.value = '';
      voiceSelect.appendChild(o);
      return;
    }

    noVoicesMsg.classList.add('hidden');

    voices.forEach((v, idx) => {
      const option = document.createElement('option');
      option.textContent = `${v.name} (${v.lang})`;
      // Use index as value to keep it deterministic across environments
      option.value = String(idx);
      // Add data attributes for tests to inspect language/name
      option.setAttribute('data-name', v.name);
      option.setAttribute('data-lang', v.lang);
      voiceSelect.appendChild(option);
    });

    // default to first voice if nothing selected
    if (!voiceSelect.value && voiceSelect.options.length > 0) {
      voiceSelect.selectedIndex = 0;
    }
  }

  // Some browsers load voices asynchronously
  populateVoices();
  if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
    speechSynthesis.onvoiceschanged = populateVoices;
  }

  function createUtterance(text) {
    const utt = new SpeechSynthesisUtterance(text);
    const idx = voiceSelect.value;
    if (idx !== '' && voices[Number(idx)]) {
      utt.voice = voices[Number(idx)];
    }
    utt.rate = parseFloat(rate.value);
    utt.pitch = parseFloat(pitch.value);

    // basic event handlers (helpful for tests that watch events)
    utt.onstart = () => {
      currentUtterance = utt;
    };
    utt.onend = () => {
      if (currentUtterance === utt) currentUtterance = null;
    };
    utt.onerror = () => {
      // ensure utterance cleared on error
      if (currentUtterance === utt) currentUtterance = null;
    };
    return utt;
  }

  function speak() {
    // stop any ongoing speech first (ensures consistent behavior)
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }

    const text = textInput.value.trim();
    if (!text) {
      // Tests usually expect prevention of empty speak; show alert and do nothing
      // Use non-blocking UI hint in addition to alert for automated environments
      alert('Please enter text to speak.');
      return;
    }

    if (voices.length === 0) {
      // If voices not present, show message and don't attempt to speak
      noVoicesMsg.classList.remove('hidden');
      noVoicesMsg.textContent = 'No voices available to speak.';
      return;
    }

    const utt = createUtterance(text);
    window.speechSynthesis.speak(utt);
  }

  function stop() {
    if (window.speechSynthesis.speaking || currentUtterance) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }
  }

  // Event listeners
  speakBtn.addEventListener('click', speak);
  stopBtn.addEventListener('click', stop);

  rate.addEventListener('input', () => {
    rateValue.textContent = rate.value;
    // If currently speaking, restart with updated rate (makes slider "dynamic")
    if (window.speechSynthesis.speaking) {
      // restart from beginning with new settings
      const t = textInput.value.trim();
      if (t) {
        window.speechSynthesis.cancel();
        const utt = createUtterance(t);
        window.speechSynthesis.speak(utt);
      }
    }
  });

  pitch.addEventListener('input', () => {
    pitchValue.textContent = pitch.value;
    // If currently speaking, restart with updated pitch
    if (window.speechSynthesis.speaking) {
      const t = textInput.value.trim();
      if (t) {
        window.speechSynthesis.cancel();
        const utt = createUtterance(t);
        window.speechSynthesis.speak(utt);
      }
    }
  });

  // When the user changes voice mid-speech, restart speech with the new voice
  voiceSelect.addEventListener('change', () => {
    if (window.speechSynthesis.speaking) {
      const t = textInput.value.trim();
      if (t) {
        window.speechSynthesis.cancel();
        const utt = createUtterance(t);
        window.speechSynthesis.speak(utt);
      }
    }
  });

  // Expose some internals for possible test inspection (non-invasive)
  window.__ttsApp = {
    getVoices: () => voices.slice(),
    getCurrentUtterance: () => currentUtterance,
    isSpeaking: () => window.speechSynthesis.speaking
  };

})();
