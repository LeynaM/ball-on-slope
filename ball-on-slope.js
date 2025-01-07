const BORDER_SIZE = 50;

let slope;
let gravity;
let currentBall;
let slider;
let handle;
let isHandlePressed = false;

function setup() {
  const canvas = createCanvas(2500, 1000);
  canvas.parent("canvas-wrapper");

  drawSlider(0.1, 10, 0.5);

  setSlope({
    startY: height * 0.5,
    endY: height * 0.7,
  });

  createDragHandles();

  frameRate(60);
}

let hasCollided = false;

function draw() {
  drawScene();
  gravity = createVector(0, slider.value());
  if (!currentBall) return;

  if (hasCollided) {
    const normalVector = findNormalVector(currentBall);
    currentBall.bounce(normalVector);
    hasCollided = false;
  }

  currentBall.applyForce(gravity);
  currentBall.update();

  if (isBelowSlope(currentBall)) {
    const normalVector = findNormalVector(currentBall);
    currentBall.moveBackToSlope(normalVector);
    hasCollided = true;
  }
  currentBall.draw();
}

function mouseClicked() {
  if (isHandlePressed) return;

  currentBall = new RigidBody({
    position: createVector(mouseX, mouseY),
    velocity: createVector(0, 0),
    acceleration: createVector(0, 0),
    radius: 0.03 * height,
  });
  if (isBelowSlope(currentBall)) {
    currentBall = null;
  }
}

function drawScene() {
  background("lightblue");
  noStroke();
  fill("green");
  quad(slope.start.x, slope.start.y, slope.end.x, slope.end.y, width, height, 0, height);

  noFill();
  stroke("black");
  strokeWeight(BORDER_SIZE);
  rect(0, 0, width, height);
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

function isBelowSlope(ball) {
  const normalVector = findNormalVector(ball);

  return normalVector.y > 0 || normalVector.mag() < ball.radius;
}

function drawSlider(min, max, initial) {
  let label = createSpan("Gravity");
  label.position(width - 350, 40);
  label.addClass("label");

  slider = createSlider(min, max, initial, 0);
  slider.position(width - 250, 40);
  slider.size(200);
}

function createDragHandles() {
  handle = createDiv();
  const diameter = BORDER_SIZE / 2;
  handle.parent("canvas-wrapper");
  handle.position(slope.start.x, slope.start.y - diameter / 2);
  handle.size(diameter, diameter);
  handle.addClass("handle");

  handle.mousePressed(() => {
    console.log("handle mouse pressed");
    isHandlePressed = true;
  });

  handle.mouseReleased(() => {
    console.log("handle mouse released");
    isHandlePressed = false;
  });
}

function mouseReleased() {
  console.log("GLOBAL mouse released");
  isHandlePressed = false;
}

function mouseDragged() {
  console.log("mouse moved");
  if (isHandlePressed) {
    setSlope({ startY: mouseY });
    handle.position(slope.start.x, slope.start.y - BORDER_SIZE / 4);
  }
}

function drawVector(start, vector) {
  stroke("blue");
  strokeWeight(2);
  const end = start.copy().add(vector);
  line(start.x, start.y, end.x, end.y);
}

function setSlope({ startY = slope.start.y, endY = slope.end.y } = {}) {
  start = createVector(0, startY);
  end = createVector(width, endY);

  slope = {
    start,
    end,
    gradient: (end.y - start.y) / (end.x - start.x),
    angle: atan(end.x / start.y),
  };
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
    noStroke();
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

  moveBackToSlope(normalVector) {
    if (normalVector.y > 0) {
      const distancePastTheSlope = this.radius + normalVector.mag();
      const directionToTheSlope = normalVector.copy().normalize().mult(distancePastTheSlope);
      this.position.sub(directionToTheSlope);
    } else {
      const distancePastTheSlope = this.radius - normalVector.mag();
      const directionToTheSlope = normalVector.copy().normalize().mult(distancePastTheSlope);
      this.position.add(directionToTheSlope);
    }
  }
}
