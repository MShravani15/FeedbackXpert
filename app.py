from flask import Flask, request, render_template, send_from_directory
import pandas as pd
import torch
import torch.nn.functional as F
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, pipeline
import os
from collections import Counter, defaultdict
import re
import string
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
import numpy as np
from rake_nltk import Rake
import nltk
from nltk.corpus import stopwords

app = Flask(__name__)
os.environ["HF_HOME"] = "E:\\project32_output"

# Initialize NLTK
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

# Load models
MODEL_PATH = "model/sentiment_model2"
model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
tokenizer = DistilBertTokenizer.from_pretrained(MODEL_PATH)
model.eval()

emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    tokenizer="j-hartmann/emotion-english-distilroberta-base"
)

label_map = {0: "Negative", 1: "Positive"}
#ignore_keywords = ["name", "email", "phone", "mobile", "roll", "id"]
ignore_keywords=["branch","year"]
meaningless_words = set(stopwords.words('english')).union({
    "dont", "just", "days", "like", "get", "make", "know", "good", "really"
})

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    return text.strip()

def analyze_sentiment(text):
    if not isinstance(text, str) or not text.strip():
        return "Neutral"
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    probs = F.softmax(outputs.logits, dim=1)
    pred = torch.argmax(probs, dim=1).item()
    return label_map.get(pred, "Neutral")

def analyze_emotions(texts):
    emotions = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]
    emotion_counts = {emotion: 0 for emotion in emotions}
    
    for text in texts:
        if not isinstance(text, str) or not text.strip():
            continue
        try:
            result = emotion_model(text[:512])[0]
            emotion = result['label'].lower()
            if emotion in emotion_counts:
                emotion_counts[emotion] += 1
        except:
            continue
    
    return {k: v for k, v in emotion_counts.items() if v > 0}

def extract_keywords(text, question):
    if not text or not isinstance(text, str):
        return []
    try:
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_features=50)
        X = vectorizer.fit_transform([text])
        feature_array = vectorizer.get_feature_names_out()
        tfidf_sorting = np.argsort(X.toarray()).flatten()[::-1]
        tfidf_keywords = [feature_array[i] for i in tfidf_sorting[:10]]
        
        r = Rake(stopwords=meaningless_words, max_length=3)
        r.extract_keywords_from_text(text)
        rake_keywords = [kw.lower().strip() for kw in r.get_ranked_phrases()[:10]]
        
        combined = list(set(tfidf_keywords + rake_keywords))
        meaningful_keywords = [
            kw for kw in combined
            if (len(kw) > 3 and 
                not any(ignore in kw for ignore in ignore_keywords) and
                kw not in meaningless_words)
        ]
        
        return meaningful_keywords[:5]
    except:
        return []

def generate_improvement_suggestions(keywords, question):
    suggestions = []
    for word in keywords:
        if len(word.split()) > 1:
            suggestions.append(f"Improve {word}")
        else:
            suggestions.append(f"Enhance {word} support")
    return list(set(suggestions))[:3]

def create_wordcloud(text, title):
    if not text:
        return ""
    try:
        wordcloud = WordCloud(
            width=800, height=400,
            background_color='white',
            stopwords=meaningless_words,
            collocations=False
        ).generate(text)
        
        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.title(title, fontsize=14)
        
        img = io.BytesIO()
        plt.savefig(img, format='png', bbox_inches='tight', dpi=150)
        img.seek(0)
        plt.close()
        
        return base64.b64encode(img.getvalue()).decode('utf-8')
    except:
        return ""

def determine_question_type(column_name, values):
    unique_values = [v for v in list(set(values)) if str(v).strip()]
    
    if len(unique_values) <= 5 and all(len(str(v)) < 30 for v in unique_values):
        return "option"
    
    try:
        numeric_values = [int(v) for v in unique_values if str(v).isdigit()]
        if all(1 <= v <= 5 for v in numeric_values) and len(numeric_values) >= 3:
            return "likert"
    except:
        pass
    
    return "text"

def process_question(column_name, values):
    q_type = determine_question_type(column_name, values)
    clean_values = [str(v).strip() for v in values if str(v).strip()]
    
    result = {
        "question": column_name,
        "type": q_type,
        "chart_id": f"chart_{column_name[:20].replace(' ', '_')}"
    }
    
    if q_type == "option":
        counts = Counter(clean_values)
        total = max(sum(counts.values()), 1)
        percentages = {k: round((v / total) * 100, 2) for k, v in counts.items()}
        
        result.update({
            "labels": list(percentages.keys()),
            "data": list(percentages.values()),
            "chart_type": "pie"
        })
    
    elif q_type == "likert":
        try:
            numeric_values = [int(v) for v in clean_values if str(v).isdigit()]
            avg_rating = sum(numeric_values) / len(numeric_values)
            distribution = [numeric_values.count(i) for i in range(1, 6)]
            
            result.update({
                "average": round(avg_rating, 2),
                "distribution": distribution,
                "chart_type": "bar"
            })
        except:
            q_type = "text"
    
    if q_type == "text":
        sentiments = [analyze_sentiment(text) for text in clean_values]
        sentiment_counts = Counter(sentiments)
        emotion_counts = analyze_emotions(clean_values)
        
        combined_text = " ".join(clean_values)
        keywords = extract_keywords(combined_text, column_name)
        improvements = generate_improvement_suggestions(keywords, column_name)
        
        result.update({
            "sentiment_labels": list(sentiment_counts.keys()),
            "sentiment_data": list(sentiment_counts.values()),
            "emotion_labels": list(emotion_counts.keys()),
            "emotion_data": list(emotion_counts.values()),
            "keywords": keywords,
            "top_improvements": improvements,
            "wordcloud": create_wordcloud(combined_text, column_name),
            "chart_type": "doughnut"
        })
    
    return result

def compute_overall_summary(all_texts, all_keywords, all_improvements):
    sentiments = [analyze_sentiment(text) for text in all_texts if text.strip()]
    sentiment_counts = Counter(sentiments)
    total = max(sum(sentiment_counts.values()), 1)
    sentiment_percentages = {
        k: round((v / total) * 100, 2) for k, v in sentiment_counts.items()
    }

    emotion_counts = analyze_emotions(all_texts)

    flat_keywords = [kw for sublist in all_keywords for kw in sublist]
    key_issues = [item for item, _ in Counter(flat_keywords).most_common(5)]

    flat_improvements = [imp for sublist in all_improvements for imp in sublist]
    recommendations = list(dict.fromkeys(flat_improvements))[:5]  # remove duplicates

    return {
        "sentiment_summary": sentiment_percentages,
        "emotion_summary": emotion_counts,
        "key_issues": key_issues,
        "recommendations": recommendations
    }


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('upload.html', error="No file uploaded")
        
        file = request.files['file']
        if file.filename == '':
            return render_template('upload.html', error="No file selected")
        
        try:
            df = pd.read_excel(file)
            df = df.dropna(how='all')
            
            results = []
            all_texts = []
            all_keywords = []
            all_improvements = []

            for column in df.columns:
                if any(kw in str(column).lower() for kw in ignore_keywords):
                    continue

                question_results = process_question(column, df[column].tolist())
                results.append(question_results)

                if question_results["type"] == "text":
                    all_texts.extend([str(v).strip() for v in df[column].tolist() if str(v).strip()])
                    all_keywords.append(question_results.get("keywords", []))
                    all_improvements.append(question_results.get("top_improvements", []))

            summary = compute_overall_summary(all_texts, all_keywords, all_improvements)

            return render_template('results.html', results=results, summary=summary)


        
        except Exception as e:
            return render_template('upload.html', error=f"Error processing file: {str(e)}")
    
    return render_template('upload.html')



   
@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/templates/<path:filename>')
def template_files(filename):
    return send_from_directory('templates', filename)

@app.route('/forms')
def forms():
    return render_template('forms.html')

@app.route('/feedback')
def feedback():
    return render_template('feedback.html')

if __name__ == '__main__':
    app.run(debug=True)
