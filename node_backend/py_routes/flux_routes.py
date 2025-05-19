from flask import Blueprint, request, jsonify
from gradio_client import Client
import base64, os

flux_bp = Blueprint('flux', __name__)

@flux_bp.route('/flux', methods=['POST'])

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

    image_path = result[0]  
    if os.path.exists(image_path):
        with open(image_path, "rb") as f:
            encoded_image = base64.b64encode(f.read()).decode("utf-8")
        return jsonify({'Generated Image': encoded_image})
    else:
        return jsonify({'error': 'Image generation failed.'}), 500