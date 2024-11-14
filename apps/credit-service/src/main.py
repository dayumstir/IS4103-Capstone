from flask import Flask
from dotenv import load_dotenv
from routes import bp as main_routes
from models import db
import os
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    CORS(app, origins=["http://localhost:3000"]) 
    load_dotenv()
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("SQLALCHEMY_DATABASE_URI")
    db.init_app(app)
    app.register_blueprint(main_routes)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
