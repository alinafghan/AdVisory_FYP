from .flux_routes import flux_bp
from .gpt_image_routes import gpt_bp
from .caption_routes import caption_bp
from .budget_routes import budget_bp
from .scrape_routes import scrape_bp
from .remove_bg_routes import remove_bg_bp
from .edit_image_routes import edit_image_bp

def register_blueprints(app):
    app.register_blueprint(flux_bp)
    app.register_blueprint(gpt_bp)
    app.register_blueprint(caption_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(scrape_bp)
    app.register_blueprint(remove_bg_bp)
    app.register_blueprint(edit_image_bp)
