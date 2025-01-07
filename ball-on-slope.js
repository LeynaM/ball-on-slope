let slope;
let gravity;
let ball;

function setup() {
  createCanvas(1000, 1000);
  gravity = createVector(0, 0.02);

  slope = {
    start: createVector(0, height * 0.5),
    end: createVector(width, height * 0.7),
  };
  slope.gradient = (slope.end.y - slope.start.y) / (slope.end.x - slope.start.x);
  slope.angle = atan(slope.end.x / slope.start.y);

  ball = new RigidBody({
    position: createVector(50, 360),
    velocity: createVector(0, 0),
    acceleration: createVector(0, 0),
    radius: 0.05 * height,
  });
  ball.log();
}

function draw() {
  drawScene();

  ball.applyForce(gravity);

  if (isColliding()) {
    // ball.acceleration.add(normalForce());
    // console.log("n", normalForce());
    // console.log(ball.acceleration);
    noLoop();
  }
  ball.update();
  ball.draw();

  stroke("blue");
  strokeWeight(2);
  const intersect = findIntersect();
  line(ball.position.x, ball.position.y, intersect.x, intersect.y);
}

function drawScene() {
  background("lightblue");
  noStroke();
  fill("green");
  quad(slope.start.x, slope.start.y, slope.end.x, slope.end.y, width, height, 0, height);
}

function findIntersect() {
  const x =
    (ball.position.x +
      slope.gradient ** 2 * slope.start.x +
      slope.gradient * (ball.position.y - slope.start.y)) /
    (slope.gradient ** 2 + 1);
  const y = slope.gradient * x - slope.gradient * slope.start.x + slope.start.y;

  return createVector(x, y);
}

function isColliding() {
  const intersect = findIntersect();
  const distanceToIntersect = sqrt(
    (ball.position.x - intersect.x) ** 2 + (ball.position.y - intersect.y) ** 2
  );

  return distanceToIntersect < ball.radius;
}

function normalForce() {
  const magnitude = sqrt(ball.acceleration.x ** 2 + ball.acceleration.y ** 2) * sin(slope.angle);

  return createVector(magnitude * cos(slope.angle), -magnitude * sin(slope.angle));
}

class RigidBody {
  constructor(initialProperties) {
    this.position = initialProperties.position ?? createVector(0, 0);
    this.velocity = initialProperties.velocity ?? createVector(0, 0);
    this.acceleration = initialProperties.acceleration ?? createVector(0, 0);
    this.radius = initialProperties.radius ?? 0;
  }

  log() {
    console.log({
      position: this.position.toString(),
      velocity: this.velocity.toString(),
      acceleration: this.acceleration.toString(),
      radius: this.radius,
    });
  }

  setProperties({
    position: argPosition,
    velocity: argVelocity,
    acceleration: argAcceleration,
    radius: argRadius,
  }) {
    if (argPosition) this.position = argPosition;
    if (argVelocity) this.velocity = argVelocity;
    if (argAcceleration) this.acceleration = argAcceleration;
    if (argRadius) this.radius = argRadius;
  }

  draw() {
    fill("red");
    ellipse(this.position.x, this.position.y, this.radius * 2);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }
}
