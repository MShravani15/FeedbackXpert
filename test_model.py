import torch
import torch.nn.functional as F
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

# Load the trained model and tokenizer
model_path = "model/sentiment_model2"
model = DistilBertForSequenceClassification.from_pretrained(model_path)
tokenizer = DistilBertTokenizer.from_pretrained(model_path)
model.eval()

# Sentiment labels (binary classification)
label_map = {
    0: "Negative",
    1: "Positive"
}

# Example test sentences
sentences = [
    "I hate this product!",
    "I love this! Highly recommend.",
    "Worst experience ever.",
    "Amazing app, super helpful!",
    "Terrible service, I’m disappointed.",
    "Absolutely fantastic, would buy again!",
    "I don’t like it at all.",
    "Very happy with the result.",
    "The quality is poor.",
    "This is the best thing ever!"
]

# Run predictions
for sentence in sentences:
    inputs = tokenizer(sentence, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)
        pred_class = torch.argmax(probs, dim=1).item()
        label = label_map.get(pred_class, "Unknown")

    print(f"Sentence: {sentence}")
    print(f"Prediction: {label} ({probs[0][pred_class]*100:.2f}%)")
    print(f"All Probabilities: {probs[0].tolist()}")
    print("-" * 60)
