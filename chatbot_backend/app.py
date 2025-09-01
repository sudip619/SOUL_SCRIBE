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
from flask import jsonify
# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:1234@localhost/mental_health_chatbot_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- CORS Configuration ---
CORS(app)

# --- Secret Key ---
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_fallback_secret_key_if_env_not_set')


# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    # MODIFIED: Renamed 'preferences' to 'profile_data' for clarity
    # This will store things like coping mechanisms, goals, etc.
    profile_data = db.Column(db.Text, default='{}')
    last_session_summary = db.Column(db.Text, default='{}')
    date_joined = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class MoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    mood_name = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('mood_logs', lazy=True))

    def __repr__(self):
        return f'<MoodLog {self.mood_name} by User {self.user_id} at {self.timestamp}>'


# --- Helper function for Authorization ---
def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    try:
        token_type, token_value = auth_header.split(' ', 1)
        if token_type.lower() != 'bearer' or not token_value.startswith('dummy_token_user_id_'):
            return None
        user_id = int(token_value.replace('dummy_token_user_id_', ''))
        #return User.query.get(user_id)
        # NEW LINE
        return db.session.get(User, user_id)
    except (ValueError, IndexError):
        return None

@app.before_request
def before_request_func():
    g.current_user = get_current_user()


# --- API Endpoints ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    new_user = User(username=username)
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Registration failed due to server error.'}), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid username or password'}), 401

    dummy_token = f"dummy_token_user_id_{user.id}"
    return jsonify({
        'message': 'Login successful!',
        'token': dummy_token,
        'username': user.username,
        'user_id': user.id
    }), 200


@app.route('/api/profile', methods=['GET'])
def get_user_profile():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401
    try:
        profile_data = json.loads(g.current_user.profile_data)
    except json.JSONDecodeError:
        profile_data = {}
    return jsonify({
        'username': g.current_user.username,
        'profile_data': profile_data,
        'date_joined': g.current_user.date_joined.isoformat()
    }), 200


@app.route('/api/profile', methods=['POST'])
def update_user_profile():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401

    data = request.get_json()
    new_profile_data = data.get('profile_data')

    if new_profile_data is None or not isinstance(new_profile_data, dict):
        return jsonify({'message': 'Invalid profile data. Expected a dictionary.'}), 400

    try:
        current_profile_data = json.loads(g.current_user.profile_data)
    except json.JSONDecodeError:
        current_profile_data = {}

    current_profile_data.update(new_profile_data)
    g.current_user.profile_data = json.dumps(current_profile_data)
    
    try:
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully!', 'profile_data': current_profile_data}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update profile due to server error.'}), 500


@app.route('/api/mood', methods=['POST'])
def log_mood():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401

    data = request.get_json()
    mood = data.get('mood')

    if not mood:
        return jsonify({'message': 'Mood data is required.'}), 400

    allowed_moods = ["happy", "calm", "energized", "neutral", "anxious", "sad", "frustrated", "overwhelmed", "angry", "tired"]
    if mood not in allowed_moods:
        return jsonify({'message': 'Invalid mood value provided.'}), 400

    new_mood_log = MoodLog(user_id=g.current_user.id, mood_name=mood)

    try:
        db.session.add(new_mood_log)
        db.session.commit()
        return jsonify({'message': 'Mood logged successfully!', 'mood': mood}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to log mood due to server error.'}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401

    data = request.get_json()
    user_message_content = data.get('message')

    if not user_message_content:
        return jsonify({'message': 'Message content is required.'}), 400

    DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
    if not DEEPSEEK_API_KEY:
        return jsonify({'message': 'DeepSeek API key not configured on server.'}), 500

    # --- NEW: Context Gathering ---
    try:
        # 1. Fetch user's profile data (coping mechanisms, etc.)
        profile_data = json.loads(g.current_user.profile_data)
        coping_mechanism = profile_data.get('coping_mechanism', 'Not specified')

        # 2. Fetch user's recent mood history
        recent_moods = MoodLog.query.filter_by(user_id=g.current_user.id).order_by(MoodLog.timestamp.desc()).limit(5).all()
        mood_summary = ", ".join([log.mood_name for log in recent_moods]) if recent_moods else "No recent moods logged"

    except (json.JSONDecodeError, Exception) as e:
        print(f"Could not load context for user {g.current_user.id}: {e}")
        coping_mechanism = "Not specified"
        mood_summary = "Could not retrieve"

    # --- NEW: Constructing the System Prompt ---
    system_prompt_content = f"""
    You are SoulScribe — a compassionate and attentive AI mental wellness companion.
    When speaking with the user, keep your tone gentle, encouraging, and non-judgmental.
    You know these details about them:

    Their go-to coping strategy is {coping_mechanism}.

    Their recent mood journey (from latest to earliest) is: {mood_summary}.

    Use this information to tailor your responses, validate their feelings, and suggest support in a way that aligns    with their preferred coping style and current emotional state.
    """

    # --- MODIFIED: API Payload with System Context ---
    messages = [
        {"role": "system", "content": system_prompt_content},
        {"role": "user", "content": user_message_content}
    ]

    DEEPSEEK_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
            'HTTP-Referer': 'http://127.0.0.1:3000', # Replace with your actual frontend URL in production
            'X-Title': 'SoulScribe' # Your app's name
        }

        payload = {
            "model": "deepseek/deepseek-r1:free", # Or your preferred model
            "messages": messages
        }

        response = requests.post(DEEPSEEK_ENDPOINT, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        deepseek_data = response.json()
        bot_reply = deepseek_data.get('choices')[0].get('message').get('content')

        return jsonify({'message': 'AI response received!', 'reply': bot_reply}), 200

    except requests.exceptions.RequestException as e:
        print(f"Error calling AI API: {e}")
        return jsonify({'message': 'Failed to get response from AI. Network or API error.'}), 500
    except Exception as e:
        print(f"Unexpected error processing AI response: {e}")
        return jsonify({'message': 'Failed to process AI response.'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Backend is running!'}), 200


@app.route('/api/mood/history', methods=['GET'])
def get_mood_history():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401

    mood_logs = MoodLog.query.filter_by(user_id=g.current_user.id).order_by(MoodLog.timestamp.asc()).all()
    history_data = [{'mood_name': log.mood_name, 'timestamp': log.timestamp.isoformat()} for log in mood_logs]
    
    return jsonify(history_data), 200

