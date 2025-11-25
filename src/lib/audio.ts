// Lightweight TTS using the browser's SpeechSynthesis API.
// This replaces the original server-side TTS while keeping the UX similar.

export const playAudioForText = async (text: string): Promise<void> => {
  const browser = typeof window !== 'undefined';
  if (!browser || !('speechSynthesis' in window)) return;
  if (!text.trim()) return;

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};

export const playAudioFromUrl = async (url: string): Promise<void> => {
  const browser = typeof window !== 'undefined';
  if (!browser || !url) return;

  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
};


