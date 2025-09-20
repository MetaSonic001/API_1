import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export const VoiceInput = ({ onResult, placeholder, className = "", size = "sm" }: VoiceInputProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Process the audio
        setIsProcessing(true);
        try {
          // Mock transcription for now - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          const mockResult = placeholder?.includes("destination") ? "Paris, France" :
                           placeholder?.includes("budget") ? "2500" :
                           placeholder?.includes("activities") ? "museums, food tours, photography" :
                           "Sample voice input result";
          
          onResult(mockResult);
          toast({
            title: "Voice input processed",
            description: "Your speech has been converted to text.",
          });
        } catch (error) {
          toast({
            title: "Processing Error",
            description: "Failed to process voice input. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      className={`${sizeClasses[size]} ${className} ${isRecording ? 'animate-pulse' : ''}`}
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      title={placeholder ? `Voice input for ${placeholder}` : "Voice input"}
    >
      {isProcessing ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isRecording ? (
        <MicOff className={iconSizes[size]} />
      ) : (
        <Mic className={iconSizes[size]} />
      )}
    </Button>
  );
};