export const templateFilter7 = {
  cellSize: 4,
  levelCnt: 3,
  colCnt: 0,
  rowCnt: 0,
  scaleX: 0,
  scaleY: 0,
  levels: null,

  setup(p5js) {
    p5js.noStroke();

    this.colCnt = p5js.floor(p5js.width / this.cellSize);
    this.rowCnt = p5js.floor(p5js.height / this.cellSize);

    this.levels = new Array(this.colCnt);
    for (let col = 0; col < this.colCnt; col++) {
      this.levels[col] = new Array(this.rowCnt);
    }
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(255);
    offscreen.loadPixels();

    this.scaleX = offscreen.width / this.colCnt;
    this.scaleY = offscreen.height / this.rowCnt;

    for (let col = 0; col < this.colCnt; col++) {
      for (let row = 0; row < this.rowCnt; row++) {
        let videoX = Math.floor(col * this.scaleX);
        let videoY = Math.floor(row * this.scaleY);
        let index = (videoY * offscreen.width + videoX) * 4;
        let r = offscreen.pixels[index];
        let g = offscreen.pixels[index + 1];
        let b = offscreen.pixels[index + 2];
        let brightness = (r + g + b) / 3;
        let level = Math.floor(p5js.map(brightness, 0, 255, 0, this.levelCnt));
        this.levels[col][row] = level;
      }
    }
    p5js.stroke(0, 0, 255);
    p5js.strokeWeight(2);
    p5js.noFill();

    for (let col = 0; col < this.colCnt - 1; col++) {
      for (let row = 0; row < this.rowCnt - 1; row++) {
        let cur = this.levels[col][row];
        let right = this.levels[col + 1][row];
        let bottom = this.levels[col][row + 1];
        let x = col * this.cellSize;
        let y = row * this.cellSize;

        if (cur !== right) {
          p5js.line(x + this.cellSize, y, x + this.cellSize, y + this.cellSize);
        }
        if (cur !== bottom) {
          p5js.line(x, y + this.cellSize, x + this.cellSize, y + this.cellSize);
        }
      }
    }
  },
};
