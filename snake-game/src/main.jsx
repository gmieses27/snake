import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];

const getRandomFood = (snake) => {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
    };
    // Make sure food doesn't spawn on the snake
    // eslint-disable-next-line no-loop-func
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  return newFood;
};

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState('RIGHT');
  const [speed, setSpeed] = useState(180); // <-- Add this line

  // Helper to restart the game
  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(getRandomFood(INITIAL_SNAKE));
    setDirection('RIGHT');
  };

  // Game loop
  useEffect(() => {
    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
          case 'SHIFT': gameInterval = setInterval(moveSnake, 250); break;
          default: return prevSnake; // No movement if direction is invalid
        }

        // Check wall collision
        if (
          head.x < 0 ||
          head.x >= CANVAS_SIZE / GRID_SIZE ||
          head.y < 0 ||
          head.y >= CANVAS_SIZE / GRID_SIZE
        ) {
          restartGame();
          return INITIAL_SNAKE;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          restartGame();
          return INITIAL_SNAKE;
        }

        // Check if food is eaten
        let newSnake;
        if (head.x === food.x && head.y === food.y) {
          newSnake = [head, ...prevSnake];
          setFood(getRandomFood(newSnake));
        } else {
          newSnake = [head, ...prevSnake.slice(0, -1)];
        }
        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, speed); // <-- Use speed here
    return () => clearInterval(gameInterval);
  }, [direction, food, speed]); // <-- Add speed to dependencies

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = 'green';
    snake.forEach(segment => ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE));

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  }, [snake, food]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case 'Shift':
          setSpeed(80); // Speed up when Shift is pressed
          break;
        default: break;
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setSpeed(180); // Restore speed when Shift is released
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [direction]);

  return <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />;
};

export default SnakeGame;