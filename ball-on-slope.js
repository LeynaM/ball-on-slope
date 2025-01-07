let slope;
let gravity;
let currentBall;

function setup() {
  createCanvas(2500, 1000);
  gravity = createVector(0, 0.2);

  const slopeStart = createVector(0, height * 0.5);
  const slopeEnd = createVector(width, height * 0.7);

  slope = {
    start: slopeStart,
    end: slopeEnd,
    gradient: (slopeEnd.y - slopeStart.y) / (slopeEnd.x - slopeStart.x),
    angle: atan(slopeEnd.x / slopeStart.y),
  };

  frameRate(240);
}

let bounceBall = false;

function draw() {
  drawScene();
  if (!currentBall) return;

  if (bounceBall) {
    const normalVector = findNormalVector(currentBall);
    currentBall.bounce(normalVector);
    bounceBall = false;
  } else {
    currentBall.applyForce(gravity);
  }

  currentBall.update();

  if (willCollideNextFrame(currentBall)) {
    bounceBall = true;
  }
  currentBall.draw();
}

function mouseClicked() {
  currentBall = new RigidBody({
    position: createVector(mouseX, mouseY),
    velocity: createVector(0, 0),
    acceleration: createVector(0, 0),
    radius: 0.03 * height,
  });
  // currentBall.log();
}

function drawScene() {
  background("lightblue");
  noStroke();
  fill("green");
  quad(slope.start.x, slope.start.y, slope.end.x, slope.end.y, width, height, 0, height);
}

function findNormalVector(ball) {
  const xIntersect =
    (ball.position.x +
      slope.gradient ** 2 * slope.start.x +
      slope.gradient * (ball.position.y - slope.start.y)) /
    (slope.gradient ** 2 + 1);
  const yIntersect = slope.gradient * xIntersect - slope.gradient * slope.start.x + slope.start.y;

  const intersect = createVector(xIntersect, yIntersect);

  return ball.position.copy().sub(intersect);
}

function willCollideNextFrame(ball) {
  const nextBall = ball.copy();
  nextBall.applyForce(gravity);
  nextBall.update();

  const normalVector = findNormalVector(nextBall);

  if (findNormalVector(ball).mag() < ball.radius && normalVector.mag() < nextBall.radius) noLoop();
  return normalVector.mag() < nextBall.radius;
}

function drawVector(start, vector) {
  stroke("blue");
  strokeWeight(2);
  const end = start.copy().add(vector);
  line(start.x, start.y, end.x, end.y);
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

  copy() {
    return new RigidBody({
      position: this.position.copy(),
      velocity: this.velocity.copy(),
      acceleration: this.acceleration.copy(),
      radius: this.radius,
    });
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

  bounce(normalVector) {
    // V is the initial velocity vector of the ball.
    // V∥​ is the component of V parallel to the slope.
    // V⊥​ is the component of V perpendicular to the slope.
    // V′ is the resultant velocity vector of the ball.

    // V∥ = (( V · n ) / |n|^2 ) * n
    // V⊥ = V - V∥
    // V' = V⊥ - V∥
    // V' = V - 2 * V∥

    const velocityParallelToSlope = normalVector
      .copy()
      .mult(this.velocity.copy().dot(normalVector) / normalVector.copy().magSq());
    this.velocity.sub(velocityParallelToSlope.mult(2));
  }
}
