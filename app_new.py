"""
Main application file for Code with Morais
A gamified Python learning platform for teenagers
"""
import os
from flask import Flask, request, jsonify
from config import SECRET_KEY

# Initialize Flask app
app = Flask(__name__)
app.secret_key = SECRET_KEY

# Register blueprints
from routes.main_routes import main_bp
from routes.lesson_routes import lesson_bp

app.register_blueprint(main_bp)
app.register_blueprint(lesson_bp)

# Register API route for code execution
from services.code_execution import execute_python_code

@app.route('/run_python', methods=['POST'])
def run_python():
    """Run Python code submitted by the user"""
    data = request.json
    code = data.get('code', '')
    inputs = data.get('inputs', '')
    
    # Execute the code
    result = execute_python_code(code, inputs)
    
    return jsonify(result)

# Main entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
