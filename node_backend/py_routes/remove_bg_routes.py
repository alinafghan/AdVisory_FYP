from flask import Blueprint, request, jsonify,send_file
from gradio_client import Client
import base64, os, openai
from rembg_helper import remove_background
import replicate, io

remove_bg_bp = Blueprint('remove-bg', __name__)  

api_token = os.getenv("API_TOKEN")
replicate_client = replicate.Client(api_token)
REPLICATE_MODEL_URL = "bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe"
REPLICATE_MODEL = "daanelson/real-esrgan-a100:f94d7ed4a1f7e1ffed0d51e4089e4911609d5eeee5e874ef323d2c7562624bed"

@remove_bg_bp.route('/remove-bg', methods=['POST'])
def remove_bg():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    image_bytes = image.read()

    try:
        # Step 1: Pass the image through Real-ESRGAN
        enhanced_image_url = upscale_image_with_realesrgan(image_bytes)

        # Step 2: Download the enhanced image from the output URL
        enhanced_image_bytes = download_image(enhanced_image_url)

        # Step 3: Remove the background from the enhanced image
        output_image_bytes = remove_background(enhanced_image_bytes)

        # Return the final image
        return send_file(
            io.BytesIO(output_image_bytes),
            mimetype='image/png',
            as_attachment=False,
            download_name='processed.png'
        )

    except Exception as e:
        return jsonify({'error': 'Failed to process image', 'details': str(e)}), 500

def download_image(url):
    import requests
    response = requests.get(url)
    if response.status_code != 200:
        raise RuntimeError("Failed to download processed image")
    return response.content

def upscale_image_with_realesrgan(image_bytes):
    try:
        # Base64 encode the image bytes
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        # Pass the base64-encoded string to the model
        input = {
            "image": f"data:image/png;base64,{image_base64}",
            "scale": 4,  # Adjust scale as needed
            "face_enhance": True
        }
        output_url = replicate_client.run(REPLICATE_MODEL, input=input)
        return output_url  # Output is a URL to the enhanced image
    except Exception as e:
        raise RuntimeError(f"Real-ESRGAN processing failed: {str(e)}")

