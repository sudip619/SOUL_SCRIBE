import os
import json
from flask import Flask, request, jsonify, g, Response
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import jwt
from groq import Groq # <-- IMPORT GROQ

# --- Load environment variables ---
load_dotenv()

app = Flask(__name__)

# --- Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# --- Initialize extensions ---
db = SQLAlchemy(app)
CORS(app)  # Enable CORS globally


# --- Initialize Groq Client ---
try:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is missing in environment variables.")
    groq = Groq(api_key=groq_api_key)
except ValueError as e:
    print(f"CRITICAL ERROR initializing Groq client: {e}")
    groq = None


# --- Database Models ---
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True)  # Supabase UUID
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=True)
    profile_data = db.Column(db.Text, default='{}')
    date_joined = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class MoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    mood_name = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('mood_logs', lazy=True))

# --- Authentication & Preflight Handling ---
@app.before_request
def before_request_func():
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
        return Response(status=204, headers=headers)


    # Handle authentication (non-OPTIONS requests only)
    g.current_user = None
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return


    # For API routes, handle authentication
    if request.path.startswith('/api/'):
        g.current_user = None
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return

        try:
            token_type, token_value = auth_header.split(' ', 1)
            if token_type.lower() != 'bearer':
                return

            jwt_secret = os.getenv('SUPABASE_JWT_SECRET')
            if not jwt_secret:
                print("CRITICAL ERROR: SUPABASE_JWT_SECRET is not set on the server!")
                return


        # Fetch or create user
        user = db.session.get(User, user_id)
        if not user:
            print(f"First-time API call from Supabase user {user_id}. Creating local profile.")
            user = User(id=user_id, username=f"user_{user_id[:8]}")
            db.session.add(user)
            db.session.commit()

        g.current_user = user

            payload = jwt.decode(token_value, jwt_secret, algorithms=["HS256"])
            user_id = payload.get('sub')
            if not user_id:
                return


            # Fetch or create user
            user = db.session.get(User, user_id)
            if not user:
                print(f"First-time API call from Supabase user {user_id}. Creating local profile.")
                user = User(id=user_id, username=f"user_{user_id[:8]}")
                db.session.add(user)
                db.session.commit()



            g.current_user = user

        except Exception as e:
            print(f"JWT Authentication Error: {e}")


# --- API Endpoints ---
@app.route('/api/profile', methods=['GET'])
def get_user_profile():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401
    try:
        profile_data = json.loads(g.current_user.profile_data)
    except (json.JSONDecodeError, TypeError):
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
    if new_profile_data is None:
        return jsonify({'message': 'Invalid data.'}), 400
    g.current_user.profile_data = json.dumps(new_profile_data)
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully!', 'profile_data': new_profile_data}), 200

@app.route('/api/mood', methods=['POST'])
def log_mood():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401
    data = request.get_json()
    mood = data.get('mood')
    if not mood:
        return jsonify({'message': 'Mood data is required.'}), 400
    
    new_mood_log = MoodLog(user_id=g.current_user.id, mood_name=mood)
    db.session.add(new_mood_log)
    db.session.commit()
    return jsonify({'message': 'Mood logged successfully!'}), 201

@app.route('/api/mood/history', methods=['GET'])
def get_mood_history():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401
    mood_logs = MoodLog.query.filter_by(user_id=g.current_user.id).order_by(MoodLog.timestamp.asc()).all()
    history_data = [{'mood_name': log.mood_name, 'timestamp': log.timestamp.isoformat()} for log in mood_logs]
    return jsonify(history_data), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    if not g.current_user:
        return jsonify({'message': 'Authentication required.'}), 401
    
    if not groq:
        return jsonify({"error": "Groq AI client is not configured on the server."}), 500

    data = request.get_json()
    user_message = data.get('message')
    current_mood = data.get('mood')

    if not user_message or not current_mood:
        return jsonify({'message': 'Message and mood are required.'}), 400
    

    # Placeholder for AI API call (Groq, DeepSeek, OpenAI, etc.)
    bot_reply = f"The AI received your message: '{user_message_content}'"
    return jsonify({'reply': bot_reply}), 200

    try:
        # --- Build the context for the AI ---
        # 1. Get profile data
        try:
            profile_data = json.loads(g.current_user.profile_data)
        except (json.JSONDecodeError, TypeError):
            profile_data = {}
        coping_mechanism = profile_data.get('coping_mechanism', 'Not specified')

        # 2. Get recent moods
        recent_moods = MoodLog.query.filter_by(user_id=g.current_user.id).order_by(MoodLog.timestamp.desc()).limit(5).all()
        mood_summary = ', '.join([log.mood_name for log in recent_moods]) or 'No recent moods'

        # 3. Create the system prompt
        system_prompt = f"You are SoulScribe, an empathetic AI companion. The user is currently feeling '{current_mood}'. Their preferred coping mechanism is '{coping_mechanism}'. Their recent moods are: {mood_summary}. Tailor your response to be supportive and relevant."

        # --- Call the Groq API ---
        chat_completion = groq.chat.completions.create(
            model='llama3-8b-8192',
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )

        reply = chat_completion.choices[0].message.content
        return jsonify({'reply': reply}), 200

    except Exception as e:
        print(f"Error in /api/chat: {e}")
        return jsonify({'error': 'An internal error occurred.'}), 500


# --- Server Start ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
