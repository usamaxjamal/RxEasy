// ═══════════════════════════════════════════════
// voice.js — Voice input / speech recognition
// ═══════════════════════════════════════════════

// ═══ VOICE ═══
function toggleVoice(){
  if(!('webkitSpeechRecognition' in window||'SpeechRecognition' in window)){toast('Voice not supported on this browser');return;}
  if(isListening){recog.stop();return;}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  recog=new SR();recog.continuous=false;recog.interimResults=true;recog.lang='en-US';
  recog.onstart=()=>{isListening=true;document.getElementById('vb').classList.add('on');toast('🎤 Listening...',3000);};
  recog.onresult=e=>{const t=e.results[e.results.length-1][0].transcript;document.getElementById('qi').value=t;rsz(document.getElementById('qi'));};
  recog.onend=()=>{isListening=false;document.getElementById('vb').classList.remove('on');};
  recog.start();
}
