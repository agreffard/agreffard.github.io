/*
  Derivated from "this alter world" made by Gerard Ferrandez
  https://codepen.io/ge1doot/pen/GQobbq
*/

"use strict";
{
  // http://mrl.nyu.edu/~perlin/noise/
  class Noise {
    constructor(octaves = 1) {
      this.p = new Uint8Array(512);
      this.octaves = octaves;
      this.init();
    }
    init() {
      for (let i = 0; i < 512; ++i) {
        this.p[i] = Math.random() * 256;
      }
    }
    lerp(t, a, b) {
      return a + t * (b - a);
    }
    grad2d(i, x, y) {
      const v = (i & 1) === 0 ? x : y;
      return (i & 2) === 0 ? -v : v;
    }
    noise2d(x2d, y2d) {
      const X = Math.floor(x2d) & 255;
      const Y = Math.floor(y2d) & 255;
      const x = x2d - Math.floor(x2d);
      const y = y2d - Math.floor(y2d);
      const fx = (3 - 2 * x) * x * x;
      const fy = (3 - 2 * y) * y * y;
      const p0 = this.p[X] + Y;
      const p1 = this.p[X + 1] + Y;
      return this.lerp(
        fy,
        this.lerp(
          fx,
          this.grad2d(this.p[p0], x, y),
          this.grad2d(this.p[p1], x - 1, y)
        ),
        this.lerp(
          fx,
          this.grad2d(this.p[p0 + 1], x, y - 1),
          this.grad2d(this.p[p1 + 1], x - 1, y - 1)
        )
      );
    }
    noise(x, y) {
      let e = 1,
        k = 1,
        s = 0;
      for (let i = 0; i < this.octaves; ++i) {
        e *= 0.5;
        s += e * (1 + this.noise2d(k * x, k * y)) / 2;
        k *= 2;
      }
      return s;
    }
  }
  const canvas = {
    init() {
      this.elem = document.createElement("canvas");
      document.body.appendChild(this.elem);
      this.width = this.elem.width = this.elem.offsetWidth;
      this.height = this.elem.height = this.elem.offsetHeight;
      return this.elem.getContext("2d");
    },
    requestAnimationFrame () {
      return new Promise(resolve => requestAnimationFrame(resolve));
    }
  };
  // init Pen
  const perlin = new Noise(3);
  const ctx = canvas.init();
  const zoom = 10 / Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.05;
  // main loop
  async function run() {
    for (let px = 0; px < canvas.width; px++) {
      for (let py = 0; py < canvas.height / 6; py++) {
        let x = px;
        let y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const n = perlin.noise(x * zoom, y * zoom);
        ctx.strokeStyle = `hsl(${-210 + n * 600}, 100%, ${900 * n * n * n}%)`;
        for (let m = 0; m < 600 && y >= 0 && y <= canvas.height; m++) {
          const n = perlin.noise(x * zoom, y * zoom);
          x += Math.cos(n * 14);
          y += Math.sin(n * 14);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      await canvas.requestAnimationFrame();
    }
  };
  run();
}
