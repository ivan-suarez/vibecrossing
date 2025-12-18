#!/usr/bin/env python3
"""
Simple Flask server for serving the VibeCrossing game
"""
from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='dist', static_url_path='')

# Serve the built files from dist directory
@app.route('/')
def index():
    return send_from_directory('dist', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('dist', path)

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Run in production mode (set debug=False for production)
    app.run(host='0.0.0.0', port=port, debug=False)

