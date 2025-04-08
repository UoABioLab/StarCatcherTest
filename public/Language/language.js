const starCatcher = {
    en: {
      title: "Star Catcher (Trunk Lean)",
      start: "Start Game",
      back: "Back to Menu",
      gameOver: "Game Over!",
      difficultyLevel: "Difficulty Level",
      selectDifficulty: "Please Select Difficulty Level...",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      retry: "Retry",
      error: "Game start failed, please try again",
      calibrate: "Please maintain a standing position",
      score: "Score",
      lives: "Lives",
      countTime: "CountdownTimer",
      timePlayed: "Time Played",
      finalScore: "Final Score",
      finalLife: "Final Lives",
      instructions: "Instructions",
      gameInstructions:["Game Instructions\n\n" +
            "1. Lean your trunk to move.\n" +
            "2. Raise arms to catch stars.\n" +
            "3. Don't let the balloon drop.\n" +
            "4. Choose difficulty and then START.\n" +
            "5. Have fun!"],
      close: "Close",
      confirmDifficulty: "Confirm Difficulty",
      difficultySelectionReminder: "Please select a difficulty level before starting the game",
    },
    zh: {
      title: "星星捕手（躯干侧屈）",
      start: "开始游戏",
      back: "返回菜单",
      gameOver: "游戏结束！",
      difficultyLevel: "难度等级",
      selectDifficulty: "请选择难度...",
      easy: "简单",
      medium: "中等",
      hard: "困难",
      retry: "重试",
      error: "游戏启动失败，请重试",
      calibrate: "请保持站立姿势",
      score: "分数",
      lives: "生命值",
      countTime: "倒计时",
      timePlayed: "游戏时间",
      finalScore: "最终得分",
      finalLife: "最终生命值",
      instructions: "游戏说明",
      gameInstructions: [ "游戏指南\n\n" +
        "1. 左右侧倾身体控制游戏人物移动 \n" +
        "2. 举起手臂借助掉落的星星和气球 \n" +
        "3. 不要让气球掉落 \n" +
        "4. 选择难度后点击开始 \n" +
        "5. 玩得开心！"],
      close: "关闭",
      confirmDifficulty: "确认难度",
      difficultySelectionReminder: "请在开始游戏前选择难度等级",
    }
  }
  
  const currentLang = localStorage.getItem('language') || 'en'
  
  export function t(key) {
    return starCatcher[currentLang]?.[key] || key
  }