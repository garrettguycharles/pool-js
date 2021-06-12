export class Graph {
  constructor() {
    this.nodes = [];
  }

  add_node(n) {
    if (!this.nodes.includes(n)) {
      this.nodes.push(n);
    }
  }

  get_node_from_ball(ball) {
    let to_return = null;
    for (let i = 0; i < this.nodes.length; i++) {
      if (ball === this.nodes[i].ball) {
        to_return = this.nodes[i];
        break;
      }
    }

    return to_return;
  }

  add_edge() {
    let nodes = null;
    if (arguments.length == 1) {
      nodes = Array.from(arguments[0]);
    } else {
      nodes = Array.from(arguments);
    }

    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        nodes[i].add_neighbor(nodes[j]);
        nodes[j].add_neighbor(nodes[i]);
      }
    }
  }

  is_connected() {
    this.nodes.forEach((node, i) => {
      node.connected = false;
    });

    let start_node = this.nodes[0];

    start_node.refresh_connected_flags();

    let is_connected = true;

    this.nodes.every((node, i) => {
      if (!node.connected) {
        is_connected = false;
        return false;
      }
      return true;
    });

    return is_connected;
  }


}

export class Node {
  constructor(ball) {
    this.ball = ball;
    this.neighbors = [];
    this.connected = false;
  }

  add_neighbor(n) {
    if (!this.neighbors.includes(n)) {
      this.neighbors.push(n);
    }
  }

  refresh_connected_flags() {
    this.connected = true;

    for (let i = 0; i < this.neighbors.length; i++) {
      if (!this.neighbors[i].connected) {
        this.neighbors[i].refresh_connected_flags();
      }
    }
  }
}
