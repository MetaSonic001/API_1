from transformers import pipeline
from config import HF_TOKEN

class BaseAgent:
    def __init__(self, name: str, instructions: str):
        self.name = name
        self.instructions = instructions
        self.pipeline = None  # don’t load yet

    def _get_pipeline(self):
        if self.pipeline is None:
            from transformers import pipeline
            self.pipeline = pipeline(
                "text-generation",
                model="google/gemma-2-2b-it",
                device_map="auto",
                token=HF_TOKEN
            )
        return self.pipeline

    def run(self, input_text: str) -> str:
        pipe = self._get_pipeline()
        prompt = f"{self.instructions}\n\nInput: {input_text}\nOutput:"
        generated = pipe(prompt, max_new_tokens=512, do_sample=True, temperature=0.7)
        return generated[0]['generated_text'].split("Output:")[-1].strip()
