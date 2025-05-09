# rembg_processor.py
from rembg import remove
from PIL import Image
import io

def remove_background(image_bytes):
    try:
        print("Removing background...")
        input_io = io.BytesIO(image_bytes)
        input_image = Image.open(input_io)

        # Convert to RGBA for consistent output
        if input_image.mode != 'RGBA':
            input_image = input_image.convert('RGBA')

        output_bytes = remove(image_bytes)
        print("Background removed!")
        return output_bytes

    except Exception as e:
        print(f"Error during background removal: {str(e)}")
        raise
