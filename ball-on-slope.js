const BORDER_SIZE = 25;

let slope;
let gravity;
let currentBall;
let slider;
let leftHandle;
let rightHandle;
let isLeftHandlePressed = false;
let isRightHandlePressed = false;

function setup() {
  const canvas = createCanvas(2000, 1000);
  canvas.parent("canvas-wrapper");
  canvas.mouseClicked(spawnBall);

  addSlider(0.1, 10, 0.5);

  setSlope({
    startY: height * 0.5,
    endY: height * 0.7,
  });

  addDragHandles();

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

function spawnBall() {
  if (isLeftHandlePressed || isRightHandlePressed) return;

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

function addSlider(min, max, initial) {
  let sliderWrapper = createDiv();
  sliderWrapper.parent("canvas-wrapper");
  sliderWrapper.position(width - 350, 35);
  sliderWrapper.addClass("slider-wrapper");

  let label = createSpan("Gravity");
  label.parent(sliderWrapper);

  slider = createSlider(min, max, initial, 0);
  slider.parent(sliderWrapper);
  slider.size(200);
}

function addDragHandles() {
  leftHandle = createDiv();
  leftHandle.parent("canvas-wrapper");
  leftHandle.position(slope.start.x - BORDER_SIZE, slope.start.y - BORDER_SIZE / 2);
  leftHandle.size(BORDER_SIZE, BORDER_SIZE);
  leftHandle.addClass("handle");

  leftHandle.mousePressed(() => {
    isLeftHandlePressed = true;
  });

  rightHandle = createDiv();
  rightHandle.parent("canvas-wrapper");
  rightHandle.position(slope.end.x, slope.end.y - BORDER_SIZE / 2);
  rightHandle.size(BORDER_SIZE, BORDER_SIZE);
  rightHandle.addClass("handle");

  rightHandle.mousePressed(() => {
    isRightHandlePressed = true;
  });
}

function mouseReleased() {
  setTimeout(() => {
    isLeftHandlePressed = false;
    isRightHandlePressed = false;
  }, 0);
}

function mouseDragged() {
  if (isLeftHandlePressed) {
    setSlope({ startY: mouseY });
    leftHandle.position(slope.start.x - BORDER_SIZE, slope.start.y - BORDER_SIZE / 2);
  }
  if (isRightHandlePressed) {
    setSlope({ endY: mouseY });
    rightHandle.position(slope.end.x, slope.end.y - BORDER_SIZE / 2);
  }
}

function drawVector(start, vector) {
  stroke("blue");
  strokeWeight(2);
  const end = start.copy().add(vector);
  line(start.x, start.y, end.x, end.y);
}

function setSlope({ startY = slope.start.y, endY = slope.end.y } = {}) {
  start = createVector(0, clampY(startY));
  end = createVector(width, clampY(endY));

  slope = {
    start,
    end,
    gradient: (end.y - start.y) / (end.x - start.x),
    angle: atan(end.x / start.y),
  };
}

function clampY(value) {
  return Math.min(Math.max(value, (3 * BORDER_SIZE) / 4), height - (3 * BORDER_SIZE) / 4);
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
