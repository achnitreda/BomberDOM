
export class Bomb {
  constructor(x, y, size, el, owner) {
    this.owner = owner
    this.element = el
    this.x = x;
    this.y = y;
    this.placeTime = null;
    this.size = size;
    this.sprite = {
      framesize: size,
      currentFrame: 0,
      frameCount: 5,
      lastUpdate: 0,
      animationSpeed: 100,
    }
  }

  animate(currentTime) {
    if (!this.placeTime) this.placeTime = currentTime;
    if (currentTime - this.sprite.lastUpdate > this.sprite.animationSpeed) {
      this.sprite.currentFrame = (this.sprite.currentFrame + 1) % this.sprite.frameCount;
      this.sprite.lastUpdate = currentTime;
      const x = this.sprite.currentFrame * this.sprite.framesize;
      this.element.style.backgroundPosition = `-${x}px 0px`;
    }
  }

  explod(time) {
    if (time - this.placeTime > 3000) {
      this.element.classList.remove("bomb")
      const idx = this.owner.bombs.indexOf(this)
      if (idx != -1) this.owner.bombs.splice(idx, 1)
        console.log(this.element);
        
      this.element.classList.add("explosion-effect")
    }
  }
}