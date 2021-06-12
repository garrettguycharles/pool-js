import {Vector} from "./vector.js";

export class LineSegment {
  constructor(start, end) {
    if (start instanceof Vector) {
      this.start = start;
    } else {
      this.start = new Vector(start);
    }

    if (end instanceof Vector) {
      this.end = end;
    } else {
      this.end = new Vector(end);
    }
  }

  intersects(other) {
    let p0 = other.dy * (other.end.x - this.start.x) - other.dx * (other.end.y - this.start.y);
    let p1 = other.dy * (other.end.x - this.end.x) - other.dx * (other.end.y - this.end.y);
    let p2 = this.dy * (this.end.x - other.start.x) - this.dx * (this.end.y - other.start.y);
    let p3 = this.dy * (this.end.x - other.end.x) - this.dx * (this.end.y - other.end.y);

    return (p0 * p1 <= 0) && (p2 * p3 <= 0);
  }

  get["dx"]() {
    return this.end.x - this.start.x;
  }

  get["dy"]() {
    return this.end.y - this.start.y;
  }
}
