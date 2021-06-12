import {Vector} from "./vector.js";

export class Face {
  constructor(left, right) {
    if (left instanceof Vector) {
      this.left = left;
    } else {
      this.left = new Vector(left);
    }

    if (right instanceof Vector) {
      this.right = right;
    } else {
      this.right = new Vector(right);
    }

    this.vectors = {
      "outward": null,
      "inward": null,
      "l_to_r": null
    };

    this.attributes = {
      "magnitude": null
    };
  }

  get["l_to_r"]() {
    if (this.vectors["l_to_r"] == null) {
      this.vectors["l_to_r"] = this.left.to(this.right);
    }

    return this.vectors["l_to_r"];
  }

  get["outward"]() {
    if (this.vectors["outward"] == null) {
      this.vectors["outward"] = this.l_to_r.perpendicular_l.normalize();
    }
    return this.vectors["outward"];
  }

  get["inward"]() {
    if (this.vectors["inward"] == null) {
      this.vectors["inward"] = this.l_to_r.perpendicular_r.normalize();
    }
    return this.vectors["inward"];
  }

  get["magnitude"]() {
    if (this.attributes["magnitude"] == null) {
      this.attributes["magnitude"] = this.l_to_r.magnitude;
    }
    return this.attributes["magnitude"];
  }
}
