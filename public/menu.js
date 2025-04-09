import { t } from './Language/language.js';

export class Menu {
    constructor(game) {
        this.game = game;
        this.background = new Background(this.game.gameArea, 'Assets/avatar/matariki.jpg');
        this.clickSound = document.getElementById('catchSound');
    }

    draw() {
        // 清除游戏区域
        this.game.clearGameObjects();

        // 创建菜单容器
        const menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';
        menuContainer.style.position = 'absolute';
        menuContainer.style.top = '0';
        menuContainer.style.left = '0';
        menuContainer.style.width = '100%';
        menuContainer.style.height = '100%';
        menuContainer.style.display = 'flex';
        menuContainer.style.flexDirection = 'column';
        menuContainer.style.alignItems = 'center';
        menuContainer.style.justifyContent = 'center';
        menuContainer.style.color = 'white';
        menuContainer.style.fontFamily = 'Arial, sans-serif';
        menuContainer.style.zIndex = '1000'; // 确保菜单在最上层

        // 添加标题
        const title = document.createElement('h1');
        title.textContent = t('title');
        title.style.fontSize = '50px';
        title.style.textAlign = 'center';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '20px';
        title.style.textShadow = '4px 4px 4px rgba(0, 0, 0, 0.5)';
        menuContainer.appendChild(title);

        // 添加游戏说明
        // const instructions = [
        //     "How to play the game:",
        //     "1. Lean your trunk to move.",
        //     "2. Raise arms to catch stars.",
        //     "3. Don't let the balloon drop.",
        //     "4. Choose difficulty then START.",
        //     "5. Have fun."
        // ];

        // instructions.forEach((instruction, index) => {
        //     const p = document.createElement('p');
        //     p.textContent = instruction;
        //     p.style.fontSize = index === 0 ? '24px' : '18px';
        //     p.style.margin = '5px 0';
        //     p.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
        //     menuContainer.appendChild(p);
        // });

        // 添加按钮
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.marginTop = '20px';

        const buttons = [
            {text: t('instructions'), action: () => this.game.showInstructions()},

            {text:  t('difficultyLevel'), action: () => this.game.showDifficultyScreen() },
           
            { text:  t('start'), action: () => this.game.startGame() },
            
            { text: t('back'), action: () => this.confirmQuit() }
        ];

        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.textContent = button.text;
            btn.style.fontSize = '35px';
            btn.style.padding = '10px 20px';
            btn.style.margin = '10px';
            btn.style.cursor = 'pointer';
            btn.style.backgroundColor = '#4CAF50';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '5px';
            btn.style.transition = 'background-color 0.3s';

            btn.addEventListener('mouseover', () => {
                btn.style.backgroundColor = '#45a049';
            });

            btn.addEventListener('mouseout', () => {
                btn.style.backgroundColor = '#4CAF50';
            });

            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                this.clickSound.play();
                button.action();
            });
            buttonContainer.appendChild(btn);
        });

        menuContainer.appendChild(buttonContainer);

        this.game.gameArea.appendChild(menuContainer);

        if (this.game.menuMusic) {
            this.game.menuMusic.currentTime = 0;
            this.game.menuMusic.loop = true;
            this.game.menuMusic.play();
        }
    }

    hide() {
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) {
            menuContainer.remove();
        }
    }

    showInstructions() {
        const instructionBox = document.createElement('div');
        instructionBox.style.position = 'fixed';
        instructionBox.style.top = '50%';
        instructionBox.style.left = '50%';
        instructionBox.style.transform = 'translate(-50%, -50%)';
        instructionBox.style.padding = '20px';
        instructionBox.style.backgroundColor = 'rgb(95, 86, 219)';
        instructionBox.style.color = 'white';
        instructionBox.style.borderRadius = '10px';
        instructionBox.style.zIndex = '2000';
        instructionBox.style.maxWidth = '80%';
        instructionBox.style.textAlign = 'center';
        instructionBox.style.width = '600px';  // 固定宽度

        const ruleText = document.createElement('p');
        ruleText.textContent = t('gameInstructions');
        ruleText.style.fontSize = '28px';
        ruleText.style.fontWeight = 'bold';
        ruleText.style.lineHeight = '1.5';
        ruleText.style.marginBottom = '20px';
        ruleText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
        ruleText.style.whiteSpace = 'pre-line'; // 保持换行格式
        instructionBox.appendChild(ruleText);

        const closeButton = document.createElement('button');
        closeButton.textContent = t('close');
        closeButton.style.fontSize = '40px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.marginTop = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';

        closeButton.addEventListener('click', () => {
            instructionBox.remove();
        });

        instructionBox.appendChild(closeButton);
        document.body.appendChild(instructionBox);
    }

    confirmQuit() {
        const referrer = document.referrer;

        if (referrer) {
            window.location.href = referrer;
        } else {
            const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            const currentPath = location.pathname.split('/')[1];
            const mainPage = isLocal
                ? '/GameIndex/index.html'
                : `https://${location.hostname}/${currentPath}/`;

            window.location.href = mainPage;
        }
    }

    update() {
        // 只在菜单状态下更新
        if (this.game.state === 'menu') {
            this.draw();
        }
    }
}
