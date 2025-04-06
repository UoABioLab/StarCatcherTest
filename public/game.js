class Game {
    constructor(gameContainer) {
        // console.log("Game 类已实例化");
        this.gameContainer = gameContainer;
        this.gameArea = gameContainer.querySelector('#game-area');
        this.gameArea.style.position = 'relative';
        this.gameArea.style.width = '100%';
        this.gameArea.style.height = '100%';
        this.gameArea.style.overflow = 'hidden';
        this.width = this.gameArea.clientWidth;
        this.height = this.gameArea.clientHeight;
        
        // 移除背景相关代码
        // this.background = new Background(this.gameArea, 'Assets/avatar/matariki.jpg');
        
        this.state = 'menu';
        this.score = 0;
        this.lives = 3; // 设置生命值为3
        this.timeLeft = 60; // 设置游戏时间为60秒
        this.countdownTime = 5;
        this.countdownTimer = null;
        this.countdownStartTime = null;
        this.isCountingDown = false;

        // 绑定方法到实例
        this.updateGame = this.updateGame.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.objects = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 1000; // 每秒成一个对象
        this.playerPosition = this.width / 2;

        // 添加鼠标事件监听器
        this.gameArea.addEventListener('click', this.handleClick);

        this.difficulty = 1;

        // 在 constructor 中
        this.starSound = document.getElementById('starSound');
        this.balloonSound = document.getElementById('balloonSound');
        this.catchSound = document.getElementById('catchSound');

        this.videoElement = document.getElementById('input-video');
        this.poseCanvas = document.getElementById('pose-canvas');
        this.poseCanvas.width = this.width;
        this.poseCanvas.height = this.height;

        // 检查可用的摄像头
        this.checkAvailableCameras().then(devices => {
            if (devices.length > 0) {
                this.startCamera(devices[0].deviceId);
            } else {
                console.error("No cameras found");
                this.handleCameraError(new Error("No cameras found"));
            }
        }).catch(error => {
            console.error("Error checking cameras:", error);
            this.handleCameraError(error);
        });

        // 添加这些行来检查 pose-container 的位置
        const poseContainer = document.getElementById('pose-container');
        console.log('Pose container position:', poseContainer.getBoundingClientRect());
        console.log('Pose container style:', window.getComputedStyle(poseContainer));

        this.difficultyScreen = new DifficultyScreen(this);

        this.playerNormalImage = new Image();
        this.playerNormalImage.src = 'public/Assets/avatar/old_man.png';
        this.playerNormalImage.onload = () => {
            console.log("Normal player image loaded");
            
        };
        this.playerNormalImage.onerror = () => console.error("Failed to load normal player image");

        this.playerArmUpImage = new Image();
        this.playerArmUpImage.src = 'public/Assets/avatar/arm_up.png';
        this.playerArmUpImage.onload = () => {
            console.log("Arm up player image loaded");
            
        };
        this.playerArmUpImage.onerror = () => console.error("Failed to load arm up player image");

        this.isPlayerRaisingArms = false;

        this.menu = new Menu(this);
        this.state = 'menu';
        this.menu.draw(); // 初始显示菜单
        
        // 开始游戏循环
        this.updateGame();

        this.gameTime = 0;

        // 初始化音效
        this.catchSound = new Audio('public/Assets/sound/kaching.ogg');

        this.landmarkData = [];
        this.userId = null;
        this.isCollectingData = false;
        this.lastDataCollectionTime = 0;
        this.dataCollectionInterval = 1000 / 30; // 每30帧数据

        // 添加新的音效
        this.slapSound = new Audio('public/Assets/sound/slap.ogg');
        this.screamingSound = new Audio('public/Assets/sound/screaming.ogg');
        this.gameplayMusic = new Audio('public/Assets/sound/Komiku_-_12_-_Bicycle.ogg');
        this.menuMusic = new Audio('public/ssets/sound/music.ogg');

        this.poseDetection = null; // 添加这行

        this.isMovingLeft = false; // 初始化移动方向
    }

    async checkAvailableCameras() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'videoinput');
    }

    startCamera(deviceId) {
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                deviceId: deviceId,
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            } 
        }).then(stream => {
            this.videoElement.srcObject = stream;
            this.videoElement.onloadedmetadata = () => {
                this.videoElement.play();
                console.log("Video is playing");
                
                // 视频流设置好后，初始化姿势检测
                this.poseDetection = new PoseDetection(this.videoElement, this.poseCanvas, this.onPoseDetected.bind(this));
                this.poseDetection.start().catch(error => {
                    console.error("Failed to start pose detection:", error);
                });
            };
        }).catch(error => {
            console.error("Error accessing camera:", error);
            this.handleCameraError(error);
        });
    }

    useFallbackControl() {
        console.log("Using fallback mouse control");
        // 这里可以添加使用鼠标控制的逻辑
        this.gameArea.addEventListener('mousemove', (event) => {
            const rect = this.gameArea.getBoundingClientRect();
            const x = event.clientX - rect.left;
            this.updatePlayerPosition(x);
        });
    }

    start() {
        console.log("Game.start() called");
        this.state = 'difficulty';
        this.difficultyScreen.draw();
    }

    updateGame() {
        // console.log("Current game state:", this.state);
        switch (this.state) {
            case 'menu':
                // 菜单状态下不需要更新，保持静态
                break;
            case 'difficulty':
                // 难度选择界面由 DifficultyScreen 类处理
                break;
            case 'countdown':
                // 倒计时现在由 updateCountdown 方法处理
                break;
            case 'playing':
                this.updatePlaying();
                break;
            case 'gameover':
                // 游戏结束状态保持静态
                break;
        }

        requestAnimationFrame(this.updateGame.bind(this));
    }

    drawMenu() {
        const menuElement = document.createElement('div');
        menuElement.id = 'menu';
        menuElement.innerHTML = `
            <h2>姿势识别游戏</h2>
            <button id="start-button">开始游戏</button>
        `;
        this.gameArea.appendChild(menuElement);
    }

    updatePlaying() {
        this.gameTime += 1/60; // 假设60FPS
        this.timeLeft = Math.max(0, 60 - this.gameTime);

        // 生成新的对象
        const settings = difficulty_map[this.difficulty];
        const spawnInterval = settings.STAR_SPAWN_TIME * 1000; // 添加这行，转换为毫秒
        
        if (Date.now() - this.lastSpawnTime > spawnInterval) { // 使用新的间隔
            this.spawnObject();
            this.lastSpawnTime = Date.now();
        }

        // 更新和绘制所有对象
        this.objects = this.objects.filter(obj => {
            obj.update();
            if (obj instanceof Balloon && obj.rect.y + obj.rect.height >= this.height && !obj.isBurst) {
                obj.burst();
                this.lives--;
                this.slapSound.play();
                this.enlargePlayer();
                if (this.lives <= 0) {
                    this.screamingSound.play();
                }
            }
            if (obj.shouldRemove()) {
                return false;
            }
            this.drawObject(obj);
            return true;
        });

        // 移除超出屏幕的对象
        this.objects = this.objects.filter(obj => !obj.shouldRemove());

        // 检查碰撞
        this.checkCollisions();

        // 清除并重新绘制所有游戏元素
        this.clearGameObjects();
        this.objects.forEach(obj => this.drawObject(obj));
        this.drawPlayer();
        this.drawHUD();

        // 更新难度
        // this.updateDifficulty();

        // 检查游戏是否结束
        if (this.timeLeft <= 0 || this.lives <= 0) {
            this.endGame();
        }

        // 更新玩家图像
        this.updatePlayerImage();

        // 收集姿势数据
        if (this.isCollectingData && Date.now() - this.lastDataCollectionTime >= this.dataCollectionInterval) {
            this.collectPoseData();
            this.lastDataCollectionTime = Date.now();
        }
    }

    spawnObject() {
        const settings = difficulty_map[this.difficulty];
        if (!settings) {
            console.error(`Invalid difficulty setting: ${this.difficulty}`);
            this.difficulty = 'medium';
            settings = difficulty_map['medium'];
        }

        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime < settings.STAR_SPAWN_TIME * 1000) {
            return;
        }

        const isStar = Math.random() < 0.5; // 50%的概率生成星星
        
        // 计算生成范围
        const centerX = this.width / 2;
        // 使用 POSITION_FACTOR 来计算实际的生成范围
        const spawnWidth = this.width / settings.POSITION_FACTOR; // 范围会随难度变化
        
        // 计算生成范围的左右边界
        const minX = centerX - (spawnWidth / 2);
        const maxX = centerX + (spawnWidth / 2);
        
        // 在计算出的范围内随机生成位置
        const x = minX + Math.random() * spawnWidth;
        
        const object = isStar ? 
            new Star(x, -40, this.height, this.difficulty) : 
            new Balloon(x, -40, this.height, this.difficulty);
        
        this.objects.push(object);
        this.lastSpawnTime = currentTime;

        console.log(`Spawning object at x: ${x}, range: ${minX} to ${maxX}, difficulty: ${this.difficulty}`);
    }

    drawObject(obj) {
        // 检查是否已存在该对象的元素
        let element = document.querySelector(`[data-id="${obj.id}"]`);
        
        if (!element) {
            // 如果元素不存在，创建新元素
            element = document.createElement('div');
            element.className = obj instanceof Star ? 'star' : 'balloon';
            element.style.position = 'absolute';
            element.dataset.id = obj.id;
            
            // 如果是气球且已爆炸，添加爆炸类
            if (obj instanceof Balloon && obj.isBurst) {
                element.classList.add('burst');
            }
            
            this.gameArea.appendChild(element);
        }

        // 更新元素的位置和大小
        element.style.left = `${obj.rect.x}px`;
        element.style.top = `${obj.rect.y}px`;
        element.style.width = `${obj.rect.width}px`;
        element.style.height = `${obj.rect.height}px`;

        // 如果是气球，检查是否需要更新爆炸状态
        if (obj instanceof Balloon) {
            if (obj.isBurst) {
                element.classList.add('burst');
            } else {
                element.classList.remove('burst');
            }
        }
    }

    checkCollisions() {
        if (!this.isPlayerRaisingArms) return;

        const playerRect = {
            left: this.playerPosition - 75,
            right: this.playerPosition + 75,
            top: this.height - 225,
            bottom: this.height
        };

        this.objects = this.objects.filter(obj => {
            if (this.isColliding(playerRect, obj.getRect())) {
                if (obj instanceof Star) {
                    this.score += 5;
                } else if (obj instanceof Balloon) {
                    this.score += 10;
                }
                // 播放抓取音效
                if (this.catchSound) {
                    this.catchSound.currentTime = 0; // 重置音频到开始
                    this.catchSound.play().catch(e => console.log("Error playing catch sound:", e));
                }
                // 移除碰撞的对象
                const element = document.querySelector(`[data-id="${obj.id}"]`);
                if (element) element.remove();
                return false;
            }
            return true;
        });
    }

    isColliding(rect1, rect2) {
        return rect1.left < rect2.right &&
               rect1.right > rect2.left &&
               rect1.top < rect2.bottom &&
               rect1.bottom > rect2.top;
    }

    drawPlayer() {
        const playerElement = document.createElement('div');
        playerElement.id = 'player';
        playerElement.style.position = 'absolute';
        playerElement.style.left = `${this.playerPosition}px`;
        playerElement.style.bottom = '0px';
        playerElement.style.width = '150px'; 
        playerElement.style.height = '225px'; 
        playerElement.style.transform = 'translate(-50%, 0) scaleX(-1)';
        
        const playerImage = document.createElement('img');
        playerImage.src = this.isPlayerRaisingArms ? this.playerArmUpImage.src : this.playerNormalImage.src;
        playerImage.style.width = '100%';
        playerImage.style.height = '100%';
        playerImage.style.objectFit = 'contain';

        playerElement.appendChild(playerImage);
        this.gameArea.appendChild(playerElement);
    }

    updatePlayerPosition(x) {
        // 限制玩家移动范围
        const minX = 50;  // 左边界
        const maxX = this.width - 50;  // 右边界
        this.playerPosition = Math.min(Math.max(x, minX), maxX);
    }

    drawGameOver() {
        this.clearGameObjects();
        const gameOverElement = document.createElement('div');
        gameOverElement.id = 'game-over';
        gameOverElement.style.position = 'absolute';
        gameOverElement.style.top = '50%';
        gameOverElement.style.left = '50%';
        gameOverElement.style.transform = 'translate(-50%, -50%)';
        gameOverElement.style.textAlign = 'center';
        gameOverElement.style.color = 'white';
        gameOverElement.style.fontSize = '24px';
        gameOverElement.style.zIndex = '1000';

        const scoreText = document.createElement('h2');
        scoreText.textContent = `Your Score: ${this.score}`;
        scoreText.style.color = 'yellow';
        gameOverElement.appendChild(scoreText);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '20px';

        const buttonStyle = `
            font-size: 24px;
            padding: 10px 20px;
            margin: 10px;
            cursor: pointer;
            background-color: #4CAF50;
            color: yellow;
            border: none;
            border-radius: 5px;
        `;

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.style.cssText = buttonStyle;
        restartButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startGame();
        });

        const quitButton = document.createElement('button');
        quitButton.textContent = 'Quit';
        quitButton.style.cssText = buttonStyle;
        quitButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.state = 'menu';
            this.menu.draw();
        });

        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(quitButton);
        gameOverElement.appendChild(buttonContainer);

        this.gameArea.appendChild(gameOverElement);
    }

    handleClick(event) {
        if (this.state !== 'menu') {
            const rect = this.gameArea.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (this.state === 'difficulty') {
                // 处理难度选择界面的点击
                const result = this.difficultyScreen.handleClick(x, y);
                if (result) {
                    if (result.action === 'back') {
                        this.state = 'menu';
                        this.menu.draw();
                    } else if (result.action === 'submit') {
                        this.startGame(result.difficulty);
                    }
                }
            }
        }
    }

    handleMouseMove(event) {
        if (this.state === 'playing') {
            const rect = this.gameArea.getBoundingClientRect();
            const x = event.clientX - rect.left;
            this.updatePlayerPosition(x);
        }
    }

    initializePoseDetection() {
        if (!this.poseDetection) {
            this.poseDetection = new PoseDetection(
                this.videoElement,
                this.poseCanvas,
                this.onPoseDetected.bind(this)
            );
        }
        this.poseDetection.start().then(() => {
            console.log("Pose detection started successfully");
            // 显示姿势检测画布
            this.showPoseCanvas();
        }).catch(error => {
            console.error("Failed to start pose detection:", error);
            this.handleCameraError(error);
        });
    }

    showPoseCanvas() {
        const poseContainer = document.getElementById('pose-container');
        if (poseContainer) {
            poseContainer.style.display = 'block';
        }
    }

    hidePoseCanvas() {
        const poseContainer = document.getElementById('pose-container');
        if (poseContainer) {
            poseContainer.style.display = 'none';
        }
    }

    onPoseDetected(results) {
        if (this.state !== 'playing' && this.state !== 'countdown') return;

        if (results.poseLandmarks) {
            // 翻转关键点的 x 坐标
            results.poseLandmarks.forEach(landmark => {
                landmark.x = 1 - landmark.x;
            });

            // 获取肩部和臀部的关键点
            const leftShoulder = results.poseLandmarks[11];
            const rightShoulder = results.poseLandmarks[12];
            const leftHip = results.poseLandmarks[23];
            const rightHip = results.poseLandmarks[24];
            const leftElbow = results.poseLandmarks[13];
            const rightElbow = results.poseLandmarks[14];

            // 计算肩部和臀部的中点
            const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
            const hipMidX = (leftHip.x + rightHip.x) / 2;

            // 获取难度系数
            const settings = difficulty_map[this.difficulty];
            const positionFactor = settings ? settings.POSITION_FACTOR : 2.0;

            // 修改这里：增加一个倍数来扩大移动范围（比如2.5倍）
            const tiltOffset = (shoulderMidX - hipMidX) * positionFactor * 2.5;
            
            // 计算新的x轴位置
            const playerX = (tiltOffset * this.width) + (this.width / 2);
            
            // 更新玩家位置
            this.updatePlayerPosition(playerX);

            // 检测手臂抬起状态
            const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            const midElbowY = (leftElbow.y + rightElbow.y) / 2;
            this.isPlayerRaisingArms = midElbowY < midShoulderY;

            if (this.state === 'playing' && this.isPlayerRaisingArms) {
                this.checkCollisions();
            }

            if (this.isCollectingData) {
                this.collectPoseData(results);
            }
        }

        this.drawPoseLandmarks(results);
    }

    handleCameraError(error) {
        let errorMessage = "无法访问摄像头。";
        if (error.name === "NotReadableError") {
            errorMessage += "请确保摄像头未其他程序占。";
        } else if (error.name === "NotAllowedError") {
            errorMessage += "请确保已授予浏览使用摄像头的权。";
        } else if (error.message === "No cameras found") {
            errorMessage = "未检测到可用的摄像头。";
        } else {
            errorMessage += "请检查摄像头连接并刷新页面重试。";
        }
        alert(errorMessage);
    }

    drawHUD() {
        const hudElement = document.createElement('div');
        hudElement.id = 'hud';
        hudElement.innerHTML = `
            <p style="font-size: 48px;">Score: ${this.score}</p>
            <p style="font-size: 48px;">Lives: ${this.lives}</p>
            <p style="font-size: 48px;">Time: ${Math.floor(this.timeLeft)}</p>
        `;
        this.gameArea.appendChild(hudElement);
    }

    startGame() {
        this.clearGameObjects();
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 60;
        this.objects = [];
        this.lastSpawnTime = Date.now();
        this.state = 'countdown';
        this.countdownTime = 5;
        this.countdownStartTime = Date.now();
        this.gameTime = 0;

        // 确保难度设置被正确应用
        if (!this.difficulty || !difficulty_map[this.difficulty]) {
            console.log("Setting default difficulty to medium");
            this.difficulty = 'medium';
        }
        
        const settings = difficulty_map[this.difficulty];
        console.log(`Starting game with difficulty: ${this.difficulty}`, settings);

        // Initialize and start pose detection
        this.initializePoseDetection();
        this.showPoseCanvas();

        this.updateCountdown();

        if (this.menuMusic) {
            this.menuMusic.pause();
        }
        if (this.gameplayMusic) {
            this.gameplayMusic.currentTime = 0;
            this.gameplayMusic.loop = true;
            this.gameplayMusic.play();
        }
    }

    updateCountdown() {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.countdownStartTime) / 1000;
        const remainingTime = Math.ceil(5 - elapsedTime);

        // 清除之前的计时元素
        const existingCountdown = document.getElementById('countdown');
        if (existingCountdown) {
            existingCountdown.remove();
        }

        if (remainingTime > 0) {
            const countdownElement = document.createElement('div');
            countdownElement.id = 'countdown';
            countdownElement.style.position = 'absolute';
            countdownElement.style.top = '50%';
            countdownElement.style.left = '50%';
            countdownElement.style.transform = 'translate(-50%, -50%)';
            countdownElement.style.fontSize = '72px';
            countdownElement.style.color = 'white';
            countdownElement.textContent = remainingTime;
            this.gameArea.appendChild(countdownElement);

            // 设置下一秒更新
            setTimeout(() => this.updateCountdown(), 1000);
        } else {
            // 倒计时结束,开始游戏
            this.state = 'playing';
            this.gameTime = 0;
            console.log("Countdown finished, starting game");
            this.initializeGameObjects();
            this.drawPlayer(); // 在这里绘制玩家，游戏真正开始时
        }
    }

    initializeGameObjects() {
        // 初始化游戏对象
        this.objects = [];
        this.spawnInitialObjects();
        this.lastSpawnTime = Date.now();
    }

    spawnInitialObjects() {
        // 初始只生成一个对象
        this.spawnObject();
    }

    updatePlayerImage() {
        const playerElement = document.getElementById('player');
        if (playerElement) {
            const playerImage = playerElement.querySelector('img');
            if (playerImage) {
                playerImage.src = this.isPlayerRaisingArms ? this.playerArmUpImage.src : this.playerNormalImage.src;
            }
        }
    }

    enlargePlayer() {
        const playerElement = document.getElementById('player');
        if (playerElement) {
            playerElement.style.transition = 'all 0.3s';
            playerElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                playerElement.style.transform = 'scale(1)';
            }, 300);
        }
    }

    endGame() {
        console.log("Game ended");
        this.state = 'gameover';
        this.drawGameOver();

        this.hidePoseCanvas();

        this.gameplayMusic.pause();
        this.menuMusic.play();
    }

    drawPoseLandmarks(results) {
        const ctx = this.poseCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.poseCanvas.width, this.poseCanvas.height);

        if (results.poseLandmarks) {
            drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
            drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
        }
    }

    collectPoseData() {
        if (this.poseDetection && this.poseDetection.lastResults) {
            const timestamp = new Date().toISOString();
            const frameData = {
                frame: this.landmarkData.length,
                timestamp: timestamp
            };

            this.poseDetection.lastResults.poseLandmarks.forEach((landmark, index) => {
                const names = ['NOSE', 'LEFT_EYE_INNER', 'LEFT_EYE', 'LEFT_EYE_OUTER', 'RIGHT_EYE_INNER', 'RIGHT_EYE', 'RIGHT_EYE_OUTER', 'LEFT_EAR', 'RIGHT_EAR', 'MOUTH_LEFT', 'MOUTH_RIGHT', 'LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_ELBOW', 'RIGHT_ELBOW', 'LEFT_WRIST', 'RIGHT_WRIST', 'LEFT_PINKY', 'RIGHT_PINKY', 'LEFT_INDEX', 'RIGHT_INDEX', 'LEFT_THUMB', 'RIGHT_THUMB', 'LEFT_HIP', 'RIGHT_HIP', 'LEFT_KNEE', 'RIGHT_KNEE', 'LEFT_ANKLE', 'RIGHT_ANKLE', 'LEFT_HEEL', 'RIGHT_HEEL', 'LEFT_FOOT_INDEX', 'RIGHT_FOOT_INDEX'];
                frameData[`${names[index]}_x`] = landmark.x;
                frameData[`${names[index]}_y`] = landmark.y;
            });

            this.landmarkData.push(frameData);
        }
    }

    clearGameObjects() {
        this.gameArea.innerHTML = ''; // 清除游戏区域的所有内容
    }

    showDifficultyScreen() {
        this.state = 'difficulty';
        this.difficultyScreen.draw();
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        console.log(`Difficulty set to: ${difficulty}`);
        // 应用难度设置
        const settings = difficulty_map[difficulty];
        if (settings) {
            console.log('Applying difficulty settings:', settings);
            this.spawnInterval = settings.STAR_SPAWN_TIME * 1000;
        } else {
            console.warn('Invalid difficulty setting, using default');
            this.difficulty = 'medium';
            this.spawnInterval = difficulty_map['medium'].STAR_SPAWN_TIME * 1000;
        }
    }
}
