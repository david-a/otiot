// Lightweight TTS using the browser's SpeechSynthesis API.
// This replaces the original server-side TTS while keeping the UX similar.

// Track current audio and speech synthesis to stop them when needed
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

const stopAllAudio = (): void => {
  const browser = typeof window !== 'undefined';
  if (!browser) return;

  // Stop any currently playing audio element
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Stop any currently speaking speech synthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

// Wait for current speech synthesis and audio to finish
const waitForAllAudioToFinish = (): Promise<void> => {
  const browser = typeof window !== 'undefined';
  if (!browser) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    // Check if anything is playing
    const isSpeechSpeaking = 'speechSynthesis' in window && window.speechSynthesis.speaking;
    const isAudioPlaying = currentAudio && !currentAudio.paused && !currentAudio.ended;

    // If nothing is playing, resolve immediately
    if (!isSpeechSpeaking && !isAudioPlaying) {
      resolve();
      return;
    }

    // Wait for everything to finish
    const checkInterval = setInterval(() => {
      const stillSpeaking = 'speechSynthesis' in window && window.speechSynthesis.speaking;
      const stillPlaying = currentAudio && !currentAudio.paused && !currentAudio.ended;

      if (!stillSpeaking && !stillPlaying) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Safety timeout - resolve after 10 seconds even if still playing
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 10000);
  });
};

export const playAudioForText = async (text: string, stopPrevious: boolean = true): Promise<void> => {
  const browser = typeof window !== 'undefined';
  if (!browser || !('speechSynthesis' in window)) return;
  if (!text.trim()) return;

  // If we shouldn't stop previous audio, wait for it to finish first
  if (!stopPrevious) {
    await waitForAllAudioToFinish();
  } else {
    // Stop any currently playing audio before starting new one
    stopAllAudio();
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    currentUtterance = utterance;
    
    utterance.onend = () => {
      // Only clear if this is still the current utterance
      if (currentUtterance === utterance) {
        currentUtterance = null;
      }
      resolve();
    };
    utterance.onerror = () => {
      // Only clear if this is still the current utterance
      if (currentUtterance === utterance) {
        currentUtterance = null;
      }
      resolve();
    };
    
    window.speechSynthesis.speak(utterance);
  });
};

export const playAudioFromUrl = async (url: string): Promise<void> => {
  const browser = typeof window !== 'undefined';
  if (!browser || !url) return;

  // Stop any currently playing audio before starting new one
  stopAllAudio();

  return new Promise((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;
    
    audio.onended = () => {
      // Only clear if this is still the current audio
      if (currentAudio === audio) {
        currentAudio = null;
      }
      resolve();
    };
    audio.onerror = () => {
      // Only clear if this is still the current audio
      if (currentAudio === audio) {
        currentAudio = null;
      }
      resolve();
    };
    
    audio.play().catch(() => {
      // Only clear if this is still the current audio
      if (currentAudio === audio) {
        currentAudio = null;
      }
      resolve();
    });
  });
};


