##first do pip install flask and xgboost
from flask import Flask, request, jsonify
from flask_cors import CORS 
import xgboost as xgb
import numpy as np
import os
from gradio_client import Client

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
    flux_client = Client("black-forest-labs/FLUX.1-schnell")
    result = flux_client.predict(
		prompt="an advertisement for a social media management service called AdVisory",
		seed=0,
		randomize_seed=True,
		width=576,
		height=1024, #16:9 aspect ration
		num_inference_steps=4,
		api_name="/infer")
    print(result)
    return jsonify({'Generated Image': result})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "up"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

    
