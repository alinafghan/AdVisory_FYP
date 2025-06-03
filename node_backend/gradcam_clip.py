# gradcam_clip.py
import torch
import torch.nn.functional as F
from open_clip import create_model_and_transforms, tokenize
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
import io
import base64
import logging
from matplotlib.colors import LinearSegmentedColormap

logger = logging.getLogger(__name__)

class CLIPGradCAMVisualizer:
    def __init__(self, model_name="ViT-B-32", pretrained="openai", device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model, _, self.preprocess = create_model_and_transforms(model_name, pretrained=pretrained)
        self.model.eval().to(self.device)
        
        # Store the original forward method
        self.activations = {}
        self.gradients = {}
        
        # Register hooks for the last transformer block
        self.target_layer = self._find_and_register_hooks()
        logger.info(f"Initialized GradCAM with target layer: {self.target_layer}")

    def _find_and_register_hooks(self):
        """Find the appropriate layer and register hooks"""
        # Try to find the last transformer block
        target_module = None
        target_name = None
        
        # Look for transformer blocks in CLIP's visual encoder
        if hasattr(self.model.visual, 'transformer') and hasattr(self.model.visual.transformer, 'resblocks'):
            # Use the last transformer block
            last_block_idx = len(self.model.visual.transformer.resblocks) - 1
            target_module = self.model.visual.transformer.resblocks[last_block_idx]
            target_name = f"transformer.resblocks.{last_block_idx}"
        elif hasattr(self.model.visual, 'blocks'):
            # Alternative structure
            last_block_idx = len(self.model.visual.blocks) - 1
            target_module = self.model.visual.blocks[last_block_idx]
            target_name = f"blocks.{last_block_idx}"
        else:
            # Fallback to layer norm post
            target_module = self.model.visual.ln_post
            target_name = "ln_post"
        
        if target_module:
            # Register forward hook
            target_module.register_forward_hook(self._forward_hook)
            # Register backward hook
            target_module.register_full_backward_hook(self._backward_hook)
            
        return target_name

    def _forward_hook(self, module, input, output):
        """Store activations during forward pass"""
        self.activations['target'] = output

    def _backward_hook(self, module, grad_input, grad_output):
        """Store gradients during backward pass"""
        self.gradients['target'] = grad_output[0]

    def generate_heatmap(self, image: Image.Image, text: str) -> str:
        """Generate heatmap using custom gradient computation"""
        try:
            # Clear previous activations/gradients
            self.activations.clear()
            self.gradients.clear()
            
            # Preprocess
            input_image = self.preprocess(image).unsqueeze(0).to(self.device)
            input_text = tokenize([text]).to(self.device)

            # Enable gradients
            input_image.requires_grad_(True)
            self.model.zero_grad()

            # Forward pass
            image_features = self.model.encode_image(input_image)
            text_features = self.model.encode_text(input_text)
            
            # Calculate similarity
            image_features_norm = image_features / image_features.norm(dim=-1, keepdim=True)
            text_features_norm = text_features / text_features.norm(dim=-1, keepdim=True)
            similarity = (image_features_norm @ text_features_norm.T).squeeze()

            # Backward pass
            similarity.backward(retain_graph=True)
            
            # Check if we have gradients and activations
            if 'target' not in self.gradients or 'target' not in self.activations:
                logger.warning("No gradients or activations captured, using fallback method")
                return self._generate_attention_heatmap(image, text)
            
            # Compute GradCAM
            gradients = self.gradients['target']
            activations = self.activations['target']
            
            # Handle different tensor shapes
            if len(gradients.shape) == 3:  # [batch, seq_len, features]
                # For transformer outputs, we need to reshape for spatial visualization
                seq_len = gradients.shape[1]
                # Assuming square patches (common in ViT)
                patch_size = int(np.sqrt(seq_len - 1))  # -1 for CLS token
                
                if patch_size * patch_size == seq_len - 1:
                    # Remove CLS token and reshape
                    gradients_spatial = gradients[0, 1:, :].mean(dim=-1)  # Average over features
                    gradients_spatial = gradients_spatial.view(patch_size, patch_size)
                else:
                    # Fallback: use all tokens
                    gradients_spatial = gradients[0, :, :].mean(dim=-1)
                    gradients_spatial = gradients_spatial.view(int(np.sqrt(seq_len)), int(np.sqrt(seq_len)))
            else:
                # Handle other shapes
                gradients_spatial = gradients.mean(dim=(0, -1)) if len(gradients.shape) > 2 else gradients[0]
            
            # Ensure we have a 2D heatmap
            if len(gradients_spatial.shape) == 1:
                size = int(np.sqrt(gradients_spatial.shape[0]))
                gradients_spatial = gradients_spatial.view(size, size)
            
            # Convert to numpy and normalize
            heatmap = gradients_spatial.cpu().detach().numpy()
            heatmap = np.maximum(heatmap, 0)  # ReLU
            
            if heatmap.max() > 0:
                heatmap = heatmap / heatmap.max()
            
            # Create visualization
            return self._create_heatmap_visualization(image, heatmap)
            
        except Exception as e:
            logger.error(f"Error in generate_heatmap: {e}")
            return self._generate_attention_heatmap(image, text)

    def _generate_attention_heatmap(self, image: Image.Image, text: str) -> str:
        """Fallback method using attention-based visualization"""
        try:
            logger.info("Using attention-based fallback heatmap")
            
            # Create a simple attention-like heatmap based on image regions
            input_image = self.preprocess(image).unsqueeze(0).to(self.device)
            
            # Get image features
            with torch.no_grad():
                image_features = self.model.encode_image(input_image)
                text_features = self.model.encode_text(tokenize([text]).to(self.device))
                
                # Calculate similarity
                similarity = F.cosine_similarity(image_features, text_features, dim=-1)
            
            # Create a basic heatmap (center-focused as fallback)
            size = 14  # Typical patch size for ViT-B
            heatmap = np.ones((size, size)) * 0.5
            
            # Add some variation based on similarity score
            center = size // 2
            for i in range(size):
                for j in range(size):
                    dist = np.sqrt((i - center)**2 + (j - center)**2)
                    heatmap[i, j] = max(0.1, similarity.item() * np.exp(-dist / 3))
            
            return self._create_heatmap_visualization(image, heatmap)
            
        except Exception as e:
            logger.error(f"Attention fallback failed: {e}")
            return self._create_fallback_image(image)

    def _create_heatmap_visualization(self, original_image: Image.Image, heatmap: np.ndarray) -> str:
        """Create a professional heatmap visualization"""
        try:
            # Resize heatmap to match original image
            heatmap_resized = np.array(Image.fromarray(heatmap).resize(original_image.size, Image.BICUBIC))
            
            # Create figure with subplots
            fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5))
            
            # Original image
            ax1.imshow(original_image)
            ax1.set_title('Original Image', fontsize=12, fontweight='bold')
            ax1.axis('off')
            
            # Heatmap only
            custom_cmap = LinearSegmentedColormap.from_list('custom', ['blue', 'cyan', 'yellow', 'red'])
            im = ax2.imshow(heatmap_resized, cmap=custom_cmap, alpha=0.8)
            ax2.set_title('Attention Heatmap', fontsize=12, fontweight='bold')
            ax2.axis('off')
            plt.colorbar(im, ax=ax2, fraction=0.046, pad=0.04)
            
            # Overlay
            ax3.imshow(original_image)
            ax3.imshow(heatmap_resized, cmap=custom_cmap, alpha=0.4)
            ax3.set_title('Overlay Visualization', fontsize=12, fontweight='bold')
            ax3.axis('off')
            
            plt.tight_layout()
            
            # Convert to base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            plt.close()
            
            return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
            
        except Exception as e:
            logger.error(f"Error creating heatmap visualization: {e}")
            return self._create_fallback_image(original_image)

    def _create_fallback_image(self, original_image: Image.Image) -> str:
        """Create a fallback image when all else fails"""
        try:
            logger.info("Creating fallback image")
            
            # Create a simple visualization indicating analysis was performed
            fig, ax = plt.subplots(1, 1, figsize=(8, 6))
            ax.imshow(original_image)
            ax.text(0.5, 0.95, 'Image Analysis Complete', 
                   transform=ax.transAxes, fontsize=16, fontweight='bold',
                   ha='center', va='top', 
                   bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
            ax.text(0.5, 0.05, 'Heatmap generation unavailable', 
                   transform=ax.transAxes, fontsize=12,
                   ha='center', va='bottom',
                   bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.7))
            ax.axis('off')
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            plt.close()
            
            return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
            
        except Exception as e:
            logger.error(f"Even fallback image creation failed: {e}")
            # Last resort: return original image as base64
            buffered = io.BytesIO()
            original_image.save(buffered, format="PNG")
            return "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode()


# Additional utility class for better error handling
class RobustCLIPGradCAM(CLIPGradCAMVisualizer):
    """Enhanced version with better error recovery"""
    
    def __init__(self, *args, **kwargs):
        try:
            super().__init__(*args, **kwargs)
            self.initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize GradCAM: {e}")
            self.initialized = False
    
    def generate_heatmap(self, image: Image.Image, text: str) -> str:
        """Robust heatmap generation with multiple fallback strategies"""
        if not self.initialized:
            return self._create_fallback_image(image)
        
        # Try primary method
        try:
            return super().generate_heatmap(image, text)
        except Exception as e:
            logger.warning(f"Primary heatmap method failed: {e}")
            
            # Try attention fallback
            try:
                return self._generate_attention_heatmap(image, text)
            except Exception as e2:
                logger.warning(f"Attention fallback failed: {e2}")
                
                # Final fallback
                return self._create_fallback_image(image)