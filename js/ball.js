import {get_gravity, sphere_radius_to_volume, sphere_volume_to_radius, dot, scale_coord, project, get_direction, distance_between, angle_between, distance_in_direction, add_coord, get_speed, radians, degrees} from "./utils.js";
import {Vector} from "./vector.js";
import {Rect} from "./rect.js";
import {LineSegment} from "./line.js";

/*
TODO: make the ball class use a Vector for its position
Have the ball check the vectors between itself and all other balls to see if the projection
of that vector onto the ball's velocity is shorter than the ball's velocity,
and then check if the vector from the left and right sides of the ball to the center of the other ball
projected onto the ball's velocity is going to collidepoint_circle with the other ball.

If this is true, then the balls are going to collide within the next movement step of the ball, so
make a temporary collision check velocity for both balls, and have them both keep moving at that velocity in increments
until the collision is found or the balls miss by a very small margin.
*/

export class Ball extends Rect {
  constructor(x, y, r) {
    super(x, y, r, r);
    this.color = "black";
    this.velocity = new Vector(0, 0);
    this.rotation = new Vector(0, 0);
    this.radius = r;
    this.skidding = false;
    this.skid_distance = 0;
    this.distance_rolling_forward = 0;
  }

  bounce_inelastic_2d(other) {
    let both_new_velocity = this.velocity.scale(this.mass).add(other.velocity.scale(other.mass)).scale(1 / (this.mass + other.mass));
    this.velocity = both_new_velocity;
    other.velocity = both_new_velocity;
  }

  bounce_elastic_2d(other, damping = 1.05, normal_vect = null, set_other_velocity = true) {
    let n;
    if (normal_vect == null) {
      n = this.get_unit_normal(other);
    } else {
      n = normal_vect.normalize();
    }

    let t = new Vector(-n.at(1), n.at(0));

    let this_nvect = this.velocity.project(n);
    let other_nvect = other.velocity.project(n);
    let this_tvect = this.velocity.project(t);
    let other_tvect = other.velocity.project(t);

    let t_new_nvect = this_nvect.scale(this.mass - other.mass).add(other_nvect.scale(2 * other.mass)).scale(1 / (this.mass + other.mass));
    let o_new_nvect = other_nvect.scale(other.mass - this.mass).add(this_nvect.scale(2 * this.mass)).scale(1 / (other.mass + this.mass));

    //let t_new_nvect = scale_coord((add_coord(scale_coord(this_nvect, (this.mass - other.mass)), scale_coord(other_nvect, 2 * other.mass))), 1 / (damping * (this.mass + other.mass)));
    //let o_new_nvect = scale_coord((add_coord(scale_coord(other_nvect, (other.mass - this.mass)), scale_coord(this_nvect, 2 * this.mass))), 1 / (damping * (other.mass + this.mass)));

    let this_new_velocity = (t_new_nvect.add(this_tvect)).scale(1/damping);
    let other_new_velocity = (o_new_nvect.add(other_tvect)).scale(1/damping);

    this.velocity = this_new_velocity;

    if (set_other_velocity) {
      other.velocity = other_new_velocity;
    }
  }

  bouncecircle_inner(other, damping = 1, set_other_velocity = false) {
    if (other.contains_circle(this)) {
      return;
    }

    if (this.center.distance_to(other.center) > this.center.add(this.velocity).distance_to(other.center)) {
      return;
    }

    let normal = other.center.subtract(this.center).normalize();

    while (!other.contains_circle(this)) {
      this.center = this.center.add(normal);
    }

    this.bounce_elastic_2d(other, damping, normal, set_other_velocity);
  }

  move_outside_circle(other, move_this_only = false) {
    if (this.collidecircle(other)) {
      let dir = other.center.angle_to(this.center);
      let targ_dist = this.radius + other.radius;
      let curr_dist = this.center.distance_to(other.center);
      let move_dist = targ_dist - curr_dist;

      let clearance = 1;

      if (this.velocity.magnitude === 0 && other.velocity.magnitude === 0) {
        if (this.mass < other.mass) {
          this.move_in_direction(move_dist + clearance, dir);
        } else {
          other.move_in_direction(-(move_dist + clearance), dir);
        }
      } else {
        let t_mag = this.velocity.magnitude;
        let o_mag = other.velocity.magnitude;

        while (t_mag > 1 || o_mag > 1) {
          t_mag /= 2;
          o_mag /= 2;
        }

        let this_back_vect = this.velocity.flip();
        let other_back_vect = other.velocity.flip();

        if (this_back_vect.magnitude > 0) {
          this_back_vect = this_back_vect.scale(t_mag / this_back_vect.magnitude);
        }

        if (other_back_vect.magnitude > 0) {
          other_back_vect = other_back_vect.scale(o_mag / other_back_vect.magnitude);
        }


        while (this.collidecircle(other)) {
          this.center = this.center.add(this_back_vect);
          other.center = other.center.add(other_back_vect.coord);
        }


      }
    }
  }

  bouncerect_inner(other, damping = 1) {
    if (other.contains(this)) {
      return;
    }

    if (this.left < other.left) {
      this.left = other.left;
      this.xspeed = (1 / damping) * Math.abs(this.xspeed);
    }
    if (this.top < other.top) {
      this.top = other.top;
      this.yspeed = (1 / damping) * Math.abs(this.yspeed);
    }
    if (this.right > other.right) {
      this.right = other.right;
      this.xspeed = -(1 / damping) * Math.abs(this.xspeed);
    }
    if (this.bottom > other.bottom) {
      this.bottom = other.bottom;
      this.yspeed = -(1 / damping) * Math.abs(this.yspeed);
    }
  }

  next_step_collidecircle_with(other) {
    if (this.velocity.magnitude === 0) {
      return false;
    }

    let frame_velocity = this.velocity.subtract(other.velocity);

    let to_other = other.center.subtract(this.center);

    let forward = to_other.project(frame_velocity);
    let sideways = to_other.subtract(forward);

    if (sideways.magnitude > this.radius * 2) {
      // the other ball is not in our path;
      return false;
    }

    if (forward.magnitude > frame_velocity.magnitude + this.radius * 2) {
      // this ball will not reach the other in the next next_step
      return false;
    }

    if (!forward.acute_with(frame_velocity)) {
      // the ball is not in our forward path
      return false;
    }

    let a = sideways.magnitude / 2;
    let theta = Math.acos(a / this.radius);
    let o = a * Math.tan(theta);

    if (a == 0) {
      o = this.radius + other.radius;
    }

    if (forward.magnitude > frame_velocity.magnitude + o * 2) {
      return false;
    }

    let move_scale_for_contact = (forward.magnitude - 2 * o) / frame_velocity.magnitude;

    return move_scale_for_contact;

  }

  next_step_can_reach_rect(other) {
    if (this.colliderect(other)) {
      return true;
    }

    if (this.collides_at_position(this.position.add(this.velocity).coord, other)) {
      return true;
    }

    let other_rect_lines = [
      new LineSegment(other.topleft, other.topright),
      new LineSegment(other.topright, other.bottomright),
      new LineSegment(other.bottomright, other.bottomleft),
      new LineSegment(other.bottomleft, other.topleft)
    ];

    let this_vel_lines = [
      new LineSegment(this.topleft, this.topleft.add(this.velocity)),
      new LineSegment(this.bottomright, this.bottomright.add(this.velocity)),
      new LineSegment(this.topright, this.topright.add(this.velocity)),
      new LineSegment(this.bottomleft, this.bottomleft.add(this.velocity))
    ];

    for (let i = 0; i < this_vel_lines.length; i++) {
      for (let j = 0; j < other_rect_lines.length; j++) {
        if (this_vel_lines[i].intersects(other_rect_lines[j])) {
          return true;
        }
      }
    }

    return false;
  }

  next_step_containscircle_in(other) {

    if (other.contains_circle(this)) {
      return 0;
    }

    let to_other = this.center.to(other.center);
    let forward = to_other.project(this.velocity);
    let sideways = to_other.subtract(forward);

    if (forward.acute_with(this.velocity) && forward.magnitude < this.velocity.magnitude) {
      if (sideways.magnitude + this.radius <= other.radius) {
        let move_to_contains_scale = forward.magnitude / this.velocity.magnitude;
        return move_to_contains_scale;
      }
    }

    return false;
  }

  next_step_collideshape_with(other) {
    if (this.velocity.magnitude === 0) {
      return false;
    }

    if (!(this.next_step_can_reach_rect(other))) {
      return false;
    }

    let left_ball_point = this.center.add(this.velocity.perpendicular_l.normalize().scale(this.radius));
    let right_ball_point = this.center.add(this.velocity.perpendicular_r.normalize().scale(this.radius));

    let left_path_line = new LineSegment(
      left_ball_point,
      left_ball_point.add(this.velocity.scale((this.velocity.magnitude + this.radius) / this.velocity.magnitude))
    );

    let right_path_line = new LineSegment(
      right_ball_point,
      right_ball_point.add(this.velocity.scale((this.velocity.magnitude + this.radius) / this.velocity.magnitude))
    );

    let face = null;
    let corner = false;

    let faces = other.get_faces();

    for (let f of faces) {
      let face_line = new LineSegment(f.left, f.right);
      if (face_line.intersects(left_path_line) || face_line.intersects(right_path_line)) {
        let faceward = f.l_to_r;
        let faceward_vel = this.velocity.project(faceward);
        let normal_vel = this.velocity.project(f.outward);
        let to_left = this.center.to(f.left);
        let to_right = this.center.to(f.right);
        let normal = to_left.project(f.outward);
        let ball_contact_point = this.center.add(normal.normalize().scale(this.radius));
        let intersection = ball_contact_point.add(this.velocity.scale((normal.magnitude - this.radius) / normal_vel.magnitude));

        if (normal_vel.magnitude + this.radius >= normal.magnitude) {
          // the ball may reach the face in the next step
          if (normal.acute_with(normal_vel) && normal_vel.obtuse_with(f.outward)) {
            // the ball is moving towards the face
            let l_to_intersection = f.left.to(intersection);
            let r_to_intersection = f.right.to(intersection);
            if (l_to_intersection.magnitude < faceward.magnitude && r_to_intersection.magnitude < faceward.magnitude) {
              // the ball will intersect with this face on the next step.
              face = f;
              break;
            }
          }
        }
      }
    }



    if (face == null) {
      // ball may be colliding with a corner

      let closest_distance = null;
      for (let i = 1; i < faces.length; i++) {
        let to_corner = this.center.to(faces[i].left);
        if (closest_distance == null || to_corner.magnitude < closest_distance) {
          let forward = to_corner.project(this.velocity);
          let sideways = to_corner.subtract(forward);

          if (sideways.magnitude <= this.radius && forward.magnitude <= this.velocity.magnitude + this.radius) {
            // the corner may be in our path
            if (forward.acute_with(this.velocity)) {
              // the corner is in our path.
              closest_distance = to_corner.magnitude;
              face = faces[i];
              corner = true;
            }
          }
        }
      }
    }

    if (face == null) {
      return false;
    }

    if (corner) {
      let to_corner = this.center.to(face.left);
      let forward = to_corner.project(this.velocity);
      let sideways = to_corner.subtract(forward);

      let a = sideways.magnitude;
      let theta = Math.acos(a / this.radius);
      let o = a * Math.tan(theta);

      if (forward.magnitude > this.velocity.magnitude + o) {
        return false;
      }

      let move_scale_for_contact = (forward.magnitude - o) / this.velocity.magnitude;

      return move_scale_for_contact;
    } else {
      let normal = this.center.to(face.left).project(face.outward);
      let n_vel = this.velocity.project(normal);
      let move_scale_for_contact = (normal.magnitude - this.radius) / n_vel.magnitude;
      return move_scale_for_contact;
    }
  }

  move() {
    this.position = this.position.add(this.velocity);
    if (this.skidding) {
      this.skid_distance = Math.max(0, this.skid_distance - this.velocity.magnitude);
      if (this.skid_distance === 0) {
        this.skidding = false;
      }
    }

    if (this.rotation.magnitude > 0) {
      this.distance_rolling_forward = 0;
    } else {
      this.distance_rolling_forward += this.velocity.magnitude;
    }
  }


  apply_friction(g, mu_rolling = 0.01, mu_skidding = 0.2) {
    let old_mag = this.velocity.magnitude;
    if (old_mag === 0) {
      return;
    }
    let to_root;
    if (this.skidding) {
      to_root = old_mag * old_mag - 2 * mu_skidding * old_mag * g;
    } else {
      to_root = old_mag * old_mag - 2 * mu_rolling * old_mag * g;
    }

    if (to_root <= 0) {
      return;
    }

    let new_magnitude = Math.sqrt(to_root);

    this.velocity = this.velocity.scale(new_magnitude / old_mag);


  }

  apply_rotation(g, mu_rolling = 0.01, mu_skidding = 0.2) {
    let old_rot = this.rotation.magnitude;
    if (old_rot < 0.001) {
      return;
    }
    let to_root;
    if (this.skidding) {
      to_root = old_rot * old_rot - 2 * 0.005 * old_rot * g;
    } else {
      to_root = old_rot * old_rot - 2 * mu_skidding * old_rot * g;
    }

    if (to_root <= 0) {
      this.rotation = this.rotation.scale(0);
      return;
    }

    let new_rot = Math.sqrt(to_root);

    let change = (old_rot - new_rot) / old_rot;

    let vel_change = this.rotation.scale(change);

    change *= 3;

    let english_coefficient = 0.3;

    this.velocity = this.velocity.add(vel_change);
    this.rotation = this.rotation.scale(1 - change);
  }

  start_skid(g, mu_skidding = 0.2) {
    this.skidding = true;
    this.skid_distance = (12 * this.velocity.magnitude * this.velocity.magnitude) / (49 * mu_skidding * g);
  }

  get["momentum"]() {
    return this.velocity.magnitude * this.mass;
  }

  get["xspeed"]() {
    return this.velocity.at(0);
  }

  set["xspeed"](val) {
    this.velocity.coord[0] = val;
  }

  get["yspeed"]() {
    return this.velocity.at(1);
  }

  set["yspeed"](val) {
    this.velocity.coord[1] = val;
    this.velocity.coord[1] = val;
  }

  get["radius"]() {
    return this.w / 2;
  }

  set["radius"](r) {
    this.w = r * 2;
    this.h = r * 2;
    this.mass = sphere_radius_to_volume(r);
  }

  get["left_edge_point"]() {
    if (this.velocity.magnitude === 0) {
      return this.center;
    }
    return this.center.add(this.velocity.perpendicular_l.normalize().scale(this.radius));
  }

  get["right_edge_point"]() {
    if (this.velocity.magnitude === 0) {
      return this.center;
    }
    return this.center.add(this.velocity.perpendicular_r.normalize().scale(this.radius));
  }


}
