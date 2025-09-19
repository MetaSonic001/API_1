from transformers import pipeline

stt_pipe = pipeline("automatic-speech-recognition", model="openai/whisper-base")

def transcribe_voice(audio_bytes: bytes):
    return stt_pipe(audio_bytes)['text']