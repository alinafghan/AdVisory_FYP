from flask import Blueprint, request, jsonify
from gradio_client import Client
import base64, os, openai

gpt_bp = Blueprint('generate-ad-image', __name__)

@gpt_bp.route('/generate-ad-image', methods=['POST'])
def generate_ad_image():
    try:
        data = request.get_json()
        
        # Ensure the prompt is provided
        if 'prompt' not in data:
            return jsonify({'error': 'Prompt is required for image generation'}), 400
        
        # Call OpenAI to generate an image
        result = openai.images.generate(
            model="gpt-image-1",  # Use the appropriate model for image generation
            prompt=data['prompt']  
        )
        
        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)
        # Save the image to a file
        with open("blackhole.png", "wb") as f:
            f.write(image_bytes)
        
        # Return the image in base64 format or the path of the saved image
        return jsonify({
            'message': 'Ad image generated successfully',
            'imageBase64': image_base64  # Return base64 image data if needed
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500