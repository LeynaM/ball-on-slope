const BORDER_SIZE = 25;

let slope;
let gravity;
let currentBall;
let slider;
let leftHandle;
let rightHandle;
let isLeftHandlePressed = false;
let isRightHandlePressed = false;
let quadrilateral;
let canvasWidth;
let canvasHeight;

function setCanvasSize() {
  const canvasWrapperElement = document.getElementById("canvas-wrapper");
  resizeCanvas(
    canvasWrapperElement.clientWidth,
    canvasWrapperElement.clientHeight,
  );
}

function setup() {
  const canvas = createCanvas();
  canvas.parent("canvas-wrapper");
  setCanvasSize();
  canvas.mouseClicked(spawnBall);

  addSlider(0.1, 10, 0.5);

  const leftHandleY = height * 0.5;
  const rightHandleY = height * 0.7;
  quadrilateral = setQuadrilateral(leftHandleY, rightHandleY);

  addDragHandles(leftHandleY, rightHandleY);

  frameRate(60);
}

function windowResized() {
  const leftHandleRelativeY = leftHandle.y / height;
  const rightHandleRelativeY = rightHandle.y / height;
  setCanvasSize();
  quadrilateral = setQuadrilateral(
    leftHandle.y + BORDER_SIZE / 2,
    rightHandle.y + BORDER_SIZE / 2,
  );
  leftHandle.position(-BORDER_SIZE, leftHandleRelativeY * height);
  rightHandle.position(width, rightHandleRelativeY * height);
}

let collisionEdgeNormal = null;

function draw() {
  drawScene();
  gravity = createVector(0, slider.value());
  if (!currentBall) return;

  if (collisionEdgeNormal) {
    currentBall.bounce(collisionEdgeNormal);
    collisionEdgeNormal = null;
  }

  preUpdateNormals = quadrilateral.map((edge) =>
    findNormalVector(currentBall, edge),
  );

  currentBall.applyForce(gravity);
  currentBall.update();

  postUpdateNormals = quadrilateral.map((edge) =>
    findNormalVector(currentBall, edge),
  );

  postUpdateNormals.forEach((newNormal, index) => {
    const isBallIntersectingEdge = newNormal.mag() < currentBall.radius;
    const hasBallTunnelledThroughEdge =
      Math.sign(preUpdateNormals[index].x) !== Math.sign(newNormal.x) ||
      Math.sign(preUpdateNormals[index].y) !== Math.sign(newNormal.y);

    if (isBallIntersectingEdge || hasBallTunnelledThroughEdge) {
      currentBall.moveBackToEdge(newNormal);
      collisionEdgeNormal = newNormal;
    }
  });

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
  // if (isBelowSlope(currentBall)) {
  //   currentBall = null;
  // }
}

function drawScene() {
  background("green");
  noStroke();
  fill("lightblue");
  // console.log(
  //   ...quadrilateral.reduce((accumulator, edge) => {
  //     accumulator.push(edge.start.x);
  //     accumulator.push(edge.start.y);

  //     return accumulator;
  //   }, [])
  // );
  quad(
    ...quadrilateral.reduce((accumulator, edge) => {
      accumulator.push(edge.start.x);
      accumulator.push(edge.start.y);

      return accumulator;
    }, []),
  );
}

function findNormalVector(ball, edge) {
  let xIntersect;
  let yIntersect;
  if (edge.gradient === Infinity) {
    xIntersect = edge.start.x;
    yIntersect = ball.position.y;
  } else {
    xIntersect =
      (ball.position.x +
        edge.gradient ** 2 * edge.start.x +
        edge.gradient * (ball.position.y - edge.start.y)) /
      (edge.gradient ** 2 + 1);

    yIntersect =
      edge.gradient * xIntersect - edge.gradient * edge.start.x + edge.start.y;
  }

  const intersect = createVector(xIntersect, yIntersect);

  return ball.position.copy().sub(intersect);
}

function addSlider(min, max, initial) {
  let sliderWrapper = createDiv();
  sliderWrapper.parent("canvas-wrapper");
  sliderWrapper.position(35, 35);
  sliderWrapper.addClass("slider-wrapper");

  let label = createSpan("Gravity");
  label.parent(sliderWrapper);

  slider = createSlider(min, max, initial, 0);
  slider.parent(sliderWrapper);
  slider.size(200);
}

function addDragHandles(leftHandleY, rightHandleY) {
  leftHandle = createDiv();
  leftHandle.parent("canvas-wrapper");
  setLeftHandlePosition(leftHandleY);
  leftHandle.size(BORDER_SIZE, BORDER_SIZE);
  leftHandle.addClass("handle");

  leftHandle.mousePressed(() => {
    isLeftHandlePressed = true;
  });

  rightHandle = createDiv();
  rightHandle.parent("canvas-wrapper");
  setRightHandlePosition(rightHandleY);
  rightHandle.size(BORDER_SIZE, BORDER_SIZE);
  rightHandle.addClass("handle");

  rightHandle.mousePressed(() => {
    isRightHandlePressed = true;
  });
}

function setLeftHandlePosition(leftHandleY) {
  leftHandle.position(-BORDER_SIZE, leftHandleY - BORDER_SIZE / 2);
}

function setRightHandlePosition(rightHandleY) {
  rightHandle.position(width, rightHandleY - BORDER_SIZE / 2);
}

function mouseReleased() {
  setTimeout(() => {
    isLeftHandlePressed = false;
    isRightHandlePressed = false;
  }, 0);
}

function mouseDragged() {
  if (isLeftHandlePressed) {
    const clampedY = clampY(mouseY);
    setLeftHandlePosition(clampedY);
    quadrilateral = setQuadrilateral(clampedY, rightHandle.y + BORDER_SIZE / 2);
  }

  if (isRightHandlePressed) {
    const clampedY = clampY(mouseY);
    setRightHandlePosition(clampedY);
    quadrilateral = setQuadrilateral(leftHandle.y + BORDER_SIZE / 2, clampedY);
  }
}

function drawVector(start, vector) {
  stroke("blue");
  strokeWeight(2);
  const end = start.copy().add(vector);
  line(start.x, start.y, end.x, end.y);
}

function setQuadrilateral(bottomLeftY, bottomRightY) {
  const topLeft = createVector(0, 0);
  const topRight = createVector(width, 0);
  const bottomRight = createVector(width, bottomRightY);
  const bottomLeft = createVector(0, bottomLeftY);

  return [
    {
      start: topLeft,
      end: topRight,
      gradient: 0,
    },
    {
      start: topRight,
      end: bottomRight,
      gradient: Infinity,
    },
    {
      start: bottomRight,
      end: bottomLeft,
      gradient: (bottomRight.y - bottomLeft.y) / (bottomRight.x - bottomLeft.x),
    },
    {
      start: bottomLeft,
      end: topLeft,
      gradient: Infinity,
    },
  ];
}

function clampY(value) {
  return Math.min(
    Math.max(value, (3 * BORDER_SIZE) / 4),
    height - (3 * BORDER_SIZE) / 4,
  );
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
    // V∥​ is the component of V parallel to the edge.
    // V⊥​ is the component of V perpendicular to the edge.
    // V′ is the resultant velocity vector of the ball.

    // V∥ = (( V · n ) / |n|^2 ) * n
    // V⊥ = V - V∥
    // V' = V⊥ - V∥
    // V' = V - 2 * V∥

    const velocityParallelToEdge = normalVector
      .copy()
      .mult(
        this.velocity.copy().dot(normalVector) / normalVector.copy().magSq(),
      );
    this.velocity.sub(velocityParallelToEdge.mult(2));
  }

  moveBackToEdge(normalVector) {
    if (normalVector.y > 0) {
      const distancePastTheEdge = this.radius + normalVector.mag();
      const directionToTheEdge = normalVector
        .copy()
        .normalize()
        .mult(distancePastTheEdge);
      this.position.sub(directionToTheEdge);
    } else {
      const distancePastTheEdge = this.radius - normalVector.mag();
      const directionToTheEdge = normalVector
        .copy()
        .normalize()
        .mult(distancePastTheEdge);
      this.position.add(directionToTheEdge);
    }
  }
}
