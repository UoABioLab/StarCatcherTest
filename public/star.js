class Star extends GameObject {
    constructor(x, y, screenHeight, difficulty) {
        const settings = difficulty_map[difficulty];
        super('./Assets/star/star.png', STAR_SIZES, STAR_SIZE_RANDOMIZE);
        this.rect.x = x;
        this.rect.y = y;
        this.screenHeight = screenHeight;
        this.speed = settings.STAR_VEL;
        this.id = Math.random().toString(36).substr(2, 9);
    }

    update() {
        this.rect.y += this.speed;
    }

    shouldRemove() {
        return this.rect.y > this.screenHeight;
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
