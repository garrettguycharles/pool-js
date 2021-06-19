import * as utils from "./utils.js";
import {Rect} from "./rect.js";
import {LineSegment} from "./line.js";
import {Vector} from "./vector.js";

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
      this.ctx.lineWidth = 10;
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
      this.cue_ball(b);
    }

    let left_ball_point = b.center.add(b.velocity.perpendicular_l.normalize().scale(b.radius));
    let right_ball_point = b.center.add(b.velocity.perpendicular_r.normalize().scale(b.radius));


/*
    let left_path_line = new LineSegment(
      left_ball_point,
      left_ball_point.add(b.velocity.scale((b.velocity.magnitude + b.radius) / b.velocity.magnitude))
    );

    let right_path_line = new LineSegment(
      right_ball_point,
      right_ball_point.add(b.velocity.scale((b.velocity.magnitude + b.radius) / b.velocity.magnitude))
    );

    this.line_segment(left_path_line);
    this.line_segment(right_path_line);


    if (b.rotation.magnitude > 0 || b.rotating_independently) {
      let rotation_line = new LineSegment(b.center, b.center.add(b.rotation.scale(100)));
      this.line_segment(rotation_line);
    }

    if (b.distance_rolling_forward >= b.radius * 3 * Math.PI) {
      this.ellipse(b, false, "#00ff00");
    }
*/

  }

  cue_ball(b) {
    let white_gradient = this.ctx.createRadialGradient(b.centerx, b.centery, b.radius / 5, b.centerx, b.centery, b.radius);
    white_gradient.addColorStop(0.3, "#ffffff");
    white_gradient.addColorStop(0.8, "#dddddd");
    white_gradient.addColorStop(1, "#aaaaaa");

    this.ctx.beginPath();
    this.ctx.ellipse(b.centerx, b.centery, b.radius, b.radius, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = white_gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(b.centerx - b.radius / 2, b.centery - b.radius / 3, b.radius / 8, b.radius / 8, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = "red";
    this.ctx.fill();
  }

  ball_english_widget(widget, aim_point) {
    let white_gradient = this.ctx.createRadialGradient(widget.centerx, widget.centery, widget.radius / 5, widget.centerx, widget.centery, widget.radius);
    white_gradient.addColorStop(0.3, "#ffffff99");
    white_gradient.addColorStop(0.8, "#dddddd99");
    white_gradient.addColorStop(1, "#aaaaaa99");

    this.ctx.beginPath();
    this.ctx.ellipse(widget.centerx, widget.centery, widget.radius, widget.radius, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = white_gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(aim_point.centerx, aim_point.centery, aim_point.radius, aim_point.radius, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ff000099";
    this.ctx.fill();

    this.ctx.beginPath();
    this.move_to(widget.midtop.coord);
    this.line_to(widget.midbottom.coord);
    this.ctx.strokeStyle = "#ff333399";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  line_segment(l) {
    this.ctx.beginPath();
    this.move_to(l.start.coord);
    this.line_to(l.end.coord);
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();
  }

  aim_line(cue_ball, aim_cursor) {
    let forward = aim_cursor.center.subtract(cue_ball.center);
    let sideways = forward.perpendicular_l.normalize();
    let left_start = cue_ball.center.add(sideways.scale(cue_ball.radius));
    let right_start = cue_ball.center.add(sideways.scale(-cue_ball.radius));
    let left_end = left_start.add(forward);
    let right_end = right_start.add(forward);

    this.ctx.beginPath();
    this.move_to(left_start.coord);
    this.line_to(left_end.coord);
    this.ctx.arc(aim_cursor.center.x, aim_cursor.center.y, cue_ball.radius, utils.radians(sideways.angle), utils.radians(sideways.angle) + Math.PI * 2);
    this.move_to(right_end.coord);
    this.line_to(right_start.coord);
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.stroke();
  }

  pool_stick(ball, aim_cursor, distance_back = 0) {
    let butt_radius = ball.radius / 2;
    let tip_radius = butt_radius / 2;
    let distance = (ball.radius * 1.5) + distance_back;
    let to_ball = ball.center.to(aim_cursor.center);
    let stick_dir = to_ball.flip().normalize();
    let stick_length = ball.radius * (60 / 1.125);

    let leftward = to_ball.perpendicular_l.normalize();
    let rightward = to_ball.perpendicular_r.normalize();

    let tip_focus = ball.center.add(stick_dir.scale(distance));
    let butt_focus = tip_focus.add(stick_dir.scale(stick_length));

    let tip_left = tip_focus.add(leftward.scale(tip_radius));
    let tip_right = tip_focus.add(rightward.scale(tip_radius));

    let tip_cap_fraction = 1/400;
    let tip_sleeve_fraction = 1/46;
    let top_half_fraction = 23/50;
    let grip_top_fraction = 35/50;
    let grip_bottom_fraction = 48/50;

    let tip_cap_bottom = tip_focus.add(stick_dir.scale(stick_length * tip_cap_fraction));
    let tip_sleeve_bottom = tip_focus.add(stick_dir.scale(stick_length * tip_sleeve_fraction));
    let grip_top = tip_focus.add(stick_dir.scale(stick_length * grip_top_fraction));
    let grip_bottom = tip_focus.add(stick_dir.scale(stick_length * grip_bottom_fraction));

    let top_half_bottom = tip_focus.add(stick_dir.scale(stick_length * top_half_fraction));

    let tip_cap_left = tip_cap_bottom.add(leftward.scale(utils.interpolate(tip_radius, butt_radius, tip_cap_fraction)));
    let tip_cap_right = tip_cap_bottom.add(rightward.scale(utils.interpolate(tip_radius, butt_radius, tip_cap_fraction)));
    let tip_sleeve_left = tip_sleeve_bottom.add(leftward.scale(utils.interpolate(tip_radius, butt_radius, tip_sleeve_fraction)));
    let tip_sleeve_right = tip_sleeve_bottom.add(rightward.scale(utils.interpolate(tip_radius, butt_radius, tip_sleeve_fraction)));
    let top_half_left = top_half_bottom.add(leftward.scale(utils.interpolate(tip_radius, butt_radius, top_half_fraction)));
    let top_half_right = top_half_bottom.add(rightward.scale(utils.interpolate(tip_radius, butt_radius, top_half_fraction)));
    let grip_top_left = grip_top.add(leftward.scale(utils.interpolate(tip_radius, butt_radius, grip_top_fraction)));
    let grip_top_right = grip_top.add(rightward.scale(utils.interpolate(tip_radius, butt_radius, grip_top_fraction)));
    let grip_bottom_left = grip_bottom.add(leftward.scale(utils.interpolate(tip_radius, butt_radius, grip_bottom_fraction)));
    let grip_bottom_right = grip_bottom.add(rightward.scale(utils.interpolate(tip_radius, butt_radius, grip_bottom_fraction)));

    let butt_left = butt_focus.add(leftward.scale(butt_radius));
    let butt_right = butt_focus.add(rightward.scale(butt_radius));

    let cap_sleeve_gradient = this.ctx.createLinearGradient(tip_cap_left.x, tip_cap_left.y, tip_cap_right.x, tip_cap_right.y);
    cap_sleeve_gradient.addColorStop(0, "#b8b8b8");
    cap_sleeve_gradient.addColorStop(0.5, "#ebebeb");
    cap_sleeve_gradient.addColorStop(1, "#b8b8b8");

    let wood_gradient = this.ctx.createLinearGradient(tip_cap_left.x, tip_cap_left.y, tip_cap_right.x, tip_cap_right.y);
    wood_gradient.addColorStop(0, "#977130");
    wood_gradient.addColorStop(0.5, "#caa472");
    wood_gradient.addColorStop(1, "#977130");

    let handle_color_gradient = this.ctx.createLinearGradient(top_half_left.x, top_half_left.y, top_half_right.x, top_half_right.y);
    handle_color_gradient.addColorStop(0, "#5c0000");
    handle_color_gradient.addColorStop(0.5, "#8f0000");
    handle_color_gradient.addColorStop(1, "#5c0000");


    this.ctx.beginPath();
    this.move_to(tip_left.coord);
    this.line_to(tip_right.coord);
    this.line_to(top_half_right.coord);
    this.line_to(top_half_left.coord);
    this.ctx.closePath();
    this.ctx.fillStyle = wood_gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.move_to(top_half_left.coord);
    this.line_to(top_half_right.coord);
    this.line_to(grip_top_right.coord);
    this.line_to(grip_top_left.coord);
    this.ctx.closePath();
    this.ctx.fillStyle = handle_color_gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.move_to(grip_top_left.coord);
    this.line_to(grip_top_right.coord);
    this.line_to(grip_bottom_right.coord);
    this.line_to(grip_bottom_left.coord);
    this.ctx.closePath();
    this.ctx.fillStyle = "black";
    this.ctx.fill();

    this.ctx.beginPath();
    this.move_to(grip_bottom_left.coord);
    this.line_to(grip_bottom_right.coord);
    this.line_to(butt_right.coord);
    this.line_to(butt_left.coord);
    this.ctx.closePath();
    this.ctx.fillStyle = handle_color_gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.move_to(tip_cap_left.coord);
    this.line_to(tip_cap_right.coord);
    this.line_to(tip_sleeve_right.coord);
    this.line_to(tip_sleeve_left.coord);
    this.ctx.fillStyle = cap_sleeve_gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.move_to(tip_left.coord);
    this.line_to(tip_right.coord);
    this.line_to(tip_cap_right.coord);
    this.line_to(tip_cap_left.coord);
    this.ctx.fillStyle = "#32a6ff";
    this.ctx.fill();

    this.ctx.beginPath();
    this.move_to(tip_left.coord);
    this.ctx.ellipse(tip_focus.x, tip_focus.y, tip_radius / 2, tip_radius, utils.radians(to_ball.angle), -Math.PI / 2, Math.PI / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = "#32a6ff";
    this.ctx.fill();

    this.ctx.beginPath();
    this.move_to(butt_left.coord);
    this.ctx.ellipse(butt_focus.x, butt_focus.y, butt_radius / 2, butt_radius, utils.radians(to_ball.angle), Math.PI / 2, 3 * Math.PI / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = "black";
    this.ctx.fill();
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

  shot_power_widget(widget, ball_radius, distance = 0) {
    this.rounded_rect(widget, 5);
    //let cue_ball_rect = new Rect(0, 0, ball_radius * 2, ball_radius * 2);
    let cue_ball_rect = new Rect(0, 0, widget.w * 0.8, widget.w * 0.8);
    cue_ball_rect.center = widget.midtop;
    this.cue_ball(cue_ball_rect);
    let aim_point = new Rect(0, 0, 2, 2);
    aim_point.center = cue_ball_rect.center.add(cue_ball_rect.center.to(cue_ball_rect.midtop));

    this.pool_stick(cue_ball_rect, aim_point, distance);
  }

  diamond(center, rx, ry) {
    this.ctx.beginPath();
    this.move_to(center.add(Vector.left().scale(rx)).coord);
    this.line_to(center.add(Vector.up().scale(ry)).coord);
    this.line_to(center.add(Vector.right().scale(rx)).coord);
    this.line_to(center.add(Vector.down().scale(ry)).coord);
    this.ctx.closePath();
    this.ctx.fillStyle = "#ebebeb";
    this.ctx.strokeStyle = "#008e00";
    this.ctx.lineWidth = rx / 3;
    this.ctx.fill();
    this.ctx.stroke();
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

    let diamond_height = table.major_dimension * 1 / 150;
    let diamond_width = diamond_height * 4 / 7;

    let rail_wood_center = bumper_thickness + (rail_thickness - bumper_thickness) / 2;
    let horizontal_diamonds = [];
    let vertical_diamonds = [];

    if (table.h === table.minor_dimension) {
      // horizontal table
      horizontal_diamonds.push(table.midleft.add(Vector.left().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midleft.lerp_towards(table.topleft, 0.5).add(Vector.left().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midleft.lerp_towards(table.bottomleft, 0.5).add(Vector.left().scale(rail_wood_center)));

      horizontal_diamonds.push(table.midright.add(Vector.right().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midright.lerp_towards(table.topright, 0.5).add(Vector.right().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midright.lerp_towards(table.bottomright, 0.5).add(Vector.right().scale(rail_wood_center)));

      vertical_diamonds.push(table.midtop.lerp_towards(table.topleft, 0.75).add(Vector.up().scale(rail_wood_center)));
      vertical_diamonds.push(table.midtop.lerp_towards(table.topleft, 0.5).add(Vector.up().scale(rail_wood_center)));
      vertical_diamonds.push(table.midtop.lerp_towards(table.topleft, 0.25).add(Vector.up().scale(rail_wood_center)));
      vertical_diamonds.push(table.midtop.lerp_towards(table.topright, 0.25).add(Vector.up().scale(rail_wood_center)));
      vertical_diamonds.push(table.midtop.lerp_towards(table.topright, 0.5).add(Vector.up().scale(rail_wood_center)));
      vertical_diamonds.push(table.midtop.lerp_towards(table.topright, 0.75).add(Vector.up().scale(rail_wood_center)));

      vertical_diamonds.push(table.midbottom.lerp_towards(table.bottomright, 0.75).add(Vector.down().scale(rail_wood_center)));
      vertical_diamonds.push(table.midbottom.lerp_towards(table.bottomright, 0.5).add(Vector.down().scale(rail_wood_center)));
      vertical_diamonds.push(table.midbottom.lerp_towards(table.bottomright, 0.25).add(Vector.down().scale(rail_wood_center)));
      vertical_diamonds.push(table.midbottom.lerp_towards(table.bottomleft, 0.25).add(Vector.down().scale(rail_wood_center)));
      vertical_diamonds.push(table.midbottom.lerp_towards(table.bottomleft, 0.5).add(Vector.down().scale(rail_wood_center)));
      vertical_diamonds.push(table.midbottom.lerp_towards(table.bottomleft, 0.75).add(Vector.down().scale(rail_wood_center)));
    } else {
      vertical_diamonds.push(table.midtop.add(Vector.up().scale(rail_wood_center)));
      vertical_diamonds.push(table.midtop.lerp_towards(table.topleft, 0.5).add(Vector.up().scale(rail_wood_center)));
      vertical_diamonds.push(table.midtop.lerp_towards(table.topright, 0.5).add(Vector.up().scale(rail_wood_center)));

      vertical_diamonds.push(table.midbottom.add(Vector.down().scale(rail_wood_center)));
      vertical_diamonds.push(table.midbottom.lerp_towards(table.bottomright, 0.5).add(Vector.down().scale(rail_wood_center)));
      vertical_diamonds.push(table.midbottom.lerp_towards(table.bottomleft, 0.5).add(Vector.down().scale(rail_wood_center)));

      horizontal_diamonds.push(table.midleft.lerp_towards(table.topleft, 0.75).add(Vector.left().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midleft.lerp_towards(table.topleft, 0.5).add(Vector.left().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midleft.lerp_towards(table.topleft, 0.25).add(Vector.left().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midleft.lerp_towards(table.bottomleft, 0.25).add(Vector.left().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midleft.lerp_towards(table.bottomleft, 0.5).add(Vector.left().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midleft.lerp_towards(table.bottomleft, 0.75).add(Vector.left().scale(rail_wood_center)));

      horizontal_diamonds.push(table.midright.lerp_towards(table.bottomright, 0.75).add(Vector.right().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midright.lerp_towards(table.bottomright, 0.5).add(Vector.right().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midright.lerp_towards(table.bottomright, 0.25).add(Vector.right().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midright.lerp_towards(table.topright, 0.25).add(Vector.right().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midright.lerp_towards(table.topright, 0.5).add(Vector.right().scale(rail_wood_center)));
      horizontal_diamonds.push(table.midright.lerp_towards(table.topright, 0.75).add(Vector.right().scale(rail_wood_center)));
    }

    for (let i = 0; i < horizontal_diamonds.length; i++) {
      this.diamond(horizontal_diamonds[i], diamond_height, diamond_width);
    }

    for (let i = 0; i < vertical_diamonds.length; i++) {
      this.diamond(vertical_diamonds[i], diamond_width, diamond_height);
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
    this.line_to(left_corner.add(inner_left_radius_point.to(left_corner)).coord);
    this.line_to(right_corner.add(inner_right_radius_point.to(right_corner)).coord);
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
