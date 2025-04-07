##first do pip install flask and xgboost
import base64
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS 
import xgboost as xgb
import numpy as np
from flask_cors import CORS
import pandas as pd
from trends_analyzer import TrendAnalyzer  
import logging
from gradio_client import Client
from rembg_helper import remove_background
import io


# Initialize Flask app
app = Flask(__name__)

CORS(app)  

#budget start###############################################################################
model = xgb.Booster()
model.load_model('xgboost_model.json')  

# Feature names extracted from the model
FEATURE_NAMES = [
    "Target_Audience", "Campaign_Goal", "Duration", "Channel_Used", 
    "Conversion_Rate", "Acquisition_Cost","ROI", "Location", "Language", 
    "Clicks", "Impressions", "Engagement_Score", "Customer_Segment", "Conversions",
    "Cost_Per_Click", 
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

        #we did in log scale so return
        prediction_og = np.exp(prediction)
        
        # Return the prediction
        return jsonify({'prediction': prediction_og.tolist()})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
#########################budget end #########################################################################

# Initialize the TrendAnalyzer
analyzer = TrendAnalyzer()

@app.route('/analyze', methods=['POST'])
def analyze_trends():
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        
        if not keywords:
            return jsonify({'error': 'No keywords provided'}), 400
            
        # Process pipeline
        processed_data = analyzer.fetch_trend_data(keywords)
        if not processed_data:
            return jsonify({'error': 'Failed to fetch trend data'}), 500
            
        models, forecasts = analyzer.train_prediction_models(processed_data)
        if not forecasts:
            return jsonify({'error': 'Failed to generate forecasts'}), 500
            
        insights = analyzer.get_trend_insights(forecasts)
        if not insights:
            return jsonify({'error': 'Failed to generate insights'}), 500
            
        recommendations = analyzer.generate_ad_recommendations(insights)
        if not recommendations:
            return jsonify({'error': 'Failed to generate recommendations'}), 500
            
        return jsonify({
            'insights': insights,
            'recommendations': recommendations
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_trends: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/predictions/<keyword>', methods=['GET'])
def get_predictions(keyword):
    try:
        # Fetch trend data for single keyword
        processed_data = analyzer.fetch_trend_data([keyword])
        if not processed_data or keyword not in processed_data:
            return jsonify({'error': f'No data available for {keyword}'}), 404
            
        # Generate predictions
        models, forecasts = analyzer.train_prediction_models({keyword: processed_data[keyword]})
        if not forecasts or keyword not in forecasts:
            return jsonify({'error': 'Failed to generate predictions'}), 500
            
        # Extract prediction data
        forecast_data = forecasts[keyword][['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30)
        prediction_data = forecast_data.to_dict(orient='records')
        
        return jsonify({
            'keyword': keyword,
            'predictions': prediction_data
        })
        
    except Exception as e:
        logger.error(f"Error in get_predictions: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/search', methods=['POST'])
def search_trends():
    try:
        data = request.get_json()
        query = data.get('query', '').strip().lower()

        if not query:
            return jsonify({'error': 'Search query is required'}), 400

        # Fetch all trends (or use cached data)
        all_trends = fetch_all_trends()  # Replace with your logic to fetch all trends

        # Filter trends based on the search query
        filtered_trends = {
            keyword: insight
            for keyword, insight in all_trends.items()
            if query in keyword.lower()
        }

        return jsonify({
            'insights': filtered_trends,
            'recommendations': []  # Add logic to filter recommendations if needed
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

################################trends end###############################################

@app.route('/flux', methods=['POST'])
def flux():
    data = request.get_json()

    prompt = data.get('prompt')
    seed = data.get('seed')
    randomize_seed = data.get('randomize_seed')
    width = data.get('width') #576
    height = data.get('height') #1024
    num_inference_steps = data.get('num_inference_steps') #4

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

################################flux end ###############################################


# @app.route('/serve-image', methods=['GET'])
# def serve_image():
#     image_path = request.args.get('path')
#     if image_path and os.path.exists(image_path):
#         return send_file(image_path, mimetype='image/webp')
#     else:
#         return jsonify({'error': 'File not found.'}), 404

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "up"}), 200



################################productad##########################################
@app.route('/remove-bg', methods=['POST'])
def remove_bg():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    image_bytes = image.read()

    try:
        output_image_bytes = remove_background(image_bytes)

        return send_file(
            io.BytesIO(output_image_bytes),
            mimetype='image/png',
            as_attachment=False,
            download_name='processed.png'
        )

    except Exception as e:
        return jsonify({'error': 'Failed to process image', 'details': str(e)}), 500
    



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
    
