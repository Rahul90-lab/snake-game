class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();
        this.cellSize = 20;
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.difficultyLevels = {
            easy: 150,
            medium: 100,
            hard: 70
        };
        this.currentDifficulty = 'medium';
        this.setupEventListeners();
        this.initializeGame();
    }

    setCanvasSize() {
        const size = Math.min(window.innerWidth - 40, 600);
        this.canvas.width = size;
        this.canvas.height = size;
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            if (this.gameLoop) this.startGame();
        });
        window.addEventListener('resize', () => {
            this.setCanvasSize();
            this.draw();
        });
    }

    initializeGame() {
        this.snake = [
            { x: 6, y: 6 },
            { x: 5, y: 6 },
            { x: 4, y: 6 }
        ];
        this.direction = 'right';
        this.score = 0;
        this.updateScore();
        this.generateFood();
        this.draw();
    }

    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.initializeGame();
        this.gameLoop = setInterval(() => this.gameStep(), 
            this.difficultyLevels[this.currentDifficulty]);
        document.getElementById('startBtn').textContent = 'Restart';
        document.getElementById('gameOver').classList.add('hidden');
    }

    restartGame() {
        document.getElementById('gameOver').classList.add('hidden');
        this.startGame();
    }

    handleKeyPress(event) {
        const keyDirections = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };

        const newDirection = keyDirections[event.key];
        if (!newDirection) return;

        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.direction = newDirection;
        }
    }

    generateFood() {
        const gridSize = Math.floor(this.canvas.width / this.cellSize);
        do {
            this.food = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };
        } while (this.snake.some(segment => 
            segment.x === this.food.x && segment.y === this.food.y));
    }

    gameStep() {
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        const gridSize = Math.floor(this.canvas.width / this.cellSize);
        if (head.x < 0 || head.x >= gridSize || 
            head.y < 0 || head.y >= gridSize || 
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#388E3C';
            this.ctx.fillRect(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = '#FF5252';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.cellSize + this.cellSize/2,
            this.food.y * this.cellSize + this.cellSize/2,
            this.cellSize/2 - 1,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Draw grid (optional)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.canvas.width; i += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('startBtn').textContent = 'Start Game';
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    new SnakeGame();
});