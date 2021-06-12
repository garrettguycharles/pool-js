import {Rect} from "./rect.js";
import {Vector} from "./vector.js";

export class Pocket extends Rect {
  constructor(x, y, r) {
    super(x, y, r * 2, r * 2);
    this.color = "black";
    this.mass = 1000000;
    this.velocity = new Vector(0, 0);
    this.balls_in_pocket = [];
  }

  add_ball(b) {
    if (!this.balls_in_pocket.includes(b)) {
      this.balls_in_pocket.push(b);
      b.in_pocket = true;
      b.pocket = this;
    }
  }

  remove_ball(b) {
    let index = this.balls_in_pocket.indexOf(b);
    if (index > -1) {
      this.balls_in_pocket.splice(index, 1);
      b.in_pocket = false;
      b.pocket = null;
    }
  }
}
