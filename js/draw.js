import * as utils from "./utils.js";
import {Rect} from "./rect.js";

export class DrawTool {
  constructor(canvas, screen) {
    this.canvas = canvas;
    this.screen = screen;
    this.context = canvas.getContext('2d');
    this.felt_color = this.context.createRadialGradient(this.screen.centerx, this.screen.centery, this.screen.radius / 2, this.screen.centerx, this.screen.centery, this.screen.major_dimension);
    this.felt_color.addColorStop(0, "#155843");
    this.felt_color.addColorStop(1, "#033621");

    this.rail_color = this.context.createRadialGradient(this.screen.centerx, this.screen.centery, this.screen.radius / 2, this.screen.centerx, this.screen.centery, this.screen.major_dimension);
    this.rail_color.addColorStop(0, "#a88250");
    this.rail_color.addColorStop(1, "#593c15");

  }

  set["ctx"](ctx) {
    this.context = ctx;
  }

  get["ctx"]() {
    return this.context;
  }

  clear(fill = "white") {
    this.ctx.fillStyle = fill;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  rect(r, filled = true, color = null) {
    if (filled) {
      this.ctx.fillStyle = color || r.color;
      this.ctx.fillRect(r.x, r.y, r.w, r.h);
    } else {
      this.ctx.strokeStyle = color || r.color;
      this.ctx.strokeRect(r.x, r.y. r.w, r.h);
    }
  }

  ellipse(r, filled = true, color = null) {
    this.ctx.beginPath();
    this.ctx.ellipse(r.centerx, r.centery, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
    if (filled) {
      this.ctx.fillStyle = color || r.color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color || r.color;
      this.ctx.stroke();
    }
  }

  crown(r) {
    var circle_radius = Math.min(r.w / 8, r.h / 8)
    var point1 = [r.left + circle_radius, r.top + circle_radius * 3];
    var point2 = [r.centerx, r.top + circle_radius];
    var point3 = [r.right - circle_radius, r.top + circle_radius * 3];
    var inner_l = [r.left + r.w / 3, r.top + 3 * r.h / 5];
    var inner_r = [r.right - r.w / 3, r.top + 3 * r.h / 5];
    var bottomleft = [r.left + circle_radius * 2, r.bottom];
    var bottomright = [r.right - circle_radius * 2, r.bottom];

    var circle_points = [point1, point2, point3];

    this.ctx.fillStyle = r.color;

    this.ctx.beginPath();
    this.ctx.moveTo(point1[0], point1[1]);
    this.ctx.lineTo(bottomleft[0], bottomleft[1]);
    this.ctx.lineTo(bottomright[0], bottomright[1]);
    this.ctx.lineTo(point3[0], point3[1]);
    this.ctx.lineTo(inner_r[0], inner_r[1]);
    this.ctx.lineTo(point2[0], point2[1]);
    this.ctx.lineTo(inner_l[0], inner_l[1]);
    this.ctx.lineTo(point1[0], point1[1]);
    this.ctx.fill();

    for (let p = 0; p < circle_points.length; p++) {
      this.ctx.beginPath();
      this.ctx.arc(circle_points[p][0], circle_points[p][1], circle_radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  line_interp_width(from, to, w1, w2) {
    var x1 = from[0];
    var y1 = from[1];
    var x2 = to[0];
    var y2 = to[1];

    var dx = (x2 - x1)
    var shiftx = 0;
    var dy = (y2 - y1)
    var shifty = 0;

    w1 /= 2;
    w2 /= 2;

    var length = utils.distance_between(from, to);

    if (length < 0) {
      return;
    }

    dx /= length;
    dy /= length;
    shiftx = -dy * w1;
    shifty = dx * w1;
    var angle = Math.atan2(shifty, shiftx);
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + shiftx, y1 + shifty);
    this.ctx.arc(x1, y1, w1, angle, angle + Math.PI);
    shiftx = -dy * w2 ;
    shifty = dx * w2 ;
    this.ctx.lineTo(x2 - shiftx, y2 - shifty);
    this.ctx.arc(x2, y2, w2, angle + Math.PI, angle);
    this.ctx.closePath();
    this.ctx.fill();
  }

  pool_ball(b) {

    let white_gradient = this.ctx.createRadialGradient(b.centerx, b.centery, b.radius / 5, b.centerx, b.centery, b.radius);
    white_gradient.addColorStop(0.3, "#ffffff");
    white_gradient.addColorStop(0.8, "#dddddd");
    white_gradient.addColorStop(1, "#aaaaaa");

    let color_gradient = this.ctx.createRadialGradient(b.centerx, b.centery, b.radius / 5, b.centerx, b.centery, b.radius);
    color_gradient.addColorStop(0.2, utils.add_hex_colors(b.color, "#222222"));
    color_gradient.addColorStop(0.6, b.color);
    color_gradient.addColorStop(1, utils.subtract_hex_colors(b.color, "#282828"));

    this.ctx.font = (1 * b.radius / 2).toString() + 'px arial';

    if (b.stripe) {
      this.ctx.beginPath();
      this.ctx.ellipse(b.centerx, b.centery, b.radius, b.radius, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = white_gradient;
      this.ctx.fill();

      let bl = 180 + 35;
      let tl = 180 - 35;
      let br = -35;
      let tr = 35;

      this.ctx.beginPath();
      this.move_to(utils.add_coord(b.center, utils.distance_in_direction(b.radius, bl)));
      this.ctx.ellipse(b.centerx, b.centery, b.radius, b.radius, 0, utils.radians(bl), utils.radians(tl), true);
      this.line_to(utils.add_coord(b.center, utils.distance_in_direction(b.radius, tr)));
      this.ctx.ellipse(b.centerx, b.centery, b.radius, b.radius, 0, utils.radians(tr), utils.radians(br), true);
      this.ctx.closePath();
      this.ctx.fillStyle = color_gradient;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.ellipse(b.centerx, b.centery, b.radius / 3, b.radius / 3, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = white_gradient;
      this.ctx.fill();

      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(b.number.toString(), b.centerx, b.centery);
    }

    if (b.solid) {
      this.ctx.beginPath();
      this.ctx.ellipse(b.centerx, b.centery, b.radius, b.radius, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = color_gradient;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.ellipse(b.centerx, b.centery, b.radius / 3, b.radius / 3, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = white_gradient;
      this.ctx.fill();

      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(b.number.toString(), b.centerx, b.centery + b.radius / 10);
    }

    if (b.cue) {
      this.ctx.beginPath();
      this.ctx.ellipse(b.centerx, b.centery, b.radius, b.radius, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = white_gradient;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.ellipse(b.centerx - b.radius / 2, b.centery - b.radius / 3, b.radius / 8, b.radius / 8, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = "red";
      this.ctx.fill();
    }
  }

  aim_line(cue_ball, mouse_pos) {
    let dir = cue_ball.center.angle_to(mouse_pos);
    let distance = mouse_pos.distance_to(cue_ball.center);
    let line_distance = cue_ball.radius * 6;
    let line_max_width = 20;

    let start = cue_ball.center.add(utils.distance_in_direction(cue_ball.radius * 1.25, dir));
    let end = cue_ball.center.add(utils.distance_in_direction(line_distance, dir));

    this.ctx.beginPath();
    this.move_to(start.coord);
    this.line_to(end.coord);
    this.ctx.lineWidth = utils.clamp(2, line_max_width * (1 - cue_ball.radius * 10 / distance), line_max_width);
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();

    let forward = mouse_pos.subtract(cue_ball.center);
    let sideways = forward.perpendicular_l.normalize();
    let left_start = cue_ball.center.add(sideways.scale(cue_ball.radius));
    let right_start = cue_ball.center.add(sideways.scale(-cue_ball.radius));
    let left_end = left_start.add(forward);
    let right_end = right_start.add(forward);

    this.ctx.beginPath();
    this.move_to(left_start.coord);
    this.line_to(left_end.coord);
    this.ctx.arc(mouse_pos.x, mouse_pos.y, cue_ball.radius, utils.radians(sideways.angle), utils.radians(sideways.angle) + Math.PI * 2);
    this.move_to(right_end.coord);
    this.line_to(right_start.coord);
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();


  }

  face(f) {
    this.ctx.beginPath();
    this.move_to(f.left.coord);
    this.line_to(f.right.coord);
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = "red";
    this.ctx.stroke();
  }

  faces(shape) {
    let faces_list = shape.get_faces();
    for (let i = 0; i < faces_list.length; i++) {
      this.face(faces_list[i]);
    }
  }

  rounded_rect(rect, corner_radius, filled = true, color=null) {
    this.ctx.beginPath();
    let inner_rect = new Rect(0, 0, rect.w - corner_radius * 2, rect.h - corner_radius * 2);
    inner_rect.center = rect.center;
    this.ctx.beginPath();
    //this.move_to(utils.add_coord([corner_radius, 0], rect.topleft));
    //this.line_to(utils.add_coord([-corner_radius, 0], rect.topright));
    this.ctx.arc(inner_rect.right, inner_rect.top, corner_radius, -Math.PI / 2, 0);
    //this.move_to(utils.add_coord(inner_rect.topright, [corner_radius, 0]));
    //this.line_to(utils.add_coord(inner_rect.bottomright, [corner_radius, 0]));
    this.ctx.arc(inner_rect.right, inner_rect.bottom, corner_radius, 0, Math.PI / 2);

    //this.move_to(utils.add_coord(inner_rect.bottomright, [0, corner_radius]));
    //this.line_to(utils.add_coord(inner_rect.bottomleft, [0, corner_radius]));
    this.ctx.arc(inner_rect.left, inner_rect.bottom, corner_radius, Math.PI / 2, Math.PI);
    //this.move_to(utils.add_coord(inner_rect.bottomleft, [-corner_radius, 0]));
    //this.line_to(utils.add_coord(inner_rect.topleft, [-corner_radius, 0]));
    this.ctx.arc(inner_rect.left, inner_rect.top, corner_radius, Math.PI, 3 * Math.PI / 2);

    this.ctx.closePath();
    if (filled) {
      this.ctx.fillStyle = color || rect.color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color || rect.color;
      this.ctx.stroke();
    }

  }

  pool_table(screen, table, pockets_list, bumper_list, side_pocket_mouth_angle = 15) {
    let corner_pocket_mouth_angle = 45;
    let rail_thickness = (screen.w - table.w) / 2;
    let bumper_thickness = rail_thickness * (2/7);
    let pocket_radius = pockets_list[0].radius;
    let draw_pocket_radius = pocket_radius - 0.5 * bumper_thickness;

    this.rounded_rect(screen, pocket_radius, true, this.rail_color);
    this.rect(table, true, this.felt_color);

    // draw top left pocket
    let topleft = this.corner_pocket(table.topleft, pockets_list[0], rail_thickness, bumper_thickness, 45);

    // draw top right pocket
    let topright = this.corner_pocket(table.topright, pockets_list[2], rail_thickness, bumper_thickness, 135);

    // draw bottom left pocket
    let bottomleft = this.corner_pocket(table.bottomleft, pockets_list[3], rail_thickness, bumper_thickness, -45);

    // draw bottom right pocket_list
    let bottomright = this.corner_pocket(table.bottomright ,pockets_list[5], rail_thickness, bumper_thickness, -135);

    if (table.h == table.minor_dimension) {
      // draw top middle pocket
      this.side_pocket(table.midtop, pockets_list[1], rail_thickness, bumper_thickness, 90, side_pocket_mouth_angle);
      // draw bottom middle pocket
      this.side_pocket(table.midbottom, pockets_list[4], rail_thickness, bumper_thickness, -90, side_pocket_mouth_angle);
    } else {
      // draw left middle pocket
      this.side_pocket(table.midleft, pockets_list[1], rail_thickness, bumper_thickness, 0, side_pocket_mouth_angle);
      // draw right middle pocket
      this.side_pocket(table.midright, pockets_list[4], rail_thickness, bumper_thickness, 180, side_pocket_mouth_angle);
    }


    for (let i = 0; i < bumper_list.length; i++) {
      this.bumper(bumper_list[i]);
    }

  }

  bumper(b) {

    let start = b.inner_left;

    let gradient_end = start.add(utils.distance_in_direction(b.thickness, b.outward_dir));

    let gradient = this.ctx.createLinearGradient(start.at(0), start.at(1), gradient_end.at(0).toFixed(2), gradient_end.at(1).toFixed(2));
    gradient.addColorStop(0, "#033621");
    gradient.addColorStop(0.1, "#044621");
    gradient.addColorStop(0.6, "#155843");


    this.ctx.beginPath();
    this.move_to(b.inner_left.coord);
    this.line_to(b.outer_left.coord);
    this.line_to(b.outer_right.coord);
    this.line_to(b.inner_right.coord);
    this.ctx.closePath();
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // this.faces(b);
  }

  corner_pocket(table_corner, pocket, rail_thickness, bumper_thickness, outward_dir) {
    let pocket_radius = pocket.radius;
    let pocket_thickness = bumper_thickness * 0.7;

    let gradient = this.ctx.createRadialGradient(pocket.centerx, pocket.centery, pocket_radius, pocket.centerx, pocket.centery, pocket_radius + pocket_thickness * 2);
    gradient.addColorStop(0.1, "#2b100a");
    gradient.addColorStop(0.25, "#4d310c");
    gradient.addColorStop(0.5, "#2b100a");
    gradient.addColorStop(1, "#1a0009");

    let r_45 = (2 / Math.sqrt(2));
    //let table_corner = utils.add_coord(pocket.center, utils.distance_in_direction(pocket_radius, outward_dir));
    let left_corner = table_corner.add(utils.distance_in_direction(pocket_radius * r_45, outward_dir - 45));
    let left_point = left_corner.add(utils.distance_in_direction(pocket_thickness * r_45, outward_dir - 45));
    let right_corner = table_corner.add(utils.distance_in_direction(pocket_radius * r_45, outward_dir + 45));
    let right_point = right_corner.add(utils.distance_in_direction(pocket_thickness * r_45, outward_dir + 45));
    let inner_left_radius_point = pocket.center.add(utils.distance_in_direction(pocket_radius, outward_dir - 90));
    let outer_left_radius_point = inner_left_radius_point.add(utils.distance_in_direction(pocket_thickness, outward_dir - 90));
    let inner_right_radius_point = pocket.center.add(utils.distance_in_direction(pocket_radius, outward_dir + 90));
    let outer_right_radius_point = inner_left_radius_point.add(utils.distance_in_direction(pocket_thickness, outward_dir + 90));

    this.ctx.beginPath();
    this.move_to(inner_left_radius_point.coord);
    this.line_to(left_corner.coord);
    this.line_to(right_corner.coord);
    this.line_to(inner_right_radius_point.coord);
    this.ctx.closePath();
    this.ctx.fillStyle = this.felt_color;
    this.ctx.fill();

    this.ellipse(pocket);

    for (let i = 0; i < pocket.balls_in_pocket.length; i++) {
      this.pool_ball(pocket.balls_in_pocket[i]);
    }

    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    this.move_to(inner_left_radius_point.coord);
    this.line_to(left_corner.coord);
    this.line_to(left_point.coord);
    this.line_to(outer_left_radius_point.coord);
    this.ctx.arc(pocket.centerx, pocket.centery, pocket_radius + pocket_thickness, utils.radians(outward_dir - 90), utils.radians(outward_dir - 270), true);
    this.line_to(right_point.coord);
    this.line_to(right_corner.coord);
    this.ctx.arc(pocket.centerx, pocket.centery, pocket_radius, utils.radians(outward_dir - 270), utils.radians(outward_dir - 90));
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    return [left_corner, right_corner];
  }

  side_pocket(table_anchor, pocket, rail_thickness, bumper_thickness, outward_dir, mouth_angle = 15) {
    let pocket_thickness = bumper_thickness * 0.7;
    let pocket_radius = pocket.radius;

    let pocket_center = table_anchor.add(utils.distance_in_direction(pocket_radius, outward_dir + 180));

    let mouth_radius = pocket_radius + pocket_radius * Math.tan(utils.radians(mouth_angle));

    let gradient = this.ctx.createRadialGradient(pocket_center.at(0), pocket_center.at(1), pocket_radius, pocket_center.at(0), pocket_center.at(1), pocket_radius + pocket_thickness * 2);
    gradient.addColorStop(0.1, "#2b100a");
    gradient.addColorStop(0.25, "#4d310c");
    gradient.addColorStop(0.5, "#2b100a");
    gradient.addColorStop(1, "#1a0009");

    let table_corner = pocket_center.add(utils.distance_in_direction(pocket_radius, outward_dir));
    let left_corner = table_corner.add(utils.distance_in_direction(mouth_radius, outward_dir - 90));
    let left_point = left_corner.add(utils.distance_in_direction(pocket_thickness, outward_dir - 90));
    let right_corner = table_corner.add(utils.distance_in_direction(mouth_radius, outward_dir + 90));
    let right_point = right_corner.add(utils.distance_in_direction(pocket_thickness, outward_dir + 90));
    let inner_left_radius_point = pocket_center.add(utils.distance_in_direction(pocket_radius, outward_dir - (90 + mouth_angle)));
    let outer_left_radius_point = inner_left_radius_point.add(utils.distance_in_direction(pocket_thickness, outward_dir - (90 + mouth_angle)));
    let inner_right_radius_point = pocket_center.add(utils.distance_in_direction(pocket_radius, outward_dir + (90 + mouth_angle)));
    let outer_right_radius_point = inner_left_radius_point.add(utils.distance_in_direction(pocket_thickness, outward_dir + (90 + mouth_angle)));

    this.ctx.beginPath();
    this.move_to(inner_left_radius_point.coord);
    this.line_to(left_corner.coord);
    this.line_to(right_corner.coord);
    this.line_to(inner_right_radius_point.coord);
    this.ctx.closePath();
    this.ctx.fillStyle = this.felt_color;
    this.ctx.fill();

    this.ellipse(pocket);

    for (let i = 0; i < pocket.balls_in_pocket.length; i++) {
      this.pool_ball(pocket.balls_in_pocket[i]);
    }

    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    this.move_to(inner_left_radius_point.coord);
    this.line_to(left_corner.coord);
    this.line_to(left_point.coord);
    this.line_to(outer_left_radius_point.coord);
    this.ctx.arc(pocket_center.at(0), pocket_center.at(1), pocket_radius + pocket_thickness, utils.radians(outward_dir - (90 + mouth_angle)), utils.radians(outward_dir - (270 - mouth_angle)), true);
    this.line_to(right_point.coord);
    this.line_to(right_corner.coord);
    this.ctx.arc(pocket_center.at(0), pocket_center.at(1), pocket_radius, utils.radians(outward_dir - (270 - mouth_angle)), utils.radians(outward_dir - (90 + mouth_angle)));
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    return [left_corner, right_corner];
  }

  move_to() {
    let coord = null;
    if (arguments.length == 1) {
      coord = Array.from(arguments[0]);
    } else {
      coord = Array.from(arguments);
    }

    this.ctx.moveTo(coord[0], coord[1]);
  }

  line_to() {
    let coord = null;
    if (arguments.length == 1) {
      coord = Array.from(arguments[0]);
    } else {
      coord = Array.from(arguments);
    }

    this.ctx.lineTo(coord[0], coord[1]);
  }
}
