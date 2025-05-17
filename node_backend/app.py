from io import BytesIO
import os, base64, xgboost as xgb, numpy as np, requests, pandas as pd, openai, torch, logging, cvxpy as cp
from flask_cors import CORS
from trends_analyzer import TrendAnalyzer  
from gradio_client import Client
from dotenv import load_dotenv
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from PIL import Image
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from scipy.optimize import curve_fit
from flask import Flask, jsonify
from apify_client import ApifyClient
import tempfile, json, uuid, time, shutil, re
from datetime import datetime



logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)

CACHE_DIR = os.path.join(tempfile.gettempdir(), 'facebook_ad_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

openai.api_key = os.getenv("OPENAI_API_KEY")

CORS(app)  

# # Initialize the TrendAnalyzer
# analyzer = TrendAnalyzer()

# @app.route('/analyze', methods=['POST'])
# def analyze_trends():
#     try:
#         data = request.get_json()
#         keywords = data.get('keywords', [])
        
#         if not keywords:
#             return jsonify({'error': 'No keywords provided'}), 400
            
#         # Process pipeline
#         processed_data = analyzer.fetch_trend_data(keywords)
#         if not processed_data:
#             return jsonify({'error': 'Failed to fetch trend data'}), 500
            
#         models, forecasts = analyzer.train_prediction_models(processed_data)
#         if not forecasts:
#             return jsonify({'error': 'Failed to generate forecasts'}), 500
            
#         insights = analyzer.get_trend_insights(forecasts)
#         if not insights:
#             return jsonify({'error': 'Failed to generate insights'}), 500
            
#         recommendations = analyzer.generate_ad_recommendations(insights)
#         if not recommendations:
#             return jsonify({'error': 'Failed to generate recommendations'}), 500
            
#         return jsonify({
#             'insights': insights,
#             'recommendations': recommendations
#         })
        
#     except Exception as e:
#         logger.error(f"Error in analyze_trends: {str(e)}")
#         return jsonify({'error': str(e)}), 500

# @app.route('/predictions/<keyword>', methods=['GET'])
# def get_predictions(keyword):
#     try:
#         # Fetch trend data for single keyword
#         processed_data = analyzer.fetch_trend_data([keyword])
#         if not processed_data or keyword not in processed_data:
#             return jsonify({'error': f'No data available for {keyword}'}), 404
            
#         # Generate predictions
#         models, forecasts = analyzer.train_prediction_models({keyword: processed_data[keyword]})
#         if not forecasts or keyword not in forecasts:
#             return jsonify({'error': 'Failed to generate predictions'}), 500
            
#         # Extract prediction data
#         forecast_data = forecasts[keyword][['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30)
#         prediction_data = forecast_data.to_dict(orient='records')
        
#         return jsonify({
#             'keyword': keyword,
#             'predictions': prediction_data
#         })
        
#     except Exception as e:
#         logger.error(f"Error in get_predictions: {str(e)}")
#         return jsonify({'error': str(e)}), 500
    
# @app.route('/search', methods=['POST'])
# def search_trends():
#     try:
#         data = request.get_json()
#         query = data.get('query', '').strip().lower()

#         if not query:
#             return jsonify({'error': 'Search query is required'}), 400

#         # Fetch all trends (or use cached data)
#         all_trends = fetch_all_trends()  # Replace with your logic to fetch all trends

#         # Filter trends based on the search query
#         filtered_trends = {
#             keyword: insight
#             for keyword, insight in all_trends.items()
#             if query in keyword.lower()
#         }

#         return jsonify({
#             'insights': filtered_trends,
#             'recommendations': []  # Add logic to filter recommendations if needed
#         })

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

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

    image_path = result[0]  
    if os.path.exists(image_path):
        with open(image_path, "rb") as f:
            encoded_image = base64.b64encode(f.read()).decode("utf-8")
        return jsonify({'Generated Image': encoded_image})
    else:
        return jsonify({'error': 'Image generation failed.'}), 500

@app.route('/generate-ad-image', methods=['POST'])
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

##################### caption ##############################

load_dotenv()
@app.route('/generate-caption', methods=['POST'])
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


@app.route("/")
def home():
    return "Flask is running!"

######################### EDIT IMAGE #################################

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configure upload folder for temporary image files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/edit-image', methods=['POST'])
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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "up"}), 200

###########################################budget##########################################

# Stage 1
def stage1_equal_allocation(n_ads, B):
    return np.full(n_ads, B / n_ads)

# Stage 2: β = y / log(x), α=0
def stage2_estimate_beta(x, y):
    x = np.maximum(x, 1e-6)
    return y / np.log(x)

# Stage 3: fit α,β with bounds β>=0
def stage3_estimate_alpha_beta(x, y):
    x = np.maximum(x, 1e-6)
    def model(x, alpha, beta):
        return alpha + beta * np.log(x)
    popt, _ = curve_fit(
        model, x, y, p0=[0.0,1.0],
        bounds=([-np.inf,0.0],[np.inf,np.inf])
    )
    return popt[0], popt[1]

# Dual formula
def compute_dual(alpha, beta, lam, B):
    return (
        lam * B
        + np.sum(alpha)
        + np.sum(beta * (np.log(beta) - 1))
        - np.sum(beta) * np.log(lam)
    )

# CVXPY solve
def run_optimization(alpha, beta, B):
    n = len(beta)
    x = cp.Variable(n, pos=True)
    obj = cp.Maximize(cp.sum(alpha + cp.multiply(beta, cp.log(x))))
    cons = [cp.sum(x) <= B]
    prob = cp.Problem(obj, cons)
    prob.solve()
    lam = cons[0].dual_value
    return {
        "x_opt": x.value.tolist(),
        "primal": prob.value,
        "dual_var": lam,
        "dual_obj": compute_dual(alpha, beta, lam, B)
    }

@app.route("/allocate", methods=["POST"])
def allocate_budget():
    data = request.get_json()
    n_ads = int(data["n_ads"])
    B = float(data["budget"])
    conv = data["conversions"]      # list of lists

    # decide stage
    all_zero = all(all(y==0 for y in hist) for hist in conv)
    lengths = [len(hist) for hist in conv]

    if all_zero:
        stage = 1
        x_opt = stage1_equal_allocation(n_ads, B).tolist()
        return jsonify(stage=stage, x_opt=x_opt)

    # Stage 2: every history length == 1
    if all(l==1 for l in lengths):
        stage = 2
        x1 = stage1_equal_allocation(n_ads, B)
        beta = np.array([stage2_estimate_beta(x1[i], conv[i][0]) for i in range(n_ads)])
        alpha = np.zeros(n_ads)
        res = run_optimization(alpha, beta, B)
        return jsonify(stage=stage, **res)

    # Stage 3:
    stage = 3
    # build history arrays
    alpha = np.zeros(n_ads)
    beta  = np.zeros(n_ads)
    x1 = stage1_equal_allocation(n_ads, B)
    # Need a baseline spend; let's re-run stage 2 to get x2
    beta2 = np.array([stage2_estimate_beta(x1[i], conv[i][0]) for i in range(n_ads)])
    alpha2 = np.zeros(n_ads)
    res2 = run_optimization(alpha2, beta2, B)
    x2 = np.array(res2["x_opt"])

    for i in range(n_ads):
        xi = np.array([x1[i], x2[i]])
        yi = np.array(conv[i])  # must be length >=2
        yi_full = conv[i]
        if len(yi_full) < 2:
           yi = np.array([yi_full[0], yi_full[0]])
        else:
            yi = np.array(yi_full[:2])
        alpha[i], beta[i] = stage3_estimate_alpha_beta(xi, yi)

    res3 = run_optimization(alpha, beta, B)
    return jsonify(stage=stage, α=alpha.tolist(), β=beta.tolist(), **res3)

def extract_social_links(text):
    if not text:
        return []
    
    patterns = [
        r'https?://(?:www\.)?facebook\.com/\S+',
        r'https?://(?:www\.)?instagram\.com/\S+',
        r'https?://(?:www\.)?twitter\.com/\S+',
        r'https?://(?:www\.)?linkedin\.com/\S+',
        r'https?://(?:www\.)?tiktok\.com/\S+',
    ]
    
    links = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        links.extend(matches)
    
    return links

@app.route('/scrape-facebook-ads', methods=['POST'])
def scrape_facebook_ads():
    logging.info("Received request to /scrape-facebook-ads")
    try:
        data = request.get_json()
        keyword = data.get('keyword', '').strip()
        
        if not keyword:
            return jsonify({'error': 'Keyword is required'}), 400
        
        client = ApifyClient("apify_api_NjSZxqtGL9yuEkNE2WTX38WZMf14dt1QevpQ")
        
        search_url = f"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&is_targeted_country=false&media_type=all&q={keyword}&search_type=keyword_unordered"
        
        run_input = {
            "urls": [{"url": search_url}],
            "count": 100,
            "scrapePageAds.activeStatus": "all",
            "period": "",
        }
        
        logging.info(f"Triggering Apify actor with input: {run_input}")
        run = client.actor("XtaWFhbtfxyzqrFmd").call(run_input=run_input)
        
        filtered_results = []
        
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            snapshot = item.get('snapshot', {})
            body = snapshot.get('body', {}) or {}
            body_text = body.get('text', '') if isinstance(body, dict) else ''
            page_name = snapshot.get('page_name', '')
            page_categories = snapshot.get('page_categories', [])
            
            if len(body_text.split()) > 500 or page_name == "Random Reading" or page_categories == "Movies":
                continue
            
            filtered_item = {
                'body_text': body_text,
                'social_links': extract_social_links(body_text),
                'page_categories': snapshot.get('page_categories', []),
                'page_name': snapshot.get('page_name', ''),
                'page_profile_picture_url': snapshot.get('page_profile_picture_url', ''),
            }
            
            # Gather all potential image source
            all_image_urls = []
            
            images = snapshot.get('images', [])
            all_image_urls += [
                img.get('original_image_url') for img in images if img.get('original_image_url')
            ]
            
            extra_images = snapshot.get('extra_images', [])
            all_image_urls += [
                img.get('original_image_url') for img in extra_images if img.get('original_image_url')
            ]
            card = snapshot.get('card', {})
            if isinstance(card, dict):
                card_image_urls = card.get('original_image_urls', [])
                all_image_urls += [url for url in card_image_urls if url]
                
            filtered_item['original_image_urls'] = list(set(filter(None, all_image_urls)))
            
            videos = snapshot.get('videos', [])
            if videos:
                filtered_item['video_preview_image_urls'] = [
                    video.get('video_preview_image_url', '') for video in videos if video.get('video_preview_image_url')
                ]
            
            filtered_results.append(filtered_item)
        
        logging.info(f"Processing {len(filtered_results)} ad results.")
        
        # Save ads and images to client-side cache
        processed_ads = save_to_cache(keyword, filtered_results)
        
        # Prepare response with image paths for captioning
        image_paths = []
        for ad in processed_ads:
            for image in ad['images']:
                image_paths.append({
                    'id': image['id'],
                    'local_path': image['local_path'],
                    'ad_id': ad['id'],
                    'page_name': ad['page_name']
                })
        
        return jsonify({
            'success': True,
            'keyword': keyword,
            'processed_ads_count': len(processed_ads),
            'images': image_paths[:10]  # Return only top 10 images for captioning
        })
    
    except Exception as e:
        logging.exception("Error while processing request")
        return jsonify({'error': str(e)}), 500

CACHE_DIR = os.path.join(tempfile.gettempdir(), 'facebook_ad_cache')
os.makedirs(CACHE_DIR, exist_ok=True)
CACHE_METADATA = os.path.join(CACHE_DIR, 'cache_metadata.json')

def init_cache():
    """Initialize the client-side cache metadata"""
    if not os.path.exists(CACHE_METADATA):
        with open(CACHE_METADATA, 'w') as f:
            json.dump({
                'keywords': {},
                'images': {}
            }, f)
        logging.info("Cache metadata initialized")
    else:
        logging.info("Cache metadata already exists")

# Initialize the cache at startup
init_cache()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def download_image(url, save_path):
    """Download image from URL and save to client-side cache"""
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # Save the image
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return True
    except Exception as e:
        logging.error(f"Error downloading image {url}: {str(e)}")
        return False
    
def save_to_cache(keyword, ads):
    """Save ads and their images to client-side cache"""
    # Load the cache metadata
    try:
        with open(CACHE_METADATA, 'r') as f:
            cache_data = json.load(f)
    except Exception:
        cache_data = {'keywords': {}, 'images': {}}
    
    # Create a keyword entry if it doesn't exist
    if keyword not in cache_data['keywords']:
        cache_data['keywords'][keyword] = {
            'timestamp': datetime.now().isoformat(),
            'ads': []
        }
    
    # Create images directory if it doesn't exist
    images_dir = os.path.join(CACHE_DIR, 'images', keyword)
    os.makedirs(images_dir, exist_ok=True)
    
    processed_ads = []
    
    for ad in ads[:10]:  # Process only top 10 results
        ad_id = str(uuid.uuid4())
        
        ad_info = {
            'id': ad_id,
            'page_name': ad.get('page_name', ''),
            'page_categories': ad.get('page_categories', []),
            'body_text': ad.get('body_text', ''),
            'social_links': ad.get('social_links', []),
            'page_profile_picture_url': ad.get('page_profile_picture_url', ''),
            'images': []
        }
        
        # Process images
        image_urls = ad.get('original_image_urls', [])
        for idx, img_url in enumerate(image_urls):
            if not img_url:
                continue
            
            # Generate a unique filename
            image_id = str(uuid.uuid4())
            timestamp = int(time.time())
            filename = f"{ad_id}_{idx}_{timestamp}.jpg"
            local_path = os.path.join(images_dir, filename)
            
            # Download the image
            if download_image(img_url, local_path):
                # Add to cache metadata
                image_info = {
                    'id': image_id,
                    'url': img_url,
                    'local_path': local_path,
                    'filename': filename,
                    'ad_id': ad_id,
                    'timestamp': datetime.now().isoformat()
                }
                
                cache_data['images'][image_id] = image_info
                ad_info['images'].append(image_info)
        
        # Add to the keyword's ads list
        cache_data['keywords'][keyword]['ads'].append(ad_info)
        processed_ads.append(ad_info)
    
    # Save the updated cache metadata
    with open(CACHE_METADATA, 'w') as f:
        json.dump(cache_data, f, indent=2)
    
    logging.info(f"Saved {len(processed_ads)} ads and their images to client-side cache")
    return processed_ads


@app.route('/cache-images/<path:filepath>', methods=['GET'])
def serve_cached_image(filepath):
    """Serve an image from the cache"""
    directory = os.path.join(CACHE_DIR, 'images')
    return send_from_directory(directory, filepath)

@app.route('/clear-cache', methods=['POST'])
def clear_cache():
    """Clear the client-side cache"""
    try:
        # Remove all files in the cache directory
        for root, dirs, files in os.walk(CACHE_DIR):
            for file in files:
                if file != 'cache_metadata.json':  # Keep the metadata file
                    os.remove(os.path.join(root, file))
            
            for dir in dirs:
                shutil.rmtree(os.path.join(root, dir))
        
        # Reset the cache metadata
        with open(CACHE_METADATA, 'w') as f:
            json.dump({
                'keywords': {},
                'images': {}
            }, f)
        
        return jsonify({
            'success': True,
            'message': 'Cache cleared successfully'
        })
    
    except Exception as e:
        logging.exception("Error while clearing cache")
        return jsonify({'error': str(e)}), 500

@app.route('/caption-image', methods=['POST'])
def caption_image():
    """Send an image to the captioning API and return the result"""
    try:
        data = request.get_json()
        image_path = data.get('image_path')
        
        if not image_path or not os.path.exists(image_path):
            return jsonify({'error': 'Valid image path is required'}), 400
        
        # Call the image captioning API
        caption = generate_image_caption(image_path)
        
        # Update the cache metadata with the caption
        with open(CACHE_METADATA, 'r') as f:
            cache_data = json.load(f)
        
        # Find the image in the metadata
        image_id = None
        for img_id, img_data in cache_data['images'].items():
            if img_data['local_path'] == image_path:
                image_id = img_id
                cache_data['images'][img_id]['caption'] = caption
                break
        
        # Save the updated cache metadata
        with open(CACHE_METADATA, 'w') as f:
            json.dump(cache_data, f, indent=2)
        
        return jsonify({
            'success': True,
            'image_id': image_id,
            'image_path': image_path,
            'caption': caption
        })
    
    except Exception as e:
        logging.exception("Error while captioning image")
        return jsonify({'error': str(e)}), 500

@app.route('/caption-cached-images', methods=['POST'])
def caption_cached_images():
    """Caption multiple images from the cache"""
    try:
        data = request.get_json()
        image_paths = data.get('image_paths', [])
        
        if not image_paths:
            return jsonify({'error': 'Image paths are required'}), 400
        model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
        feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
        tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

        model.to(device)
        
        results = []
        
        for image_path in image_paths:
            try:
                if not os.path.exists(image_path):
                    results.append({
                        'image_path': image_path,
                        'success': False,
                        'error': 'Image file not found'
                    })
                    continue
                
                max_length = 16
                num_beams = 4
                gen_kwargs = {"max_length": max_length, "num_beams": num_beams}
                
                i_image = Image.open(image_path)
                if i_image.mode != "RGB":
                    i_image = i_image.convert(mode="RGB")
                
                pixel_values = feature_extractor(images=[i_image], return_tensors="pt").pixel_values
                pixel_values = pixel_values.to(device)
                
                output_ids = model.generate(pixel_values, **gen_kwargs)
                
                preds = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
                caption = preds[0].strip()
                
                results.append({
                    'image_path': image_path,
                    'success': True,
                    'caption': caption
                })
                
            except Exception as e:
                results.append({
                    'image_path': image_path,
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'results': results
        })
    
    except Exception as e:
        logging.exception("Error while captioning images")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
