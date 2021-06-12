export function radians(deg) {
  return deg * Math.PI / 180;
}

export function degrees(rad) {
  return rad * 180 / Math.PI;
}

export function distance_in_direction(dist, theta) {
  var x = dist * Math.cos(radians(theta));
  var y = dist * Math.sin(radians(theta));

  return [x, y];
}

export function distance_between(pos1, pos2) {
  var dx = pos2[0] - pos1[0];
  var dy = pos2[1] - pos1[1];

  return Math.sqrt(dx * dx + dy * dy);
}

export function get_direction(coord) {
  return degrees(Math.atan2(coord[1], coord[0]));
}

export function angle_between(start, dest) {
  var dx = dest[0] - start[0];
  var dy = dest[1] - start[1];

  return get_direction([dx, dy]);
}

export function get_speed(xspeed, yspeed) {
  return Math.sqrt(xspeed * xspeed + yspeed * yspeed);
}

export function add_coord(c1, c2) {
  return [c1[0] + c2[0], c1[1] + c2[1]];
}

export function random_range(a, b) {
  let diff = b - a;
  diff += 1
  return Math.floor(Math.random() * diff) + a;
}

export function magnitude(v) {
  return Math.sqrt(dot(v, v));
}

export function dot(u, v) {
  let to_return = 0;
  for (let i = 0; i < u.length; i++) {
    to_return += u[i] * v[i];
  }

  return to_return;
}

export function project(v, onto) {
  let scalar = (dot(v, onto) / dot(onto, onto));
  return scale_coord(onto, scalar);
}

export function sphere_volume_to_radius(vol) {
  return Math.pow(((3 / (4 * Math.PI)) * vol), 1/3);
}

export function sphere_radius_to_volume(r) {
  return ((4/3) * Math.PI * Math.pow(r, 3));
}

export function scale_coord(coord, scalar) {
  let to_return = [];
  for (let i = 0; i < coord.length; i++) {
    to_return.push(coord[i] * scalar);
  }

  return to_return;
}

export function rem_to_px(r) {
    return r * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function get_random_hex_color() {
  var r = random_range(0xaa, 0xff).toString(16);
  var g = random_range(0x10, 0x55).toString(16);
  var b = random_range(0x10, 0x55).toString(16);
  let combos = [
    [r,g,b], [r,b,g],
    [g,r,b], [g,b,r],
    [b,g,r], [b,r,g]
  ];

  let color = combos[random_range(0, combos.length - 1)];

  var randomColor = "#" + color[0] + color[1] + color[2];
  return randomColor;
}

export function avg() {
  let nums = null;
  if (arguments.length == 1) {
    nums = Array.from(arguments[0]);
  } else {
    nums = Array.from(arguments);
  }

  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }

  return (sum / nums.length);
}

export function hex_to_rgb_array(c) {
  if (c.indexOf("#") > -1) {
    c = c.substring(1);
  }

  let r = parseInt(c.substring(0, 2), 16);

  let g = parseInt(c.substring(2, 4), 16);

  let b = parseInt(c.substring(4), 16);

  return [r, g, b];
}

export function rgb_array_to_hex() {
  let arr = null;
  if (arguments.length == 1) {
    arr = Array.from(arguments[0]);
  } else {
    arr = Array.from(arguments);
  }

  let r = arr[0].toString(16);
  let g = arr[1].toString(16);
  let b = arr[2].toString(16);

  if (r.length < 2) {
    r = "0" + r;
  }

  if (g.length < 2) {
    g = "0" + g;
  }

  if (b.length < 2) {
    b = "0" + b;
  }

  return "#" + r + g + b;
}

export function add_hex_colors(c1, c2) {
  let color1 = hex_to_rgb_array(c1);
  let color2 = hex_to_rgb_array(c2);

  let to_return = [];

  to_return.push(Math.min(color1[0] + color2[0], 0xff));
  to_return.push(Math.min(color1[1] + color2[1], 0xff));
  to_return.push(Math.min(color1[2] + color2[2], 0xff));

  return rgb_array_to_hex(to_return);
}

export function subtract_hex_colors(c1, c2) {
  let color1 = hex_to_rgb_array(c1);
  let color2 = hex_to_rgb_array(c2);

  let to_return = [];

  if (color2[0] >= color1[0]) {
    to_return.push(0x00);
  } else {
    to_return.push(color1[0] - color2[0]);
  }

  if (color2[1] >= color1[1]) {
    to_return.push(0x00);
  } else {
    to_return.push(color1[1] - color2[1]);
  }

  if (color2[2] >= color1[2]) {
    to_return.push(0x00);
  } else {
    to_return.push(color1[2] - color2[2]);
  }

  return rgb_array_to_hex(to_return);
}

export function average_hex_colors(c1, c2) {
  if (c1.indexOf("#") > -1) {
    c1 = c1.substring(1);
  }

  if (c2.indexOf("#") > -1) {
    c2 = c2.substring(1);
  }

  let ar = c1.substring(0, 2);
  let br = c2.substring(0, 2);
  let r = Math.floor(avg(parseInt(ar, 16), parseInt(br, 16)))//.toString(16);

  let ag = c1.substring(2, 4);
  let bg = c2.substring(2, 4);
  let g = Math.floor(avg(parseInt(ag, 16), parseInt(bg, 16)))//.toString(16);

  let ab = c1.substring(4);
  let bb = c2.substring(4);
  let b = Math.floor(avg(parseInt(ab, 16), parseInt(bb, 16)))//.toString(16);

  let max = Math.max(r, g, b);
  let adjustment = 0xff - max;

  r += adjustment;
  g += adjustment;
  b += adjustment;

  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  return "#" + r + g + b;
}

export function clamp(low, val, hi) {
  return Math.max(low, Math.min(val, hi));
}

export function getMousePosRel(element, e) {
    var rect = element.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}
