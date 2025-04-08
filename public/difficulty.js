import { t } from './Language/language.js';

export class DifficultySettings {
    constructor(POSITION_FACTOR, STAR_SPAWN_TIME, BALL_VEL, STAR_VEL) {
        this.POSITION_FACTOR = POSITION_FACTOR;
        this.STAR_SPAWN_TIME = STAR_SPAWN_TIME;
        this.BALL_VEL = BALL_VEL;
        this.STAR_VEL = STAR_VEL;
    }
}
const easy_settings = new DifficultySettings(2.5, 5, 2, 2);
const medium_settings = new DifficultySettings(2.0, 5, 4, 4);
const hard_settings = new DifficultySettings(1.5, 5, 6, 6);
window.difficulty_map = {
    "easy": easy_settings,
    "medium": medium_settings,
    "hard": hard_settings
};

export class DifficultyScreen {
    constructor(game) {
        this.game = game;
        this.difficulty = null;
    }

    draw() {
        this.game.clearGameObjects();
        const difficultyElement = document.createElement('div');
        difficultyElement.id = 'difficulty-screen';
        difficultyElement.style.position = 'absolute';
        difficultyElement.style.top = '0';
        difficultyElement.style.left = '0';
        difficultyElement.style.width = '100%';
        difficultyElement.style.height = '100%';
        difficultyElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        difficultyElement.style.color = 'white';
        difficultyElement.style.display = 'flex';
        difficultyElement.style.flexDirection = 'column';
        difficultyElement.style.alignItems = 'center';
        difficultyElement.style.justifyContent = 'center';
        difficultyElement.style.zIndex = '1000';

        const title = document.createElement('h2');
        title.textContent = t('selectDifficulty');
        title.style.fontSize = '40px';
        title.style.marginBottom = '40px';
        difficultyElement.appendChild(title);

        // Create a dropdown for difficulty selection
        const dropdown = document.createElement('select');
        dropdown.style.margin = '10px';
        dropdown.style.padding = '10px';
        dropdown.style.fontSize = '30px';

        const difficulties = [t('selectDifficulty'), t('easy'), t('medium'), t('hard')];
        difficulties.forEach(diff => {
            const option = document.createElement('option');
            option.value = diff.toLowerCase();
            option.textContent = diff;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener('change', (e) => {
            this.setDifficulty(e.target.value);
        });

        difficultyElement.appendChild(dropdown);

        // Add confirm button
        const confirmButton = document.createElement('button');
        confirmButton.textContent = t('confirmDifficulty');
        confirmButton.style.margin = '20px 10px 10px 10px';
        confirmButton.style.padding = '10px 20px';
        confirmButton.style.fontSize = '40px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.addEventListener('click', () => this.confirmSelection());
        difficultyElement.appendChild(confirmButton);

        this.game.gameArea.appendChild(difficultyElement);
        console.log('Difficulty screen drawn');
    }

    setDifficulty(level) {
        if (level !== t('select difficulty')) {
            const difficultyMap = {
                '简单': 'easy',
                '中等': 'medium',
                '困难': 'hard'
            };
            this.difficulty = difficultyMap[level] || 'easy'; // 默认设置为 'easy'
            console.log(`Difficulty selected: ${this.difficulty}`);
        }
    }

    confirmSelection() {
        if (this.difficulty) {
            // 设置游戏难度并打印日志
            console.log(`Setting difficulty to: ${this.difficulty}`);
            this.game.difficulty = this.difficulty;
            this.game.setDifficulty(this.difficulty);
            
            // 直接开始游戏，而不是返回菜单
            // this.game.startGame();
             // 返回主菜单，而不是直接开始游戏
            this.game.state = 'menu';
            this.game.menu.draw(this.game.gameArea);  // 重新绘制主菜单
        } else {
            alert(t('Please select a difficulty'));
        }
    }
}

// export class DifficultyManager {
//     constructor(game) {
//         this.game = game;
//         // const buttonWidth = this.game.width * 0.2;
//         // const buttonHeight = 50;
//         // const buttonSpacing = 20;
//         // const inputWidth = this.game.width * 0.3;
//         // const inputHeight = 50;
//         // // 调整按钮的垂直位置
//         // const startY = this.game.height * 0.3; // 从30%的高度开始放置按钮
        
//         // // 创建按钮并添加点击事件
//         // this.easyButton = new Button(
//         //     t('easy'),  // 按钮文本
//         //     this.game.width / 2 - buttonWidth / 2, // x坐标
//         //     startY,  // y坐标
//         //     buttonWidth,  // 宽度
//         //     buttonHeight,  // 高度
//         //     () => this.handleClick('easy')  // 点击事件
//         // );

//         // this.mediumButton = new Button(
//         //     t('medium'),  // 按钮文本
//         //     this.game.width / 2 - buttonWidth / 2, // x坐标
//         //     startY + buttonHeight + buttonSpacing,  // y坐标
//         //     buttonWidth,  // 宽度
//         //     buttonHeight,  // 高度
//         //     () => this.handleClick('medium')  // 点击事件
//         // );

//         // this.hardButton = new Button(
//         //     t('hard'),  // 按钮文本
//         //     this.game.width / 2 - buttonWidth / 2, // x坐标
//         //     startY + (buttonHeight + buttonSpacing) * 2,  // y坐标
//         //     buttonWidth,  // 宽度
//         //     buttonHeight,  // 高度
//         //     () => this.handleClick('hard')  // 点击事件
//         // );

//         // this.backButton = new Button(
//         //     "Back", 
//         //     this.game.width * 0.1, 
//         //     this.game.height - 100, 
//         //     buttonWidth, 
//         //     buttonHeight, 
//         //     () => this.handleClick('back')  // 点击事件
//         // );

//         // this.submitButton = new Button(
//         //     "Submit", 
//         //     this.game.width * 0.7, 
//         //     this.game.height - 100, 
//         //     buttonWidth, 
//         //     buttonHeight, 
//         //     () => this.handleClick('submit')  // 点击事件
//         // );

//         // this.easyButton = new Button(this.game.width / 2 - buttonWidth / 2, startY, buttonWidth, buttonHeight, "Easy", COLORS.buttons.default, COLORS.buttons.second);
//         // this.mediumButton = new Button(this.game.width / 2 - buttonWidth / 2, startY + buttonHeight + buttonSpacing, buttonWidth, buttonHeight, "Medium", COLORS.buttons.default, COLORS.buttons.second);
//         // this.hardButton = new Button(this.game.width / 2 - buttonWidth / 2, startY + (buttonHeight + buttonSpacing) * 2, buttonWidth, buttonHeight, "Hard", COLORS.buttons.default, COLORS.buttons.second);
//         // // 将用户ID输入框放在难度按钮下方
//         // // this.userIdInput = new InputBox(this.game.width / 2 - inputWidth / 2, startY + (buttonHeight + buttonSpacing) * 3 + 20, inputWidth, inputHeight, "Enter User ID");
//         // this.backButton = new Button(this.game.width * 0.1, this.game.height - 100, buttonWidth, buttonHeight, "Back", COLORS.buttons.default, COLORS.buttons.second);
//         // this.submitButton = new Button(this.game.width * 0.7, this.game.height - 100, buttonWidth, buttonHeight, "Submit", COLORS.buttons.default, COLORS.buttons.second);
//         this.selectedDifficulty = null;
//     }
//     draw(container) {
//         console.log('Drawing difficulty screen'); // 添加这行
//         container.innerHTML = ''; // Clear the container
//         const difficultyElement = document.createElement('div');
//         difficultyElement.id = 'difficulty-screen';
//         difficultyElement.style.position = 'absolute';
//         difficultyElement.style.top = '0';
//         difficultyElement.style.left = '0';
//         difficultyElement.style.width = '100%';
//         difficultyElement.style.height = '100%';
//         difficultyElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
//         difficultyElement.style.color = 'white';
//         difficultyElement.style.display = 'flex';
//         difficultyElement.style.flexDirection = 'column';
//         difficultyElement.style.alignItems = 'center';
//         difficultyElement.style.justifyContent = 'flex-start';
//         difficultyElement.style.paddingTop = '50px';
//         // Draw title
//         const titleElement = document.createElement('h2');
//         titleElement.textContent = "Select Difficulty";
//         titleElement.style.marginBottom = '50px';
//         titleElement.style.fontSize = '36px';
//         difficultyElement.appendChild(titleElement);
//         // 创建一个容器来包含所有按钮和输入框
//         const elementsContainer = document.createElement('div');
//         elementsContainer.style.display = 'flex';
//         elementsContainer.style.flexDirection = 'column';
//         elementsContainer.style.alignItems = 'center';
//         // Draw buttons
//         this.easyButton.draw(elementsContainer);
//         this.mediumButton.draw(elementsContainer);
//         this.hardButton.draw(elementsContainer);
//         // Draw user ID input
//         console.log('Drawing user ID input'); // 添加这行
//         // this.userIdInput.draw(elementsContainer);
//         difficultyElement.appendChild(elementsContainer);
//         // 将返回按钮和提交按钮放在底部
//         const buttonContainer = document.createElement('div');
//         buttonContainer.style.position = 'absolute';
//         buttonContainer.style.bottom = '20px';
//         buttonContainer.style.width = '100%';
//         buttonContainer.style.display = 'flex';
//         buttonContainer.style.justifyContent = 'space-between';
//         buttonContainer.style.padding = '0 10%';
//         this.backButton.draw(buttonContainer);
//         this.submitButton.draw(buttonContainer);
//         difficultyElement.appendChild(buttonContainer);
//         // 添加这一行来处理难度选择界面的点击事件
//         difficultyElement.addEventListener('click', (e) => this.handleClick(e.offsetX, e.offsetY));
//         container.appendChild(difficultyElement);
//         console.log('Difficulty screen drawn'); // 添加这行
//     }
    // handleClick(x, y) {
    //     console.log('DifficultyManager handleClick:', x, y); // 添加这行
    //     if (this.easyButton.isClicked({x, y})) {
    //         this.selectedDifficulty = 'easy';
    //         return true;
    //     } else if (this.mediumButton.isClicked({x, y})) {
    //         this.selectedDifficulty = 'medium';
    //         return true;
    //     } else if (this.hardButton.isClicked({x, y})) {
    //         this.selectedDifficulty = 'hard';
    //         return true;
    //     } else if (this.backButton.isClicked({x, y})) {
    //         return { action: 'back' };
    //     // } else if (this.submitButton.isClicked({x, y})) {
    //     //     if (this.selectedDifficulty && this.userIdInput.text && this.userIdInput.text !== "Enter User ID") {
    //     //         return { action: 'submit', userId: this.userIdInput.text, difficulty: this.selectedDifficulty };
    //     //     } else {
    //     } else if (this.submitButton.isClicked({x, y})) {
    //         if (this.selectedDifficulty ) {
    //             return { action: 'submit', difficulty: this.selectedDifficulty };
    //         } else {
    //             // alert("Please select a difficulty and enter a user ID.");
    //             alert("Please select a difficulty");
    //         }
    //     }
    //     return false;
    // }
    // applyDifficulty() {
        // if (this.selectedDifficulty) {
        //     const settings = window.difficulty_map[this.selectedDifficulty];
        //     Object.assign(this.game, settings);
        //     console.log(`Difficulty set to ${this.selectedDifficulty}`);
        //     this.game.state = 'menu';
        //     this.game.menu.draw(this.game.gameArea);
        // }
    // }
// }
