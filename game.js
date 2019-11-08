// CANVAS AND CONTEXT
const cvs = document.getElementById('bird');
const ctx = cvs.getContext('2d');

const DEGREE = Math.PI / 180;

// GAME VARS AND CONSTS
let frames = 0;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = 'sprite.png';

// GAME STATE
const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2,
  difficulty: 'easy'
};

// START BUTTON
const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29
};

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = 'sfx_point.wav';
const FLAP_S = new Audio();
FLAP_S.src = 'sfx_flap.wav';
const HIT_S = new Audio();
HIT_S.src = 'sfx_hit.wav';
const SWOOSHING_S = new Audio();
SWOOSHING_S.src = 'sfx_swooshing.wav';
const DIE_S = new Audio();
DIE_S.src = 'sfx_die.wav';

// CONTROLLER
cvs.addEventListener('click', function(evt) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      SWOOSHING_S.play();
      break;
    case state.game:
      bird.flap();
      FLAP_S.play();
      break;
    case state.over:
      let rect = cvs.getBoundingClientRect();
      let clickX = evt.clientX - rect.left;
      let clickY = evt.clientY - rect.top;
      if (
        clickX >= startBtn.x &&
        clickX <= startBtn.x + startBtn.w &&
        clickY >= startBtn.y &&
        clickY <= startBtn.y + startBtn.h
      ) {
        bird.speedReset();
        pipes.reset();
        score.reset();
        state.current = state.getReady;
      }
      break;
  }
});

// BACKGROUND
const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: cvs.height - 226,
  draw: function() {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  }
};

// FOREGROUND
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: cvs.height - 112,
  dx: 2,
  multiplier: 1,
  draw: function() {
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );
    ctx.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },
  update: function() {
    if (state.current == state.game) {
      this.x = (this.x - this.dx * this.multiplier) % (this.w / 2);
    }
  }
};

// BIRD
const bird = {
  speed: 0,
  gravity: 0.25,
  radius: 12,
  jump: 4.6,
  rotation: 0,
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 }
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,
  frame: 2,
  draw: function() {
    let bird = this.animation[this.frame];
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );
    ctx.restore();
  },
  update: function() {
    if (state.current == state.getReady) {
      this.y = 150;
      this.rotation = 0 * DEGREE;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;
      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        if (state.current == state.game) {
          state.current = state.over;
          DIE_S.play();
        }
      }
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.frame = 1;
      } else {
        this.rotation = -25 * DEGREE;
      }
    }
    // IF THE GAME STATE IS GET READY STATE, THE BIRD MUST FLAP SLOWLY
    this.period = state.current === state.getReady ? 10 : 5;
    // WE INCREMENT THE FRAME BY 1, EACH PERIOD
    this.frame += frames % this.period == 0 ? 1 : 0;
    // FRAME GOES FROM 0 TO 4, THEN AGAIN TO 0
    this.frame = this.frame % this.animation.length;
  },
  flap: function() {
    this.speed = -this.jump;
  },
  speedReset: function() {
    this.speed = 0;
  }
};

// PIPES
const pipes = {
  bottom: {
    sX: 502,
    sY: 0
  },
  top: { sX: 553, sY: 0 },
  w: 53,
  h: 400,
  gap: 85,
  dx: 2,
  multiplier: 1,
  maxYPos: -150,
  position: [],
  draw: function() {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topYPos = p.y;
      let bottomYPos = p.y + this.gap + this.h;
      ctx.drawImage(
        sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      );
      ctx.drawImage(
        sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      );
    }
  },
  update: function() {
    if (state.current !== state.game) return;
    if (frames % 100 == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1)
      });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let bottomPipeY = p.y + this.gap + this.h;
      p.x -= this.dx * this.multiplier;
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.over;
        HIT_S.play();
      }
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeY &&
        bird.y - bird.radius < bottomPipeY + this.h
      ) {
        state.current = state.over;
        HIT_S.play();
      }

      if (p.x + this.w <= 0) {
        this.position.shift();
        score.value += 1;
        score.best = Math.max(score.value, score.best);
        localStorage.setItem('best', score.best);
        SCORE_S.play();
      }
    }
  },
  reset: function() {
    this.position = [];
  }
};

// GET READY MESSAGE
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,
  draw: function() {
    if (state.current === state.getReady) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  }
};

// GAME OVER MESSAGE
const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 90,
  draw: function() {
    if (state.current === state.over) {
      ctx.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  }
};

// SCORE
const score = {
  best: parseInt(localStorage.getItem('best')) || 0,
  value: 0,
  reset: function() {
    this.value = 0;
  },
  draw: function() {
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#000';

    if (state.current == state.game) {
      ctx.lineWidth = 2;
      ctx.font = '35px Teko';
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);
    } else if (state.current == state.over) {
      ctx.font = '25px Teko';
      ctx.fillText(this.value, 225, 186);
      ctx.strokeText(this.value, 225, 186);
      ctx.fillText(this.best, 225, 228);
      ctx.strokeText(this.best, 225, 228);
    }
  },
  update: function() {
    if (this.value > 0 && this.value >= 20) {
      state.difficulty = 'medium';
      fg.multiplier = 1.5;
      pipes.multiplier = 1.5;
    }
    if (this.value > 20 && this.value >= 40) {
      state.difficulty = 'hard';
      fg.multiplier = 2.5;
      pipes.multiplier = 2.5;
    }
  }
};

// DRAW
function draw() {
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}

// UPDATE
function update() {
  bird.update();
  fg.update();
  pipes.update();
  score.update();
}

// LOOP
function loop() {
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
}

loop();
