import * as utils from "./utils.js";
import {Rect} from "./rect.js";
import {Vector} from "./vector.js";
import {Face} from "./face.js";

export class Bumper extends Rect {
  constructor(table, left, right, left_angle, right_angle, thickness, pocket_radius) {
    super(0, 0, 10, 10);

    this.faces = {
      "left": null,
      "front": null,
      "right": null
    };

    this.outward_dir = left.angle_to(right) + 90;
    this.thickness = thickness;
    let r_45 = (2 / Math.sqrt(2));

    if (left_angle == 45) {
      this.inner_left = left.add(utils.distance_in_direction(pocket_radius * r_45, this.outward_dir - 90));
    } else {
      let left_mouth_radius = pocket_radius + pocket_radius * Math.tan(utils.radians(left_angle));
      this.inner_left = left.add(utils.distance_in_direction(left_mouth_radius, this.outward_dir - 90));
    }

    if (right_angle == 45) {
      this.inner_right = right.add(utils.distance_in_direction(pocket_radius * r_45, this.outward_dir + 90));
    } else {
      let right_mouth_radius = pocket_radius + pocket_radius * Math.tan(utils.radians(right_angle));
      this.inner_right = right.add(utils.distance_in_direction(right_mouth_radius, this.outward_dir + 90));
    }

    this.outer_left = this.inner_left.add(utils.distance_in_direction(thickness, this.outward_dir));
    this.outer_left = this.outer_left.add(utils.distance_in_direction(thickness * Math.tan(utils.radians(left_angle)), this.outward_dir + 90));

    this.outer_right = this.inner_right.add(utils.distance_in_direction(thickness, this.outward_dir));
    this.outer_right = this.outer_right.add(utils.distance_in_direction(thickness * Math.tan(utils.radians(right_angle)), this.outward_dir - 90));

    this.faces["left"] = new Face(this.inner_left.add(this.inner_left.to(this.outer_left).scale(12)), this.inner_left);
    this.faces["front"] = new Face(this.inner_left, this.inner_right);
    this.faces["right"] = new Face(this.inner_right, this.inner_right.add(this.inner_right.to(this.outer_right).scale(12)));

    this.left = Math.min(this.left_face.left.at(0), this.left_face.right.at(0), this.right_face.left.at(0), this.right_face.right.at(0));
    this.top = Math.min(this.left_face.left.at(1), this.left_face.right.at(1), this.right_face.left.at(1), this.right_face.right.at(1));
    this.w = Math.max(this.left_face.left.at(0), this.left_face.right.at(0), this.right_face.left.at(0), this.right_face.right.at(0)) - this.left;
    this.h = Math.max(this.left_face.left.at(1), this.left_face.right.at(1), this.right_face.left.at(1), this.right_face.right.at(1)) - this.top;

    this.mass = 1000000;
    this.velocity = new Vector(0, 0);
  }

  bounce_ball(ball) {

    // if (!ball.colliderect(this)) {
      //return;
    // }

    let face, normal, tangent;
    let corner = false;
    let damping = 2;

    if (this.front_face_length > this.front_face.left.to(ball.center).project(this.front_tangent).magnitude
      && this.front_face_length > this.front_face.right.to(ball.center).project(this.front_tangent).magnitude) {

      face = this.front_face;
      normal = this.front_normal;
      tangent = this.front_tangent;
      damping = (1 / 0.7);

    } else if (this.left_face_length > this.left_face.left.to(ball.center).project(this.left_tangent).magnitude
      && this.left_face_length > this.left_face.right.to(ball.center).project(this.left_tangent).magnitude) {

      face = this.left_face;
      normal = this.left_normal;
      tangent = this.left_tangent;

    } else if (this.right_face_length > this.right_face.left.to(ball.center).project(this.right_tangent).magnitude
      && this.right_face_length > this.right_face.right.to(ball.center).project(this.right_tangent).magnitude) {

      face = this.right_face;
      normal = this.right_normal;
      tangent = this.right_tangent;
    } else {
      corner = true;
      if (this.front_face.left.to(ball.center).acute_with(this.front_face.outward)) {
        if (ball.center.distance_to(this.front_face.left) < ball.center.distance_to(this.right_face.left)) {
          face = this.front_face;
          normal = this.front_face.left.to(ball.center).normalize();
          tangent = this.front_tangent;
        } else {
          face = this.right_face;
          normal = this.right_face.left.to(ball.center).normalize();
          tangent = this.right_tangent;
        }
      } else {
        if (ball.center.distance_to(this.left_face.left) < ball.center.distance_to(this.right_face.right)) {
          face = this.left_face;
          normal = this.left_normal;
          tangent = this.left_tangent;
        } else {
          face = this.right_face;
          normal = this.right_normal;
          tangent = this.right_tangent;
        }
      }
    }

    //if (face.left.to(ball.center).project(normal).magnitude > ball.radius) {
      // the ball is not touching the bumper
      // return;
    //}

    /*
    while (face.left.to(ball.center).project(normal).magnitude <= ball.radius) {
      ball.center = ball.center.add(normal);
    }
    */

    let angle_of_incidence = normal.flip().angle - ball.velocity.angle;
    damping = 1 + (damping - 1) * Math.cos(utils.radians(angle_of_incidence));

    ball.bounce_elastic_2d(this, damping, normal, false);
  }

  get_faces() {
    return [this.left_face, this.front_face, this.right_face];
  }

  get["front_normal"]() {
    return this.front_face.outward;
  }

  get["left_normal"]() {
    return this.left_face.outward;
  }

  get["right_normal"]() {
    return this.right_face.outward;
  }

  get["front_face"]() {
    return this.faces["front"];
  }

  get["front_tangent"]() {
    return this.front_face.l_to_r;
  }

  get["left_face"]() {
    return this.faces["left"];
  }

  get["left_tangent"]() {
    return this.left_face.l_to_r;
  }

  get["right_face"]() {
    return this.faces["right"]
  }

  get["right_tangent"]() {
    return this.right_face.l_to_r;
  }

  get["front_face_length"]() {
    return this.front_face.magnitude;
  }

  get["left_face_length"]() {
    return this.left_face.magnitude;
  }

  get["right_face_length"]() {
    return this.right_face.magnitude;
  }
}
