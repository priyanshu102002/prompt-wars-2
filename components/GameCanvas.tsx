
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameStatus, ObstacleData } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
}

const LANE_WIDTH = 4;
const INITIAL_SPEED = 0.5;
const SPEED_INCREMENT = 0.0001;
const PLAYER_Z = 0;
const JUMP_FORCE = 0.2;
const GRAVITY = 0.008;

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver, onScoreUpdate }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const gameRef = useRef({
    speed: INITIAL_SPEED,
    distance: 0,
    lane: 0, // -1, 0, 1
    targetLane: 0,
    playerY: 0,
    playerVY: 0,
    obstacles: [] as THREE.Group[],
    groundTiles: [] as THREE.Mesh[],
  });

  const [currentScore, setCurrentScore] = useState(0);

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 20, 100);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 2, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffccaa, 1);
    sunLight.position.set(5, 10, 5);
    scene.add(sunLight);

    // Player
    const playerGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(1, 1.8, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcd7f32 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    playerGroup.add(body);
    
    // Simple Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 2.1;
    playerGroup.add(head);

    scene.add(playerGroup);

    // Ground Setup
    const groundGeo = new THREE.PlaneGeometry(LANE_WIDTH * 3, 50);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      roughness: 0.8,
      metalness: 0.2
    });

    const createGroundTile = (z: number) => {
      const tile = new THREE.Mesh(groundGeo, groundMat);
      tile.rotation.x = -Math.PI / 2;
      tile.position.z = z;
      scene.add(tile);
      
      // Decorative Pillars
      const pillarGeo = new THREE.BoxGeometry(0.8, 10, 0.8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      
      const p1 = new THREE.Mesh(pillarGeo, pillarMat);
      p1.position.set(-LANE_WIDTH * 2, 5, 0);
      tile.add(p1);
      
      const p2 = new THREE.Mesh(pillarGeo, pillarMat);
      p2.position.set(LANE_WIDTH * 2, 5, 0);
      tile.add(p2);

      return tile;
    };

    const tiles = [
      createGroundTile(0),
      createGroundTile(-50),
      createGroundTile(-100)
    ];
    gameRef.current.groundTiles = tiles;

    // Obstacle Management
    const obstacleGeo = new THREE.BoxGeometry(3, 1.5, 1);
    const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });

    const spawnObstacle = (z: number) => {
      const group = new THREE.Group();
      const obs = new THREE.Mesh(obstacleGeo, obstacleMat);
      const lane = Math.floor(Math.random() * 3) - 1;
      group.position.set(lane * LANE_WIDTH, 0.75, z);
      group.userData = { lane };
      group.add(obs);
      scene.add(group);
      gameRef.current.obstacles.push(group);
    };

    // Controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        gameRef.current.targetLane = Math.max(-1, gameRef.current.targetLane - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        gameRef.current.targetLane = Math.min(1, gameRef.current.targetLane + 1);
      } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && gameRef.current.playerY === 0) {
        gameRef.current.playerVY = JUMP_FORCE;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = (time - lastTime) / 16.67; // Normalize to ~60fps
      lastTime = time;

      if (status === GameStatus.PLAYING) {
        // Speed & Distance
        gameRef.current.speed += SPEED_INCREMENT * delta;
        gameRef.current.distance += gameRef.current.speed * delta;
        const score = Math.floor(gameRef.current.distance);
        setCurrentScore(score);
        onScoreUpdate(score);

        // Lane Movement
        const laneDiff = gameRef.current.targetLane * LANE_WIDTH - playerGroup.position.x;
        playerGroup.position.x += laneDiff * 0.2 * delta;

        // Jump Physics
        if (gameRef.current.playerVY !== 0 || gameRef.current.playerY > 0) {
          gameRef.current.playerY += gameRef.current.playerVY * delta;
          gameRef.current.playerVY -= GRAVITY * delta;
          if (gameRef.current.playerY <= 0) {
            gameRef.current.playerY = 0;
            gameRef.current.playerVY = 0;
          }
        }
        playerGroup.position.y = gameRef.current.playerY;

        // Environment Recycling
        tiles.forEach(tile => {
          tile.position.z += gameRef.current.speed * delta;
          if (tile.position.z > 50) {
            tile.position.z -= 150;
          }
        });

        // Obstacle Spawning & Movement
        if (Math.random() < 0.02 * delta && gameRef.current.obstacles.length < 5) {
          spawnObstacle(-100);
        }

        gameRef.current.obstacles.forEach((obs, index) => {
          obs.position.z += gameRef.current.speed * delta;
          
          // Collision Check
          const playerX = playerGroup.position.x;
          const obsX = obs.position.x;
          const distZ = Math.abs(obs.position.z - PLAYER_Z);
          const distX = Math.abs(obsX - playerX);

          if (distZ < 1.0 && distX < 1.5 && gameRef.current.playerY < 1.2) {
            onGameOver();
          }

          if (obs.position.z > 10) {
            scene.remove(obs);
            gameRef.current.obstacles.splice(index, 1);
          }
        });
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || 0;
      const h = mountRef.current?.clientHeight || 0;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [status, onGameOver, onScoreUpdate]);

  return <div ref={mountRef} className="w-full h-full cursor-none" />;
};

export default GameCanvas;
