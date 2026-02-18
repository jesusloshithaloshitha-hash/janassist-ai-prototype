
import React, { useState, useRef, useEffect } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, language }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for standard Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Attempt to set language, though browser support for Indian languages varies
      if (recognitionRef.current) {
        recognitionRef.current.lang = language === 'English' ? 'en-IN' : 'hi-IN'; // Defaulting to Hindi for non-English for demo
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={`p-3 rounded-full transition-all ${
        isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
      }`}
      title="Speak your query"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};

export default VoiceInput;
