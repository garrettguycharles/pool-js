import {dot, scale_coord, project, get_direction, distance_between, angle_between, distance_in_direction, add_coord, get_speed, radians, degrees} from "./utils.js";
import {Vector} from "./vector.js";
export class Rect {
  constructor(x, y, w, h) {
    this.position = new Vector(x, y);
    this.w = w;
    this.h = h;
    this.color = "black";
    this.velocity = new Vector(0, 0);
    this.mass = 1;
    this.vectors = {
      "topleft": new Vector(0, 0),
      "topright": new Vector(0, 0),
      "midtop": new Vector(0, 0),
      "midleft": new Vector(0, 0),
      "midright": new Vector(0, 0),
      "bottomleft": new Vector(0, 0),
      "midbottom": new Vector(0, 0),
      "bottomright": new Vector(0, 0),
      "center": new Vector(0, 0)
    };
  }

  colliderect(other) {
    if (this.right >= other.left && this.left <= other.right) {
      if (this.bottom >= other.top && this.top <= other.bottom) {
        return true;
      }
    }

    return false;
  }

  colliderect_x(other) {
    if (this.right >= other.left && this.left <= other.right) {
      return true;
    }
    return false;
  }

  colliderect_y(other) {
    if (this.bottom >= other.top && this.top <= other.bottom) {
      return true;
    }
    return false;
  }

  contains(other) {
    if (this.right >= other.right && this.left <= other.left) {
      if (this.bottom >= other.bottom && this.top <= other.top) {
        return true;
      }
    }
    return false;
  }

  contains_y(other) {
    if (this.bottom >= other.bottom && this.top <= other.top) {
      return true;
    }
    return false;
  }

  contains_x(other) {
    if (this.right >= other.right && this.left <= other.left) {
      return true;
    }
    return false;
  }

  contains_circle(other) {
    if (this.center.distance_to(other.center) + other.radius <= this.radius) {
      return true;
    }
    return false;
  }

  collidepoint(pos) {
    if (this.right >= pos[0] && this.left <= pos[0]) {
      if (this.bottom >= pos[1] && this.top <= pos[1]) {
        return true;
      }
    }

    return false;
  }

  collidepoint_x(x) {
    if (this.left <= x && this.right >= x) {
      return true;
    }
    return false;
  }

  collidepoint_circle(pos) {
    if (this.center.distance_to(pos) < this.radius) {
      return true;
    }
    return false;
  }

  collidepoint_y(y) {
    if (this.top <= y && this.bottom >= y) {
      return true;
    }
    return false;
  }

  collides_at_position(pos, other) {
    var temp = this.center.coord;
    this.x = pos[0];
    this.y = pos[1];
    let to_return = this.colliderect(other);
    this.center = temp;
    return to_return;
  }

  collidecircle(other) {
    let dist = this.radius + other.radius;
    if (this.center.distance_to(other.center) <= dist) {
      return true;
    } else {
      return false;
    }
  }

  move_in_direction(distance, theta) {
    this.center = this.center.add(distance_in_direction(distance, theta));
  }

  get_unit_normal(other) {
    return other.center.subtract(this.center).normalize();
  }

  get["x"]() {
    return this.position.at(0);
  }

  get["y"]() {
    return this.position.at(1);
  }

  set["x"](_x) {
    this.position.coord[0] = _x;
  }

  set["y"](_y) {
    this.position.coord[1] = _y;
  }

  get["radius"]() {
    return Math.min(this.w / 2, this.h / 2);
  }

  get["left"]() {
    return this.x;
  }

  set["left"](x) {
    this.x = x;
  }

  get["right"]() {
    return this.x + this.w;
  }

  set["right"](x) {
    this.x = x - this.w;
  }

  get["top"]() {
    return this.y;
  }

  set["top"](y) {
    this.y = y;
  }

  get["bottom"]() {
    return this.y + this.h;
  }

  set["bottom"](y) {
    this.y = y - this.h;
  }

  get["centerx"]() {
    return this.x + this.w / 2;
  }

  set["centerx"](x) {
    this.x = x - this.w / 2;
  }

  get["centery"]() {
    return this.y + this.h / 2;
  }

  set["centery"](y) {
    this.y = y - this.h / 2;
  }

  get["center"]() {
    this.vectors["center"].coord = [this.centerx, this.centery];
    return this.vectors["center"];
  }

  set["center"](coord) {
    if (coord instanceof Vector) {
      this.centerx = coord.at(0);
      this.centery = coord.at(1);
    } else {
      this.centerx = coord[0];
      this.centery = coord[1];
    }
  }

  get["topleft"]() {
    this.vectors["topleft"].coord = [this.left, this.top];
    return this.vectors["topleft"];
  }

  set["topleft"](coord) {
    if (coord instanceof Vector) {
      this.left = coord.at(0);
      this.top = coord.at(1);
    } else {
      this.left = coord[0];
      this.top = coord[1];
    }
  }

  get["midtop"]() {
    this.vectors["midtop"].coord = [this.centerx, this.top];
    return this.vectors["midtop"];
  }

  set["midtop"](coord) {
    if (coord instanceof Vector) {
      this.centerx = coord.at(0);
      this.top = coord.at(1);
    } else {
      this.centerx = coord[0];
      this.top = coord[1];
    }
  }

  get["topright"]() {
    this.vectors["topright"].coord = [this.right, this.top];
    return this.vectors["topright"];
  }

  set["topright"](coord) {
    if (coord instanceof Vector) {
      this.right = coord.at(0);
      this.top = coord.at(1);
    } else {
      this.right = coord[0];
      this.top = coord[1];
    }
  }


  get["midleft"]() {
    this.vectors["midleft"].coord = [this.left, this.centery];
    return this.vectors["midleft"];
  }

  set["midleft"](coord) {
    if (coord instanceof Vector) {
      this.left = coord.at(0);
      this.centery = coord.at(1);
    } else {
      this.left = coord[0];
      this.centery = coord[1];
    }
  }


  get["midright"]() {
    this.vectors["midright"].coord = [this.right, this.centery];
    return this.vectors["midright"];
  }

  set["midright"](coord) {
    if (coord instanceof Vector) {
      this.right = coord.at(0);
      this.centery = coord.at(1);
    } else {
      this.right = coord[0];
      this.centery = coord[1];
    }
  }


  get["bottomleft"]() {
    this.vectors["bottomleft"].coord = [this.left, this.bottom];
    return this.vectors["bottomleft"];
  }

  set["bottomleft"](coord) {
    if (coord instanceof Vector) {
      this.left = coord.at(0);
      this.bottom = coord.at(1);
    } else {
      this.left = coord[0];
      this.bottom = coord[1];
    }
  }


  get["midbottom"]() {
    this.vectors["midbottom"].coord = [this.centerx, this.bottom];
    return this.vectors["midbottom"];
  }

  set["midbottom"](coord) {
    if (coord instanceof Vector) {
      this.centerx = coord.at(0);
      this.bottom = coord.at(1);
    } else {
      this.centerx = coord[0];
      this.bottom = coord[1];
    }
  }


  get["bottomright"]() {
    this.vectors["bottomright"].coord = [this.right, this.bottom];
    return this.vectors["bottomright"];
  }

  set["bottomright"](coord) {
    if (coord instanceof Vector) {
      this.right = coord.at(0);
      this.bottom = coord.at(1);
    } else {
      this.right = coord[0];
      this.bottom = coord[1];
    }
  }


  get["major_dimension"]() {
    return Math.max(this.w, this.h);
  }

  get["minor_dimension"]() {
    return Math.min(this.w, this.h);
  }

}
