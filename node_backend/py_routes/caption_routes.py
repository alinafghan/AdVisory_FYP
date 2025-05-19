from flask import Blueprint, request, jsonify
from gradio_client import Client
import base64, os, openai
from dotenv import load_dotenv

caption_bp = Blueprint('generate-caption', __name__)
load_dotenv()

@caption_bp.route('/generate-caption', methods=['POST'])
def generate_caption():
    try:
        data = request.get_json()
        print(data.keys())
        client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        if not client.api_key:
            return jsonify({'error': 'API key is not set'}), 500

        content_list = []  # Prepare a list to hold the content

        if 'image_url' in data:
            image_input = {
                "type": "input_image",
                "image_url": data['image_url']
            }
            content_list.append({"type": "input_text", "text": "Write a caption for a social media post about this image. Make it engaging, include relevant hastags and emojis if it fits the vibe of the image and subject matter"})
            content_list.append(image_input)
        elif 'image_base64' in data:
            image_input = {
                "type": "input_image",
                "image_url": f"data:image/jpeg;base64,{data['image_base64']}"
            }
            content_list.append({"type": "input_text", "text": "Write a caption for a social media post about this image. Make it engaging, include relevant hastags and emojis if it fits the vibe of the image and subject matter"})
            content_list.append(image_input)


        elif 'text_prompt' in data:
            content_list.append({"type": "input_text", "text": data['text_prompt']})
            content_list.append({"type": "input_text", "text": "Write a caption for a social media post about this. Make it engaging, include relevant hashtags and emojis if it fits the vibe of the subject."})

        else:
            return jsonify({'error': 'No valid input provided'}), 400

        request_input = [{
            "role": "user",
            "content": content_list
        }]

        response = client.responses.create(
            model="gpt-4o", 
            input=request_input
        )

        caption = response.output_text

        return jsonify({'caption': caption})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    