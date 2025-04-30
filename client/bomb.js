import { store } from "./game.js";

export class Bomb {
  constructor(i, j, size, owner) {
    this.owner = owner
    this.element = document.getElementById(`${i}#${j}`)
    this.i = i;
    this.j = j;
    this.size = size;
    this.sprite = {
      framesize: size,
      currentFrame: 0,
      frameCount: 5,
      lastUpdate: 0,
      animationSpeed: 100,
    }
    this.affectedEmpties = []
    this.affectedSofts = []
    this.element.style.backgroundSize = `${5 * this.size}px, ${this.size}px`;
    this.element.classList.add("bomb");
  }

  animate(currentTime) {
    if (currentTime - this.sprite.lastUpdate > this.sprite.animationSpeed) {
      this.sprite.currentFrame = (this.sprite.currentFrame + 1) % this.sprite.frameCount;
      this.sprite.lastUpdate = currentTime;
      const x = this.sprite.currentFrame * this.sprite.framesize;
      this.element.style.backgroundPosition = `-${x}px 0px`;
    }
  }

  explod() {
    this.element.classList.remove("bomb")
    const idx = this.owner.bombs.indexOf(this)
    if (idx != -1) this.owner.bombs.splice(idx, 1)
    // this.element.classList.add("explosion-effect")
    this.affectedEmpties.push(this.element)
    const dirs = [[1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1]]
    this.element.classList.add("explosion-effect");
    for (let r = 1; r <= this.owner.bombRange; r++) {
      dirs.forEach(([c, dx, dy], i) => {
        const ni = this.i + dx * r, nj = this.j + dy * r
        if (ni >= 0 && ni <= 12 && nj >= 0 && nj <= 14) {
          const val = store.getState().room.map[ni][nj]
          if (c == 1) {
            const el = document.getElementById(`${ni}#${nj}`)
            if (val == 1 || val == 2) {
              
              
              let classN = store.getState().room.powerUps[`_${ni}_${nj}`];
              // console.log("power => ", classN);
              
              dirs[i][0] = 0;
              if (val == 1) {
                // el.classList.remove("soft");
                setTimeout(() => {
                  el.classList.remove("soft");
                  el.classList.add("empty");
                  if (classN) el.classList.add(classN);
                  store.getState().room.map[ni][nj] = 0;
                }, 300)
                // this.affectedSofts.push(el)
              }
            } else {
              store.getState().players.forEach(player => {
                const pi = Math.trunc((player.position.y +(player.size*0.5))/this.size)
                const pj = Math.trunc((player.position.x +(player.size*0.5))/this.size)
                // console.log(pi, pj, "////", ni, nj);
                if(pi == ni && pj == nj && player.alive && !player.revive) {
                  player.death()
                }
              })
              el.classList.add("explosion-effect");
              setTimeout(() => {
                el.classList.remove("explosion-effect");
              }, 500)
            }
          }
        }
      })
    }
    setTimeout(() => {
      this.element.classList.remove("explosion-effect");
    }, 500)
    // console.log("empty",this.affectedEmpties, "soft=>",this.affectedSofts);
  }
}
