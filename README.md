# VibeCrossing 🎮

An Animal Crossing-style game built with Three.js and served with a Python Flask server.

## Features

- 🎨 Beautiful 3D world with Animal Crossing-inspired aesthetics
- 🚶 Character movement with WASD or Arrow Keys
- 🌳 Trees, flowers, and decorative elements
- 📷 Smooth camera following
- 🌞 Dynamic lighting and shadows

## Prerequisites

- Node.js (v16 or higher)
- Python 3.7 or higher
- npm or yarn

## Setup

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Development

### Run Development Server (Frontend)

```bash
npm run dev
```

This will start a Vite development server at `http://localhost:3000` with hot-reload enabled.

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

## Deployment

### Using Python Flask Server

1. First, build the frontend:
   ```bash
   npm run build
   ```

2. Then, start the Flask server:
   ```bash
   python server.py
   ```

   Or specify a custom port:
   ```bash
   PORT=8080 python server.py
   ```

The game will be available at `http://localhost:5000` (or your specified port).

## Controls

- **WASD** or **Arrow Keys**: Move your character
- **Mouse**: Look around (camera follows automatically)

## Project Structure

```
vibecrossing/
├── src/
│   ├── main.js          # Entry point
│   └── game.js          # Game engine and logic
├── index.html           # HTML template
├── styles.css           # Styling
├── server.py            # Python Flask server
├── package.json         # Node.js dependencies
├── requirements.txt     # Python dependencies
└── vite.config.js       # Vite configuration
```

## Technologies

- **Three.js**: 3D graphics and rendering
- **Vite**: Build tool and dev server
- **Flask**: Python web server for deployment

## Future Enhancements

- Inventory system
- NPCs and dialogue
- Building placement
- Day/night cycle
- Weather system
- Multiplayer support

## License

MIT
