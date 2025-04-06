class GameObject {
    constructor(imagePath, size, sizeRandomize, minVel, maxVel) {
        this.size = this.randomizeSize(size, sizeRandomize);
        this.rect = { x: 0, y: 0, width: this.size[0], height: this.size[1] };
        this.vel = [0, this.randomVelocity(minVel, maxVel)];
    }
    randomizeSize(baseSize, randomize) {
        const randomFactor = Math.random() * (randomize[1] - randomize[0]) + randomize[0];
        return [Math.floor(baseSize[0] * randomFactor), Math.floor(baseSize[1] * randomFactor)];
    }
    randomVelocity(min, max) {
        return Math.random() * (max - min) + min;
    }
    update() {
        // 在子类中实现
    }
    shouldRemove() {
        // 在子类中实现
    }
    getRect() {
        return this.rect;
    }
}
