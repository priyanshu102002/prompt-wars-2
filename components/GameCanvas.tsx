
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GameStatus } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: () => void;
  onScoreUpdate: (score: number, coins: number) => void;
  event?: 'quake' | 'storm' | 'eclipse';
}

const LANE_WIDTH = 4;
const INITIAL_SPEED = 0.7;
const SPEED_MAX = 3.0;
const SPEED_INCREMENT = 0.0002;
const PLAYER_Z = 5;

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver, onScoreUpdate, event }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const gameRef = useRef({
    speed: INITIAL_SPEED,
    distance: 0,
    coins: 0,
    targetLane: 0,
    playerY: 0,
    playerVY: 0,
    obstacles: [] as THREE.Group[],
    coins_objects: [] as THREE.Mesh[],
    groundTiles: [] as THREE.Group[],
    shake: 0,
  });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);
    scene.fog = new THREE.FogExp2(0x020202, 0.012);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 2, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xff7700, 1);
    sun.position.set(10, 20, 10);
    scene.add(sun);

    // Player (Cyber-Adventurer)
    const playerGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x005555 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.5), bodyMat);
    body.position.y = 0.7;
    playerGroup.add(body);
    playerGroup.position.z = PLAYER_Z;
    scene.add(playerGroup);

    // Ground Construction
    const groundGeo = new THREE.PlaneGeometry(LANE_WIDTH * 3, 50);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 });
    
    const createTile = (z: number) => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(groundGeo, groundMat);
      m.rotation.x = -Math.PI / 2;
      g.add(m);
      
      // Neon Rails
      [-1.5, -0.5, 0.5, 1.5].forEach(i => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 50), new THREE.MeshBasicMaterial({ color: 0x333333 }));
        rail.position.set(i * LANE_WIDTH, 0.05, 0);
        g.add(rail);
      });

      g.position.z = z;
      scene.add(g);
      return g;
    };

    const tiles = [createTile(0), createTile(-50), createTile(-100)];
    gameRef.current.groundTiles = tiles;

    // Obstacle logic
    const spawnObstacle = (z: number) => {
      const lane = Math.floor(Math.random() * 3) - 1;
      const obs = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 0.5), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
      obs.position.set(lane * LANE_WIDTH, 0.5, z);
      scene.add(obs);
      gameRef.current.obstacles.push(obs as unknown as THREE.Group);
    };

    // Controls
    const handleKey = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') gameRef.current.targetLane = Math.max(-1, gameRef.current.targetLane - 1);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') gameRef.current.targetLane = Math.min(1, gameRef.current.targetLane + 1);
      if ((e.code === 'Space' || e.code === 'ArrowUp') && gameRef.current.playerY === 0) gameRef.current.playerVY = 0.22;
    };
    window.addEventListener('keydown', handleKey);

    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;

      if (status === GameStatus.PLAYING) {
        const g = gameRef.current;
        g.speed = Math.min(SPEED_MAX, g.speed + SPEED_INCREMENT * delta);
        g.distance += g.speed * delta;
        onScoreUpdate(Math.floor(g.distance), g.coins);

        // Quake Event Effect
        if (event === 'quake') {
          g.shake = Math.sin(time * 0.05) * 0.1;
          camera.position.x = g.shake;
          camera.position.y = 5 + g.shake;
        } else {
          camera.position.x *= 0.9;
        }

        // Movements
        playerGroup.position.x += (g.targetLane * LANE_WIDTH - playerGroup.position.x) * 0.2 * delta;
        if (g.playerY > 0 || g.playerVY !== 0) {
          g.playerY += g.playerVY * delta;
          g.playerVY -= 0.01 * delta;
          if (g.playerY <= 0) { g.playerY = 0; g.playerVY = 0; }
        }
        playerGroup.position.y = g.playerY;

        // Scenery Recycling
        tiles.forEach(t => {
          t.position.z += g.speed * delta;
          if (t.position.z > 50) t.position.z -= 150;
        });

        // Obstacles
        if (Math.random() < 0.02 * delta) spawnObstacle(-100);
        g.obstacles.forEach((o, i) => {
          o.position.z += g.speed * delta;
          const dz = Math.abs(o.position.z - PLAYER_Z);
          const dx = Math.abs(o.position.x - playerGroup.position.x);
          if (dz < 0.8 && dx < 1.5 && g.playerY < 1) onGameOver();
          if (o.position.z > 20) { scene.remove(o); g.obstacles.splice(i, 1); }
        });
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('keydown', handleKey);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [status, event, onGameOver, onScoreUpdate]);

  return <div ref={mountRef} className="w-full h-full touch-none" />;
};

export default GameCanvas;
