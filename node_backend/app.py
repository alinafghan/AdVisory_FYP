##first do pip install flask and xgboost
import base64
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS 
import xgboost as xgb
import numpy as np
from gradio_client import Client

#for enhancing
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch

# Initialize Flask app
app = Flask(__name__)

CORS(app)  

model = xgb.Booster()
model.load_model('xgboost_model.json')  

# Feature names extracted from the model
FEATURE_NAMES = [
    "Target_Audience", "Campaign_Goal", "Duration", "Channel_Used", 
    "Conversion_Rate", "Acquisition_Cost", "Location", "Language", 
    "Clicks", "Impressions", "Engagement_Score", "Customer_Segment", 
    "Scaled_ROI", "Year", "Month", "Day", "ROI_log", "Cost_Per_Click", 
    "Click_Through_Rate", "Cost_Per_Impression", "Engagement_Rate", 
    "Cost_Per_Engagement"
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the input data from the request
        data = request.get_json()
        if 'input' not in data:
            return jsonify({'error': 'Invalid input format. Expected JSON with "input" key.'}), 400
        
        # Convert input to numpy array and reshape
        input_data = np.array(data['input'], dtype=np.float32).reshape(1, -1)
        
        # Convert input data to DMatrix with feature names
        dmatrix = xgb.DMatrix(input_data, feature_names=FEATURE_NAMES)

        # Make prediction
        prediction = model.predict(dmatrix)
        
        # Return the prediction
        return jsonify({'prediction': prediction.tolist()})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/flux', methods=['POST'])
def flux():

    data = request.get_json()

    prompt = data.get('prompt')
    seed = data.get('seed')
    randomize_seed = data.get('randomize_seed')
    width = data.get('width') #576
    height = data.get('height') #1024
    num_inference_steps = data.get('num_inference_steps') #4

    print(f"Prompt: {prompt}")

    flux_client = Client("black-forest-labs/FLUX.1-schnell")
    result = flux_client.predict(
		prompt=prompt,
        seed=0,
        randomize_seed=True,
        width=width,
        height=height,
        num_inference_steps=4,
        api_name="/infer")
    print(result)

    image_path = result[0]  # Get the image file path
    if os.path.exists(image_path):
        # Return a URL to serve the image
        with open(image_path, "rb") as f:
            encoded_image = base64.b64encode(f.read()).decode("utf-8")
        return jsonify({'Generated Image': encoded_image})
    else:
        return jsonify({'error': 'Image generation failed.'}), 500

# @app.route('/serve-image', methods=['GET'])
# def serve_image():
#     image_path = request.args.get('path')
#     if image_path and os.path.exists(image_path):
#         return send_file(image_path, mimetype='image/webp')
#     else:
#         return jsonify({'error': 'File not found.'}), 404

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "upPPPP"}), 200

######################### ENHANCE ################################

device = "cuda" if torch.cuda.is_available() else "cpu"
model_checkpoint = "gokaygokay/Flux-Prompt-Enhance"
tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)
model = AutoModelForSeq2SeqLM.from_pretrained(model_checkpoint).to(device)

enhancer = pipeline('text2text-generation',
                    model=model,
                    tokenizer=tokenizer,
                    repetition_penalty=1.2,
                    device=device)

@app.route('/enhance', methods=['POST'])
def enhance_prompt():
    try:
        data = request.get_json()
        if 'prompt' not in data:
            return jsonify({'error': 'Invalid input. Expected JSON with "prompt" key.'}), 400
        
        prefix = "enhance prompt: "
        input_prompt = prefix + data['prompt']
        
        results = enhancer(input_prompt, max_length=256)
        enhanced_prompt = results[0]['generated_text']
        
        return jsonify({'enhanced_prompt': enhanced_prompt})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)