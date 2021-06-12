export function get_nine(image, slices = [8, 8, 8, 8], width = 64, height = 64, stretch = false) {
  let left, top, right, bottom, midwidth, midheight, i_width, i_height;
  left = slices[0];
  top = slices[1];
  right = slices[2];
  bottom = slices[3];
  i_width = image.width;
  i_height = image.height;
  midwidth = i_width - (left + right);
  midheight = i_height - (top + bottom);

  let d_midwidth = width - (left + right);
  let d_midheight = height - (top + bottom);

  let work_canvas = document.createElement('canvas');
  work_canvas.width = width;
  work_canvas.height = height;
  work_canvas.style.display = "none";
  //work_canvas.style.border = "2px solid #0e0e0e";
  let ctx = work_canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  document.body.appendChild(work_canvas);

  // topleft
  ctx.drawImage(image, 0, 0, left, top, 0, 0, left, top);
  // topmiddle
  let drawn = 0;
  while (d_midwidth - drawn > midwidth) {
    ctx.drawImage(image, left, 0, midwidth, top, left + drawn, 0, midwidth, top);
    drawn += midwidth;
  }
  ctx.drawImage(image, left, 0, d_midwidth - drawn, top, left + drawn, 0, d_midwidth - drawn, top);
  // topright
  ctx.drawImage(image, left + midwidth, 0, right, top, width - right, 0, right, top);


  // midleft
  drawn = 0;
  while (d_midheight - drawn > midheight) {
    ctx.drawImage(image, 0, top, left, midheight, 0, top + drawn, left, midheight);
    drawn += midheight;
  }
  ctx.drawImage(image, 0, top, left, d_midheight - drawn, 0, top + drawn, left, d_midheight - drawn);
  // center
  if (stretch) {
    ctx.drawImage(image, left, top, midwidth, midheight, left, top, d_midwidth, d_midheight);
  } else {
    let drawn_x = 0;
    let drawn_y = 0;
    while (d_midheight - drawn_y > midheight) {
      drawn_x = 0;
      while (d_midwidth - drawn_x > midwidth) {
        ctx.drawImage(image, left, top, midwidth, midheight, left + drawn_x, top + drawn_y, midwidth, midheight);
        drawn_x += midwidth;
      }
      ctx.drawImage(image, left, top, d_midwidth - drawn_x, midheight, left + drawn_x, top + drawn_y, d_midwidth - drawn_x, midheight);
      drawn_y += midheight;
    }
    drawn_x = 0;
    while (d_midwidth - drawn_x > midwidth) {
      ctx.drawImage(image, left, top, midwidth, d_midheight - drawn_y, left + drawn_x, top + drawn_y, midwidth, d_midheight - drawn_y);
      drawn_x += midwidth;
    }
    ctx.drawImage(image, left, top, d_midwidth - drawn_x, d_midheight - drawn_y, left + drawn_x, top + drawn_y, d_midwidth - drawn_x, d_midheight - drawn_y);
  }
  // midright
  drawn = 0;
  while (d_midheight - drawn > midheight) {
    ctx.drawImage(image, left + midwidth, top, right, midheight, left + d_midwidth, top + drawn, right, midheight);
    drawn += midheight;
  }
  ctx.drawImage(image, left + midwidth, top, right, d_midheight - drawn, left + d_midwidth, top + drawn, right, d_midheight - drawn);


  // bottomleft
  ctx.drawImage(image, 0, top + midheight, left, bottom, 0, top + d_midheight, left, bottom);
  // bottommiddle
  drawn = 0;
  while (d_midwidth - drawn > midwidth) {
    ctx.drawImage(image, left, top + midheight, midwidth, bottom, left + drawn, top + d_midheight, midwidth, bottom);
    drawn += midwidth;
  }
  ctx.drawImage(image, left, top + midheight, d_midwidth - drawn, bottom, left + drawn, top + d_midheight, d_midwidth - drawn, bottom);
  // bottomright
  ctx.drawImage(image, left + midwidth, top + midheight, right, bottom, left + d_midwidth, top + d_midheight, right, bottom);

  /*
  let toReturn = new Image();
  toReturn.src = work_canvas.toDataURL();
  return toReturn;
  */

  return work_canvas;
}
