import * as THREE from 'three';
import { Game } from './game.js';

// Initialize the game
const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
game.init();
game.animate();

