from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)
"""
@app.route('/')
def home():
    return "TrustFlow API is running!"
"""
@app.route('/api/upload-proof', methods=['POST'])
def upload_proof():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    # SECURITY: Get key from Vercel Environment Variables
    pinata_jwt = os.environ.get("PINATA_JWT") 
    
    if not pinata_jwt:
        return jsonify({"error": "Server Config Error: Missing Pinata Key"}), 500

    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {"Authorization": f"Bearer {pinata_jwt}"}
    files = {'file': (file.filename, file.stream, file.content_type)}

    try:
        response = requests.post(url, headers=headers, files=files)
        if response.status_code == 200:
            return jsonify({"success": True, "ipfsHash": response.json()['IpfsHash']})
        else:
            return jsonify({"error": "Pinata Upload Failed", "details": response.text}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Note: No app.run() needed for Vercel