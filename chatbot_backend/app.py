import os
import json
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import requests
import time
import jwt # NEW: Import the PyJWT library

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- MODIFIED: More robust CORS Configuration for production ---
CORS(app)

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:1234@localhost/mental_health_chatbot_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Secret Key ---
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


# --- MODIFIED Database Models for Supabase Compatibility ---
class User(db.Model):
    # Supabase uses UUIDs (strings) for user IDs, not auto-incrementing integers.
    id = db.Column(db.String(36), primary_key=True) 
    username = db.Column(db.String(80), unique=True, nullable=False)
    # Password is now handled by Supabase, so we don't need password_hash here.
    profile_data = db.Column(db.Text, default='{}')
    last_session_summary = db.Column(db.Text, default='{}')
    date_joined = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class MoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # The user_id must also be a string to match the User.id
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    mood_name = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('mood_logs', lazy=True))


# --- NEW: Supabase JWT Authentication Helper ---
def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        token_type, token_value = auth_header.split(' ', 1)
        if token_type.lower() != 'bearer':
            return None

        # Get the secret key from your Render environment variables
        jwt_secret = os.getenv('SUPABASE_JWT_SECRET')
        if not jwt_secret:
            print("CRITICAL ERROR: SUPABASE_JWT_SECRET is not set on the server!")
            return None

        # Decode the token from Supabase
        payload = jwt.decode(token_value, jwt_secret, algorithms=["HS256"])
        
        # 'sub' is the standard field for the user ID in a JWT
        user_id = payload.get('sub')
        if not user_id:
            return None
        
        # Find the user in our database.
        user = db.session.get(User, user_id)
        
        # If the user exists in Supabase but not in our DB, create a profile for them.
        if not user:
            print(f"First-time API call from Supabase user {user_id}. Creating local profile.")
            # Note: We can't get the username from the basic token.
            # A more advanced setup would have the frontend send the username once after registration.
            user = User(id=user_id, username=f"user_{user_id[:8]}")
            db.session.add(user)
            db.session.commit()

        return user

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError, IndexError) as e:
        print(f"JWT Authentication Error: {e}")
        return None

@app.before_request
def before_request_func():
    g.current_user = get_current_user()


# --- API Endpoints ---
# Your old /api/register and /api/login endpoints are no longer needed,
# as Supabase handles this. Your other endpoints will now work correctly
# with the new get_current_user function.

# (Your endpoints for /api/profile, /api/mood, /api/chat, etc., can remain here)
# ...

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)