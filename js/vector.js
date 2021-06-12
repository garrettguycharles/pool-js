import * as utils from "./utils.js";

export class Vector {
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
