from flask import Blueprint, request, jsonify
from apify_client import ApifyClient
import logging, json, requests, re, torch, openai, uuid, os, tempfile, time
from PIL import Image
from datetime import datetime

scrape_bp = Blueprint('scrape-ads', __name__)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CACHE_DIR = os.path.join(tempfile.gettempdir(), 'facebook_ad_cache')
os.makedirs(CACHE_DIR, exist_ok=True)
CACHE_METADATA = os.path.join(CACHE_DIR, 'cache_metadata.json')

@scrape_bp.route('/scrape-ads', methods=['POST'])
def scrape_ads():
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
            snapshot = item.get('snapshot', {}) or {}
            body = snapshot.get('body', {}) or {}
            body_text = body.get('text', '') if isinstance(body, dict) else ''
            page_name = snapshot.get('page_name', '')
            page_categories = snapshot.get('page_categories', [])

            if len(body_text.split()) > 500 or page_name == "Random Reading" or page_categories == "Movies":
                continue

            ad_data = {
                'body_text': body_text,
                'page_name': page_name,
                'page_categories': page_categories,
                'social_links': extract_social_links(body_text),
                'page_profile_picture_url': snapshot.get('page_profile_picture_url', ''),
                'original_image_urls': [],
                'video_preview_image_urls': []
            }

            images = snapshot.get('images', []) + snapshot.get('extra_images', [])
            card = snapshot.get('card', {})
            card_image_urls = card.get('original_image_urls', []) if isinstance(card, dict) else []

            all_image_urls = [
                img.get('original_image_url') for img in images if img.get('original_image_url')]
            all_image_urls += [url for url in card_image_urls if url]

            # Fallback: extract from raw HTML in 'snapshot' or 'body'
            if not all_image_urls:
                html_str = json.dumps(snapshot)
                html_image_matches = re.findall(r'(https?:\/\/[^"\']+?\.(?:jpg|jpeg|png|webp))', html_str, re.IGNORECASE)
                all_image_urls = list(set(html_image_matches))  # Deduplicate
            
            if not all_image_urls:
                print(f"[DEBUG] No images in structured data for ad {page_name}")
            else:
                print(f"[DEBUG] Extracted images: {all_image_urls}")

            ad_data['original_image_urls'] = list(set(filter(None, all_image_urls)))
            videos = snapshot.get('videos', [])
            ad_data['video_preview_image_urls'] = [v.get('video_preview_image_url') for v in videos if v.get('video_preview_image_url')]

            filtered_results.append(ad_data)

        processed_ads = save_to_cache(keyword, filtered_results)

        # The problem is here - we'll need to limit API calls
        MAX_GENERATED_ADS_PER_ITEM = 1  # Limit to just 1 generation per ad instead of 4
        MAX_ADS_TO_PROCESS = 3  # Only process 3 ads instead of 10

        from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
        model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning").to(device)
        processor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
        tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

        # Only process a limited number of ads to save costs
        for ad in processed_ads[:MAX_ADS_TO_PROCESS]:
            ad['generated_ads'] = []
            
            # Only process first image for each ad
            for image_data in ad['images'][:1]:  
                image_path = image_data['local_path']
                
                # Use try/except to avoid crashing if the image can't be processed
                try:
                    image = Image.open(image_path)
                    if image.mode != "RGB":
                        image = image.convert(mode="RGB")
                    inputs = processor(images=image, return_tensors="pt").pixel_values.to(device)
                    output = model.generate(inputs, max_length=16, num_beams=4)
                    caption = tokenizer.decode(output[0], skip_special_tokens=True).strip()
                    image_data['caption'] = caption
                
                    # Only generate a single ad variant instead of 4
                    for _ in range(MAX_GENERATED_ADS_PER_ITEM):
                        # try:
                        #     result = openai.images.generate(
                        #         model="gpt-image-1",
                        #         prompt=caption
                        #     )
                        #     image_base64 = result.data[0].b64_json
                        try:
                            flux_response = requests.post('http://localhost:5000/flux', json={
                                'prompt': caption,
                                'seed': 0,
                                'randomize_seed': True,
                                'width': 576,
                                'height': 1024,
                                'num_inference_steps': 4
                            })
                            
                            if flux_response.status_code == 200:
                                flux_data = flux_response.json()
                                image_base64 = flux_data.get('Generated Image')
                            else:
                                raise Exception(f"Flux API returned status code {flux_response.status_code}")

                            # cap_resp = openai.chat.completions.create(
                            #     model="gpt-4o",
                            #     messages=[{
                            #         "role": "user",
                            #         "content": [
                            #             {"type": "text", "text": f"Write a caption for an ad based on this prompt: {caption}. Include hashtags and emojis."}
                            #         ]
                            #     }]
                            # )
                            # new_caption = cap_resp.choices[0].message.content.strip()
                            new_caption = "new caption based on the generated image"  # Placeholder for actual caption generation

                            ad['generated_ads'].append({
                                'image_base64': image_base64,
                                'caption': new_caption
                            })
                        except Exception as gen_err:
                            logging.warning(f"Ad generation failed: {str(gen_err)}")
                except Exception as img_err:
                    logging.warning(f"Image processing failed: {str(img_err)}")
                    continue

        return jsonify({
            'success': True,
            'keyword': keyword,
            'ads': processed_ads
        })

    except Exception as e:
        logging.exception("Error during scrape-facebook-ads")
        return jsonify({'error': str(e)}), 500 

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

def download_image(url, local_path):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": "https://www.facebook.com/"
        }
        response = requests.get(url, headers=headers, stream=True, timeout=10)
        if response.status_code == 200:
            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
        else:
            print(f"Failed to download image from {url}: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading image from {url}: {str(e)}")
        return False