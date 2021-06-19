import * as utils from "./utils.js";

export class Vector {

  static up() {
    return new Vector(0, -1);
  }

  static down() {
    return new Vector(0, 1);
  }

  static left() {
    return new Vector(-1, 0);
  }

  static right() {
    return new Vector(1, 0);
  }

  constructor() {
    if (arguments.length == 1) {
      this.coord = Array.from(arguments[0]);
    } else {
      this.coord = Array.from(arguments);
    }
  }

  at(i) {
    return this.coord[i];
  }

  add(other) {
    if (other instanceof Vector) {
      if (this.dimension !== other.dimension) {
        throw new TypeError("Tried to add vectors of unequal dimension: " + this.dimension.toString() + ", " + other.dimension.toString());
      }

      let to_return = [];
      for (let i = 0; i < this.dimension; i++) {
        to_return.push(this.at(i) + other.at(i));
      }
      return new Vector(to_return);
    } else {
      if (this.dimension !== other.length) {
        throw new TypeError("Tried to add vector to coord of unequal dimension: " + this.dimension.toString() + ", " + other.length.toString());
      }

      let to_return = [];
      for (let i = 0; i < this.dimension; i++) {
        to_return.push(this.at(i) + other[i]);
      }
      return new Vector(to_return);
    }
  }

  subtract(other) {
    if (other instanceof Vector) {
      if (this.dimension !== other.dimension) {
        throw new TypeError("Tried to subtract vectors of unequal dimension: " + this.dimension.toString() + ", " + other.dimension.toString());
      }

      let to_return = [];
      for (let i = 0; i < this.dimension; i++) {
        to_return.push(this.at(i) - other.at(i));
      }
      return new Vector(to_return);
    } else {
      if (this.dimension !== other.length) {
        throw new TypeError("Tried to subtract coord from vector of unequal dimension: " + this.dimension.toString() + ", " + other.length.toString());
      }

      let to_return = [];
      for (let i = 0; i < this.dimension; i++) {
        to_return.push(this.at(i) - other[i]);
      }
      return new Vector(to_return);
    }
  }

  scale(scalar) {
    let to_return = [];
    for (let i = 0; i < this.dimension; i++) {
      to_return.push(this.at(i) * scalar);
    }

    return new Vector(to_return);
  }

  scale_to(magnitude) {
    return this.scale(magnitude / this.magnitude);
  }

  normalize() {
    if (this.magnitude > 0) {
      return this.scale(1 / this.magnitude);
    } else {
      return this;
    }
  }

  dot(other) {

    if (other instanceof Vector) {
      if (this.dimension !== other.dimension) {
        throw new TypeError("Tried to dot multiply vectors of unequal dimension: " + this.dimension.toString() + ", " + other.dimension.toString());
      }
      let to_return = 0;
      for (let i = 0; i < this.dimension; i++) {
        to_return += this.at(i) * other.at(i);
      }

      return to_return;
    } else {
      if (this.dimension !== other.length) {
        throw new TypeError("Tried to dot multiply vector with array of unequal dimension: " + this.dimension.toString() + ", " + other.length.toString());
      }
      let to_return = 0;
      for (let i = 0; i < this.dimension; i++) {
        to_return += this.at(i) * other[i];
      }

      return to_return;
    }
  }

  project(onto) {
    if (onto.magnitude == 0) {
      return onto;
    }

    if (this.magnitude == 0) {
      return this;
    }

    let scalar = (this.dot(onto) / onto.dot(onto));
    return onto.scale(scalar);
  }

  distance_to(other) {
    return other.subtract(this).magnitude;
  }

  angle_to(other) {
    return other.subtract(this).angle;
  }

  abs_angle_between(other) {
    let h = this.magnitude;
    let a = this.project(other).magnitude;
    let o = this.project(other).subtract(this).magnitude;

    return Math.asin(o / h);
  }

  angle_between(other) {
    let theta = this.abs_angle_between(other);
    if (this.rotate(theta).abs_angle_between(other) > theta) {
      return -theta;
    }
    return theta;
  }

  rotate(theta) {
    return new Vector(this.x * Math.cos(theta) - this.y * Math.sin(theta), this.x * Math.sin(theta) + this.y * Math.cos(theta));
  }


  acute_with(other) {
    return this.dot(other) > 0;
  }

  obtuse_with(other) {
    return this.dot(other) < 0;
  }

  perpendicular_to(other) {
    return this.dot(other) == 0;
  }

  flip() {
    return new Vector(-this.at(0), -this.at(1));
  }

  transpose() {
    let to_return = [];
    for (let i = this.coord.length - 1; i >= 0; i--) {
      to_return.push(this.coord[i]);
    }
    return new Vector(to_return);
  }

  is_equal_to(other, precision = 5) {
    if (other instanceof Vector) {
      return other.coord[0].toFixed(precision) == this.coord[0].toFixed(precision) && other.coord[1].toFixed(precision) == this.coord[1].toFixed(precision);
    }

    return false;
  }

  lerp_towards(other, val = 0.01) {
    let to_other = this.to(other);
    return this.add(to_other.scale(val))
  }

  approach_average(other, val = 0.01) {
    let avg = this.add(other).scale(0.5);

    return this.lerp_towards(avg, val).coord;
  }

  approach_sum(other, val = 0.01) {
    let sum = this.add(other).scale(0.5);

    return this.lerp_towards(sum, val).coord;
  }

  to(other) {
    return other.subtract(this);
  }

  get["dimension"]() {
    return this.coord.length;
  }

  get["magnitude"]() {
    return Math.sqrt(this.dot(this));
  }

  get["angle"]() {
    return utils.angle_between([0, 0], this.coord);
  }

  get["perpendicular_r"]() {
    return new Vector(-this.at(1), this.at(0));
  }

  get["perpendicular_l"]() {
    return new Vector(this.at(1), -this.at(0));
  }

  get["x"]() {
    return this.coord[0];
  }

  get["y"]() {
    return this.coord[1];
  }

  set["x"](new_x) {
    this.coord[0] = new_x;
  }

  set["y"](new_y) {
    this.coord[1] = new_y;
  }
}
