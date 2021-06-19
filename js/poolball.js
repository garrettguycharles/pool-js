import {Ball} from "./ball.js";

export class PoolBall extends Ball {
  static colors = [
    "#000000",
    "#d6c400", // yellow
    "#0044a3", // blue
    "#a81313", // red
    "#3d005e", // purple
    "#bd6500", // orange
    "#0c6900", // green
    "#630136", // maroon
    "#000000", // black
    "#d6c400",
    "#0044a3",
    "#a81313",
    "#3d005e",
    "#bd6500",
    "#0c6900",
    "#630136"
  ];

  constructor(x, y, r, num = 0) {
    super(x, y, r);
    this.number = num;
    this.color = PoolBall.colors[this.number];
    this.in_pocket = false;
    this.pocket = null;
  }

  get["stripe"]() {
    return this.number > 8;
  }

  get["solid"]() {
    return this.number > 0 && this.number <= 8;
  }

  get["cue"]() {
    return this.number === 0;
  }

  get["is_moving"]() {
    return this.velocity.magnitude > 0.001 || this.rotation.magnitude > 0.001;
  }
}
