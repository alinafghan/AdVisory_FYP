from flask import Blueprint, app, request, jsonify
import os, requests, base64
from werkzeug.utils import secure_filename

edit_image_bp = Blueprint('edit-image', __name__)
@edit_image_bp.route('/edit-image', methods=['POST'])
def edit_image():
    
    # Extract form data or JSON data
    prompt = request.form.get('prompt')
    model = request.form.get('model', 'gpt-image-1')  # Default to 'gpt-image-1' if not specified
    n = request.form.get('n', 1)  # Default to 1 if not specified
    quality = request.form.get('quality', 'auto')  # Default to 'auto' if not specified
    size = request.form.get('size', '1024x1024')  # Default to '1024x1024' if not specified
    
    api_key = os.environ.get('OPENAI_API_KEY') or request.form.get('api_key')
    if not api_key:
        return jsonify({"error": "API key is required"}), 400

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    if 'image' not in request.files:
        return jsonify({"error": "At least one image file is required"}), 400
    
    # Handle multiple image files for gpt-image-1
    image_files = request.files.getlist('image')
    if model == 'gpt-image-1' and len(image_files) > 16:
        return jsonify({"error": "Maximum 16 images allowed for gpt-image-1"}), 400
    elif model == 'dall-e-2' and len(image_files) > 1:
        return jsonify({"error": "Only one image allowed for dall-e-2"}), 400

    # Process mask if provided
    mask = None
    if 'mask' in request.files:
        mask_file = request.files['mask']
        if mask_file.filename:
            mask_filename = secure_filename(mask_file.filename)
            mask_path = os.path.join(app.config['UPLOAD_FOLDER'], mask_filename)
            mask_file.save(mask_path)
            mask = ('mask', (mask_filename, open(mask_path, 'rb'), 'image/png'))
    
    # Save images
    images = []
    for img_file in image_files:
        if img_file.filename:
            filename = secure_filename(img_file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            img_file.save(filepath)
            
            # For gpt-image-1, append images to a list
            images.append(('image[]', (filename, open(filepath, 'rb'), 'image/png')))
    
    # Prepare data
    data = {
        'prompt': prompt,
        'model': model,
        'n': int(n),
        'quality': quality,
        'size': size
    }
    
    # Prepare headers
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        # For dall-e-2 with single image
        if model == 'dall-e-2':
            files = [images[0]]  # Only one image for dall-e-2
            if mask:
                files.append(mask)
        # For gpt-image-1 with multiple images
        else:
            files = images  # All images for gpt-image-1
            if mask:
                files.append(mask)
        
        # Make request to OpenAI API
        response = requests.post(
            "https://api.openai.com/v1/images/edits",
            headers=headers,
            data=data,
            files=files
        )
        
        # Close all open file handles
        for file_tuple in files:
            try:
                file_tuple[1][1].close()
            except:
                pass
        
        # Get the base64 encoded image from the response
        if response.status_code == 200:
            response_json = response.json()
            image_base64 = response_json['data'][0]['b64_json']

            # Save the base64 image to your device
            image_data = base64.b64decode(image_base64)
            image_filename = "edited_image.png"  # You can customize the filename
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            with open(image_path, 'wb') as f:
                f.write(image_data)

            return jsonify({
                'message': 'Image edited and saved successfully.',
                'imageBase64': image_base64,
                'saved_image_path': image_path
            }), 200
        
        return jsonify({"error": "Failed to generate image"}), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
