class Balloon extends GameObject {
    constructor(x, y, screenHeight, difficulty) {
        const settings = difficulty_map[difficulty];
        super('./Assets/balloon/pink_balloon.png', BALLOON_SIZES, BALLOON_SIZE_RANDOMIZE);
        this.rect.x = x;
        this.rect.y = y;
        this.screenHeight = screenHeight;
        this.speed = settings.BALL_VEL;
        this.id = Math.random().toString(36).substr(2, 9);
        this.isBurst = false;
    }
    update() {
        if (!this.isBurst) {
            this.rect.y += this.speed;
        }
    }
    shouldRemove() {
        return this.rect.y > this.screenHeight || (this.isBurst && Date.now() - this.burstTime > 500);
    }
    burst() {
        this.isBurst = true;
        this.burstTime = Date.now();
    }
    getRect() {
        return {
            left: this.rect.x,
            right: this.rect.x + this.rect.width,
            top: this.rect.y,
            bottom: this.rect.y + this.rect.height
        };
    }
}
