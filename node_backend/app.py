##first do pip install flask and pip install xgboost
from flask import Flask, request, jsonify
import xgboost as xgb
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load the pre-trained XGBoost model
model = xgb.Booster()
model.load_model('xgboost_model.json')  # Path to your saved model

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the input data from the request (expected as JSON)
        data = request.get_json()
        input_data = np.array(data['input']).reshape(1, -1)  # Ensure it's in the correct shape
        
        # Convert input data to DMatrix format
        dmatrix = xgb.DMatrix(input_data)
        
        # Make prediction
        prediction = model.predict(dmatrix)
        
        # Return the prediction as a JSON response
        return jsonify({'prediction': prediction.tolist()})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
