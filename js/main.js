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

let BALL_RADIUS, MAX_LAUNCH_SPEED;

if (vertical_orientation) {
  table = new Rect(0, 0, screen.w * (50 / 62.5), screen.h * (100 / 112.5));
  BALL_RADIUS = table.h * (1.125 / 100);
} else {
  table = new Rect(0, 0, screen.w * (100 / 112.5), screen.h * (50 / 62.5));
  BALL_RADIUS = table.w * (1.125/100);
}

let POCKET_RADIUS = BALL_RADIUS * 2.25;

table.center = screen.center;

MAX_LAUNCH_SPEED = BALL_RADIUS * 10;

let gravity = 0.5;
let friction = 0.99;

let mouse_down = false;
let aim_cursor = new Vector(table.centerx, table.centery);
let mouse_pos = new Vector(table.centerx, table.centery);
let can_shoot = false;

let pool_ball_list = [];
let pocket_list = [];
let bumper_list = [];
let cue_ball = null;

let RAIL_THICKNESS = (screen.w - table.w) / 2;
let BUMPER_THICKNESS = (RAIL_THICKNESS * (2 / 7));

let table_reset_timeout = null;

let state = "play";

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

  for (let i = 1; i < 10; i+=1) {
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


  if (can_shoot) {
    brush.aim_line(cue_ball, aim_cursor);
  }
}

function update() {

  if (state == "ball_in_hand") {
    cue_ball.center = aim_cursor;

    for (let i = 1; i < pool_ball_list.length; i++) {
      cue_ball.avoid_collision_circle(pool_ball_list[i]);
      cue_ball.stay_in_rect(table);
    }

    aim_cursor = cue_ball.center;
  }

  for (let i = 0; i < pool_ball_list.length; i++) {
    let ball = pool_ball_list[i];

    let move_by_velocity = true;

    if (ball.velocity.magnitude < 0.1) {
      ball.xspeed = 0;
      ball.yspeed = 0;
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
              pocket.color = "black";
              pocket.remove_ball(ball);
              ball.center = table.center;
              state = "ball_in_hand";
              aim_cursor = table.center;
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
          //draw();
          bumper_list[j].bounce_ball(ball);
        }
        /*
        if (ball.colliderect(bumper_list[j])) {
          bumper_list[j].bounce_ball(ball);
        }
        */
      }
    }

    for (let j = 0; j < pool_ball_list.length; j++) {
      let otherball = pool_ball_list[j];

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
    //ball.yspeed += gravity;

    if (move_by_velocity) {
      ball.x += ball.xspeed;
      ball.y += ball.yspeed;

      ball.xspeed *= friction;
      ball.yspeed *= friction;
    }
  }


  let new_can_shoot = true;
  if (state === "play") {
    pool_ball_list.every((ball, i) => {
      if (ball.is_moving) {
        new_can_shoot = false;
        return false;
      }
      return true;
    });
  } else {
    new_can_shoot = false;
  }

  can_shoot = new_can_shoot;

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

  if (e.type === "touchend") {
    mouse_down = false;

    if (dragging) {
      return;
    }

    if (state === "play") {
      if (can_shoot) {

        let launch_vect = aim_cursor.subtract(cue_ball.center);

        cue_ball.velocity = launch_vect.scale(1/20);
        if (cue_ball.velocity.magnitude > MAX_LAUNCH_SPEED) {
          cue_ball.velocity = cue_ball.velocity.scale(MAX_LAUNCH_SPEED / cue_ball.velocity.magnitude);
        }
        aim_cursor = table.center;
      }
    }

    if (state === "ball_in_hand") {
      state = "play";
    }
  }

  if (e.type === "mouseup") {
    mouse_down = false;

    if (dragging) {
      return;
    }

    if (state === "play") {
      if (can_shoot) {

        let launch_vect = aim_cursor.subtract(cue_ball.center);

        cue_ball.velocity = launch_vect.scale(1/20);
        if (cue_ball.velocity.magnitude > MAX_LAUNCH_SPEED) {
          cue_ball.velocity = cue_ball.velocity.scale(MAX_LAUNCH_SPEED / cue_ball.velocity.magnitude);
        }
        aim_cursor = table.center;
      }
    }

    if (state === "ball_in_hand") {
      state = "play";
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

game_canvas.addEventListener("mousemove", (e) => {
  mouse_pos.x = e.offsetX;
  mouse_pos.y = e.offsetY;
  let change = previous_mouse_position.to(mouse_pos);
  console.log(change.magnitude);

  if (change.magnitude > 5) {
    if (mouse_down) {
      dragging = true;
    } else {
      dragging = false;
    }
  }

  if (dragging) {
    aim_cursor = aim_cursor.add(change);
  }

  previous_mouse_position.x = mouse_pos.x;
  previous_mouse_position.y = mouse_pos.y;
});

game_canvas.addEventListener("touchmove", (e) => {
  //console.log(e);

  if (e.changedTouches.length == 1) {
    mouse_pos.x = e.changedTouches[0].clientX;
    mouse_pos.y = e.changedTouches[0].clientY;
    let change = previous_mouse_position.to(mouse_pos);
    console.log(change.magnitude);

    if (change.magnitude > 5) {
      dragging = true;
    }

    if (dragging) {
      aim_cursor = aim_cursor.add(change);
    }

    previous_mouse_position.x = mouse_pos.x;
    previous_mouse_position.y = mouse_pos.y;
  }
});

setInterval(step, 1000 / FPS);
