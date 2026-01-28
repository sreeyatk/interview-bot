export const useSpeechSynthesis = () => {
  const speak = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to get a natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) => 
          voice.name.includes("Google") || 
          voice.name.includes("Samantha") ||
          voice.name.includes("Daniel") ||
          (voice.lang.startsWith("en") && voice.localService)
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      window.speechSynthesis.speak(utterance);
    });
  };

  const cancel = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  return { speak, cancel };
};
