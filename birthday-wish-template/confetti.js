// High Performance Confetti Engine for Cutiepage Recreation

class ConfettiEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animId = null;
    this.colors = ['#2f57d9', '#ff9ccb', '#5ed3a0', '#ffd23f', '#b9a6ff', '#ff5a4e', '#ffffff'];
    this.initCanvas();
  }

  initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'fixed inset-0 pointer-events-none z-50';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth * window.devicePixelRatio;
      this.canvas.height = window.innerHeight * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  burst(originX = window.innerWidth / 2, originY = window.innerHeight * 0.4, count = 45) {
    this.initCanvas();
    const shapes = ['rect', 'circle', 'ribbon', 'star'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = 7 + Math.random() * 12;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 6 + Math.random() * 8;

      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.5),
        vy: (Math.sin(angle) * speed - 6) * (0.8 + Math.random() * 0.5),
        gravity: 0.28 + Math.random() * 0.1,
        drag: 0.94 + Math.random() * 0.03,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 18,
        color: color,
        shape: shape,
        size: size,
        w: size * (shape === 'ribbon' ? 2.5 : 1),
        h: size * (shape === 'ribbon' ? 0.6 : 1),
        opacity: 1,
        life: 1,
        decay: 0.008 + Math.random() * 0.008
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;
      p.opacity = Math.max(0, p.life);

      if (p.life <= 0 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'star') {
        this.drawStar(this.ctx, 0, 0, 4, p.size, p.size / 2);
      } else {
        // rect or ribbon
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.animId = null;
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}

window.confetti = new ConfettiEngine();
