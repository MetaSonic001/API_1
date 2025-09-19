from transformers import pipeline
from config import HF_TOKEN

class BaseAgent:
    def __init__(self, name: str, instructions: str):
        self.name = name
        self.instructions = instructions
        self.pipeline = pipeline(
            "text-generation",
            model="google/gemma-2-2b-it",  # Lightweight: ~2B params, fast inference
            device_map="auto",  # CPU/GPU
            token=HF_TOKEN
        )

    def run(self, input_text: str) -> str:
        prompt = f"{self.instructions}\n\nInput: {input_text}\nOutput:"
        generated = self.pipeline(prompt, max_new_tokens=512, do_sample=True, temperature=0.7)
        return generated[0]['generated_text'].split("Output:")[-1].strip()