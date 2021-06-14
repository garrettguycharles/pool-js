import * as utils from "./utils.js";
import {Rect} from "./rect.js";
import {Ball} from "./ball.js";
import {PoolBall} from "./poolball.js";
import {DrawTool} from "./draw.js";
import {Graph, Node} from "./graph.js";
import {Vector} from "./vector.js";
import {Bumper} from "./bumper.js";
import {Pocket} from "./pocket.js";


let FPS = 60

let game_canvas = document.getElementById("game");

let vertical_orientation = false;

if (window.innerWidth < window.innerHeight) {
  vertical_orientation = true;
}



if (vertical_orientation) {
  game_canvas.height = window.innerHeight;
  game_canvas.width = game_canvas.height * 62.5 / 112.5;
} else {
  game_canvas.width = window.innerWidth;
  game_canvas.height = game_canvas.width * 62.5 / 112.5;
  if (game_canvas.height > window.innerHeight) {
    game_canvas.height = window.innerHeight;
    game_canvas.width = game_canvas.height * 112.5 / 62.5;
  }
}

// set game width and height here, if necessary

let screen_context = game_canvas.getContext("2d");
let screen = new Rect(0, 0, game_canvas.width, game_canvas.height);
let brush = new DrawTool(game_canvas, screen);

let table = null;
let shot_power_widget = null;

let BALL_RADIUS, MAX_LAUNCH_SPEED;

if (vertical_orientation) {
  table = new Rect(0, 0, screen.w * (50 / 62.5), screen.h * (100 / 112.5));
  BALL_RADIUS = table.h * (1.125 / 100);
  shot_power_widget = new Rect(0, 0, screen.w * (6.25 / 62.5), BALL_RADIUS * 30 / 1.125);
} else {
  table = new Rect(0, 0, screen.w * (100 / 112.5), screen.h * (50 / 62.5));
  BALL_RADIUS = table.w * (1.125/100);
  shot_power_widget = new Rect(0, 0, screen.w * (6.25 / 112.5), BALL_RADIUS * 30 / 1.125);
}

shot_power_widget.midright = screen.midright;

let POCKET_RADIUS = BALL_RADIUS * 2.25;

table.center = screen.center;

let POWER_SHOT = 352; // inches per second (20 mph);

MAX_LAUNCH_SPEED = POWER_SHOT * (table.major_dimension / (100 * FPS));

let gravity = 0.5;
let friction = 0.99;

let mouse_down = false;
let aim_cursor = new Rect(0, 0, BALL_RADIUS * 2, BALL_RADIUS * 2);
aim_cursor.center = table.center;
let mouse_pos = new Vector(table.centerx, table.centery);
let table_settled = false;

let shot_power = 0;

let pool_ball_list = [];
let pocket_list = [];
let bumper_list = [];
let cue_ball = null;

let RAIL_THICKNESS = (screen.w - table.w) / 2;
let BUMPER_THICKNESS = (RAIL_THICKNESS * (2 / 7));

let table_reset_timeout = null;

let state = "aim";

let num_balls = 9;

function setup_table() {

  pool_ball_list = [];
  pocket_list = [];

  for (let i = 0; i < 6; i++) {
    let p = new Pocket(0, 0, POCKET_RADIUS);
    pocket_list.push(p);
  }

  let shelf_ratio = 2/7;

  pocket_list[0].center = table.topleft.add(utils.distance_in_direction(POCKET_RADIUS * (1 - shelf_ratio), utils.get_direction([-1, -1])));

  pocket_list[2].center = table.topright.add(utils.distance_in_direction(POCKET_RADIUS * (1 - shelf_ratio), utils.get_direction([1, -1])));
  pocket_list[3].center = table.bottomleft.add(utils.distance_in_direction(POCKET_RADIUS * (1 - shelf_ratio), utils.get_direction([-1, 1])));

  pocket_list[5].center = table.bottomright.add(utils.distance_in_direction(POCKET_RADIUS * (1 - shelf_ratio), utils.get_direction([1, 1])));

  if (vertical_orientation) {
    pocket_list[1].midright = table.midleft.add([-POCKET_RADIUS * shelf_ratio, 0]);
    pocket_list[4].midleft = table.midright.add([POCKET_RADIUS * shelf_ratio, 0]);
  } else {
    pocket_list[1].midbottom = table.midtop.add([0, -POCKET_RADIUS * shelf_ratio]);
    pocket_list[4].midtop = table.midbottom.add([0, POCKET_RADIUS * shelf_ratio]);
  }

  if (vertical_orientation) {
    bumper_list.push(new Bumper(table, table.bottomleft, table.bottomright, 45, 45, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.bottomright, table.midright, 45, 15, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.midright, table.topright, 15, 45, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.topright, table.topleft, 45, 45, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.topleft, table.midleft, 45, 15, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.midleft, table.bottomleft, 15, 45, BUMPER_THICKNESS, POCKET_RADIUS));
  } else {
    bumper_list.push(new Bumper(table, table.bottomleft, table.midbottom, 45, 15, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.midbottom, table.bottomright, 15, 45, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.bottomright, table.topright, 45, 45, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.topright, table.midtop, 45, 15, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.midtop, table.topleft, 15, 45, BUMPER_THICKNESS, POCKET_RADIUS));
    bumper_list.push(new Bumper(table, table.topleft, table.bottomleft, 45, 45, BUMPER_THICKNESS, POCKET_RADIUS));
  }

  cue_ball = new PoolBall(0, 0, BALL_RADIUS, 0);
  cue_ball.center = [table.left + table.w / 4, table.centery];
  pool_ball_list.push(cue_ball);

  for (let i = 1; i <= num_balls; i+=1) {
    let r = BALL_RADIUS;
    let ball = new PoolBall(0, 0, r, i);
    ball.center = [utils.random_range(table.left, table.right), utils.random_range(table.top, table.bottom)];
    pool_ball_list.push(ball);
  }

  let r3_2 = Math.sqrt(3) / 2;

  let rack_clearance = cue_ball.radius * (1 / 50);

  if (vertical_orientation) {

    cue_ball.center = [table.centerx, table.top + table.h / 4];

    pool_ball_list[1].center = table.center.add([0, table.h / 4]);

    pool_ball_list[2].center = pool_ball_list[1].center.add([cue_ball.radius + rack_clearance, cue_ball.radius * Math.sqrt(3)  + rack_clearance]);
    pool_ball_list[3].center = pool_ball_list[1].center.add([-(cue_ball.radius + rack_clearance), cue_ball.radius * Math.sqrt(3) + rack_clearance]);

    pool_ball_list[4].center = pool_ball_list[3].center.add([-(cue_ball.radius + rack_clearance), cue_ball.radius * Math.sqrt(3) + rack_clearance]);
    pool_ball_list[9].center = pool_ball_list[2].center.add([-(cue_ball.radius + rack_clearance), cue_ball.radius * Math.sqrt(3) + rack_clearance]);
    pool_ball_list[5].center = pool_ball_list[2].center.add([cue_ball.radius + rack_clearance, cue_ball.radius * Math.sqrt(3) + rack_clearance]);

    pool_ball_list[6].center = pool_ball_list[4].center.add([cue_ball.radius + rack_clearance, cue_ball.radius * Math.sqrt(3) + rack_clearance]);
    pool_ball_list[7].center = pool_ball_list[5].center.add([-(cue_ball.radius + rack_clearance), cue_ball.radius * Math.sqrt(3) + rack_clearance]);

    pool_ball_list[8].center = pool_ball_list[6].center.add([cue_ball.radius + rack_clearance, cue_ball.radius * Math.sqrt(3) + rack_clearance]);

  } else {

    pool_ball_list[1].center = table.center.add([table.w / 4, 0]);

    pool_ball_list[2].center = pool_ball_list[1].center.add([cue_ball.radius * Math.sqrt(3)  + rack_clearance, cue_ball.radius + rack_clearance]);
    pool_ball_list[3].center = pool_ball_list[1].center.add([cue_ball.radius * Math.sqrt(3) + rack_clearance, -(cue_ball.radius + rack_clearance)]);

    pool_ball_list[4].center = pool_ball_list[3].center.add([cue_ball.radius * Math.sqrt(3) + rack_clearance, -(cue_ball.radius + rack_clearance)]);
    pool_ball_list[9].center = pool_ball_list[2].center.add([cue_ball.radius * Math.sqrt(3) + rack_clearance, -(cue_ball.radius + rack_clearance)]);
    pool_ball_list[5].center = pool_ball_list[2].center.add([cue_ball.radius * Math.sqrt(3) + rack_clearance, cue_ball.radius + rack_clearance]);

    pool_ball_list[6].center = pool_ball_list[4].center.add([cue_ball.radius * Math.sqrt(3) + rack_clearance, cue_ball.radius + rack_clearance]);
    pool_ball_list[7].center = pool_ball_list[5].center.add([cue_ball.radius * Math.sqrt(3) + rack_clearance, -(cue_ball.radius + rack_clearance)]);

    pool_ball_list[8].center = pool_ball_list[6].center.add([cue_ball.radius * Math.sqrt(3) + rack_clearance, cue_ball.radius + rack_clearance]);
  }

}

setup_table();

function draw() {
  brush.clear();
  brush.pool_table(screen, table, pocket_list, bumper_list);

/*
  for (let i = 0; i < pocket_list.length; i++) {
    brush.ellipse(pocket_list[i]);
  }
*/
  if (state === "ball_in_hand") {
    screen_context.beginPath();
    screen_context.arc(cue_ball.centerx, cue_ball.centery, cue_ball.radius * 3, 0, Math.PI * 2);
    screen_context.fillStyle = "#ebebeb77";
    screen_context.fill();
  }

  for (let i = 0; i < pool_ball_list.length; i++) {
    if (!pool_ball_list[i].in_pocket) {
      brush.pool_ball(pool_ball_list[i]);
    }
  }


  if (table_settled) {
    brush.aim_line(cue_ball, aim_cursor);
    brush.pool_stick(cue_ball, aim_cursor, shot_power);
  }

  if (state === "set_shot_power") {
    brush.shot_power_widget(shot_power_widget, BALL_RADIUS, shot_power);
  }
}

function get_pool_ball_list_by_distance(ball) {
  let to_return = [];
  for (let i = 0; i < pool_ball_list.length; i++) {
    let otherball = pool_ball_list[i];
    if (ball !== otherball) {
      if (to_return.length < 1) {
        to_return.push(otherball);
      } else {
        let inserted = false;
        for (let j = 0; j < to_return.length; j++) {
          if (ball.center.distance_to(to_return[j].center) >= ball.center.distance_to(otherball.center)) {
            to_return.splice(j, 0, otherball);
            inserted = true;
            break;
          }
        }

        if (!inserted) {
          to_return.push(otherball);
        }
      }
    }
  }

  return to_return;
}

function update() {

  if (state == "aim") {
    let colliding = true;

    while (colliding) {
      colliding = false;

      for (let i = 1; i < pool_ball_list.length; i++) {
        if (aim_cursor.avoid_collision_circle(pool_ball_list[i], 0.1)) {
          colliding = true;
        }

        if (aim_cursor.stay_in_rect(table)) {
          colliding = true;
        }
      }
    }
  }

  if (state == "retrieve_cue_ball") {
    if (table_settled) {
      cue_ball.pocket.color = "black";
      cue_ball.pocket.remove_ball(cue_ball);
      cue_ball.center = table.center;
      state = "ball_in_hand";
      aim_cursor.center =  table.center;
    }
  }

  if (state == "ball_in_hand") {
    let move = cue_ball.center.to(aim_cursor);
    if (move.magnitude > cue_ball.radius) {
      move = move.scale(cue_ball.radius / move.magnitude);
    }
    cue_ball.center = cue_ball.center.add(move);

    let colliding = true;

    while (colliding) {
      colliding = false;

      for (let i = 1; i < pool_ball_list.length; i++) {
        if (cue_ball.avoid_collision_circle(pool_ball_list[i])) {
          colliding = true;
        }

        if (cue_ball.stay_in_rect(table)) {
          colliding = true;
        }
      }
    }



    aim_cursor.center =  cue_ball.center;
  }

  for (let i = 0; i < pool_ball_list.length; i++) {
    let ball = pool_ball_list[i];

    let move_by_velocity = true;

    if (ball.velocity.magnitude < 0.1) {
      ball.xspeed = 0;
      ball.yspeed = 0;
    }

    let distance_sorted_pool_ball_list = get_pool_ball_list_by_distance(ball);

    for (let j = 0; j < distance_sorted_pool_ball_list.length; j++) {
      let otherball = distance_sorted_pool_ball_list[j];

      if (ball != otherball && !otherball.in_pocket) {

        let collides = ball.collidecircle(otherball);

        let scale = ball.next_step_collidecircle_with(otherball);

        if (scale != false) {
          let scale_ball_vel = ball.velocity.scale(scale);
          let scale_other_vel = otherball.velocity.scale(scale);
          ball.center = ball.center.add(scale_ball_vel);
          otherball.center = otherball.center.add(scale_other_vel);
        }

        if (scale != false) {
          ball.bounce_elastic_2d(otherball, 1.1);
        }

        /*else if (collides) {
          ball.move_outside_circle(otherball);
          ball.bounce_elastic_2d(otherball, 1.1);
        }*/
      }
    }

    for (let j = 0; j < pocket_list.length; j++) {
      let pocket = pocket_list[j];

      if (!ball.in_pocket) {
        let move_scale = ball.next_step_containscircle_in(pocket);
        if (move_scale !== false) {
          let scale_vel = ball.velocity.scale(move_scale);
          ball.center = ball.center.add(scale_vel);
          move_by_velocity = false;
          pocket.add_ball(ball);
          if (ball == cue_ball) {
            pocket.color = "#701414";
            state = "scratch";
            setTimeout(() => {
              state = "retrieve_cue_ball";
            }, 3000);
          }
        } else if (pocket.collidepoint_circle(ball.center)) {
          ball.velocity = ball.velocity.add(pocket.center.subtract(ball.center).normalize().scale(0.1));
        }
      } else {
        if (pocket === ball.pocket) {
          ball.bouncecircle_inner(pocket, 2, false);
          break;
        }
      }

    }

    //ball.bouncerect_inner(table);
    if (!ball.in_pocket) {
      for (let j = 0; j < bumper_list.length; j++) {
        let scale = ball.next_step_collideshape_with(bumper_list[j]);
        if (scale !== false) {
          //console.log("will collide with bumper");
          let scale_vel = ball.velocity.scale(scale);
          ball.center = ball.center.add(scale_vel);
          move_by_velocity = false;
          draw();
          bumper_list[j].bounce_ball(ball);
        }
        /*
        if (ball.colliderect(bumper_list[j])) {
          bumper_list[j].bounce_ball(ball);
        }
        */
      }
    }
    //ball.yspeed += gravity;

    if (move_by_velocity) {
      ball.x += ball.xspeed;
      ball.y += ball.yspeed;

      ball.xspeed *= friction;
      ball.yspeed *= friction;
    }
  }


  if (state !== "game_over") {
    let reset_table = true;

    for (let i = 1; i <= num_balls; i++) {
      if (!pool_ball_list[i].in_pocket) {
        reset_table = false;
        break;
      }
    }

    if (reset_table) {
      state = "game_over";
      table_reset_timeout = setTimeout(() => {
        setup_table();
        table_reset_timeout = null;
        state = "aim";
      }, 5000);
    }
  }


  let new_table_settled = true;
  if (state === "aim" || state === "set_shot_power" || state === "retrieve_cue_ball") {
    pool_ball_list.every((ball, i) => {
      if (ball.is_moving) {
        new_table_settled = false;
        return false;
      }
      return true;
    });
  } else {
    new_table_settled = false;
  }

  table_settled = new_table_settled;

}

function step() {
  update();
  draw();
}

let previous_mouse_position = new Vector(0, 0);
let dragging = false;
let drag_timeout = null;

function touch_click_start(e) {
  mouse_down = true;
  dragging = false;

  clearTimeout(drag_timeout);
  drag_timeout = setTimeout(() => {
    dragging = true;
  }, 250);

  e.preventDefault();
  if (e.type === "mousedown") {
    previous_mouse_position.x = e.offsetX;
    previous_mouse_position.y = e.offsetY;
    mouse_pos.x = e.offsetX;
    mouse_pos.y = e.offsetY;
  }

  if (e.type === "touchstart") {
    mouse_pos.x = e.touches[0].clientX;
    mouse_pos.y = e.touches[0].clientY;
    previous_mouse_position.x = mouse_pos.x;
    previous_mouse_position.y = mouse_pos.y;
  }
}

function touch_click_end(e) {
  e.preventDefault();

  clearTimeout(drag_timeout);

  if (e.type === "touchend" || e.type === "mouseup") {
    mouse_down = false;

    if (dragging) {
      return;
    }

    if (state == "aim" && table_settled) {
      state = "set_shot_power";
      return;
    }

    if (state === "set_shot_power") {
      if (table_settled) {

        if (shot_power < 5) {
          shot_power = 0;
          state = "aim";
          return;
        }

        let launch_vect = aim_cursor.center.subtract(cue_ball.center);

        cue_ball.velocity = launch_vect.normalize().scale(MAX_LAUNCH_SPEED * get_shot_power_scale());

        aim_cursor.center =  table.center;
        shot_power = 0;
      }

      state = "aim";
      return;
    }

    if (state === "ball_in_hand") {
      state = "aim";
      aim_cursor.center =  table.center;
      return;
    }
  }
}

game_canvas.addEventListener("mousedown", (e) => {
  touch_click_start(e);
});

game_canvas.addEventListener("touchstart", (e) => {
  touch_click_start(e);
});

window.addEventListener("mouseup", (e) => {
  touch_click_end(e);
});

window.addEventListener("touchend", (e) => {
  touch_click_end(e);
});

function get_max_shot_power() {
  return shot_power_widget.h - cue_ball.radius * 4.25;
}

function get_shot_power_scale() {
  return shot_power / get_max_shot_power();
}

function on_cursor_move(e) {
  let change;

  if (e.type === "mousemove") {
    mouse_pos.x = e.offsetX;
    mouse_pos.y = e.offsetY;
    change = previous_mouse_position.to(mouse_pos);
  }

  if (e.type === "touchmove") {
    mouse_pos.x = e.changedTouches[0].clientX;
    mouse_pos.y = e.changedTouches[0].clientY;
    change = previous_mouse_position.to(mouse_pos);
  }

  if (change.magnitude > 5) {
    if (mouse_down) {
      dragging = true;
    } else {
      dragging = false;
    }
  }

  if (state === "aim" || state === "ball_in_hand") {

    if (dragging && mouse_down) {
      aim_cursor.center = aim_cursor.center.add(change);
    }
  }

  if (state == "set_shot_power") {
    if (dragging && mouse_down && mouse_pos.x > table.centerx) {
      shot_power += change.y;

      shot_power = utils.clamp(0, shot_power, get_max_shot_power());
    }
  }

  previous_mouse_position.x = mouse_pos.x;
  previous_mouse_position.y = mouse_pos.y;
}

game_canvas.addEventListener("mousemove", (e) => {
  e.preventDefault();
  on_cursor_move(e);
});

game_canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  on_cursor_move(e);
});

setInterval(step, 1000 / FPS);
