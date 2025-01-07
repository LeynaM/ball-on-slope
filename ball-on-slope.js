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
  slope.gradient =
    (slope.end.y - slope.start.y) / (slope.end.x - slope.start.x);
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

  const normalVector = findNormalVector();
  if (isColliding(normalVector)) {
    ball.bounce(normalVector);
    noLoop();
  }
  ball.update();
  ball.draw();

  stroke("blue");
  strokeWeight(2);
  // const normalVector = findNormalVector();
  console.log("ball", ball.position.toString());
  console.log("nv", normalVector.toString());
  const intersect = ball.position.copy().sub(normalVector);
  console.log("intersect", intersect.toString());
  drawVector(intersect, normalVector);
}

function drawScene() {
  background("lightblue");
  noStroke();
  fill("green");
  quad(
    slope.start.x,
    slope.start.y,
    slope.end.x,
    slope.end.y,
    width,
    height,
    0,
    height
  );
}

function findNormalVector() {
  const xIntersect =
    (ball.position.x +
      slope.gradient ** 2 * slope.start.x +
      slope.gradient * (ball.position.y - slope.start.y)) /
    (slope.gradient ** 2 + 1);
  const yIntersect =
    slope.gradient * xIntersect -
    slope.gradient * slope.start.x +
    slope.start.y;

  const intersect = createVector(xIntersect, yIntersect);
  console.log("interesectA", intersect.toString());

  return ball.position.copy().sub(intersect);
}

function isColliding(normalVector) {
  // const normalVector = findNormalVector();

  return normalVector.mag() < ball.radius;
}

// https://editor.p5js.org/ada10086/sketches/U4AhsYrk
function arrowHead(start, vector) {
  // push(); //start new drawing state
  var norm = createVector(vector.x, vector.y);
  norm.normalize();
  // applyMatrix(1,0,0,1,vector.x - start.x,vector.y - start.y)
  applyMatrix(
    norm.x,
    norm.y,
    -norm.y,
    norm.x,
    vector.x - start.x,
    vector.y - start.y
  );

  fill("blue");
  triangle(0, 60, 120, 0, 0, -60);
  // pop();
}

function drawVector(start, vector) {
  const end = start.copy().add(vector);
  line(start.x, start.y, end.x, end.y);
  arrowHead(start, vector);
}

// function normalForce() {
//   const magnitude = sqrt(ball.acceleration.x ** 2 + ball.acceleration.y ** 2) * sin(slope.angle);

//   return createVector(magnitude * cos(slope.angle), -magnitude * sin(slope.angle));
// }

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

  // setProperties({
  //   position: argPosition,
  //   velocity: argVelocity,
  //   acceleration: argAcceleration,
  //   radius: argRadius,
  // }) {
  //   if (argPosition) this.position = argPosition;
  //   if (argVelocity) this.velocity = argVelocity;
  //   if (argAcceleration) this.acceleration = argAcceleration;
  //   if (argRadius) this.radius = argRadius;
  // }

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
    const unitNormal = normalVector.copy().normalize();
    const v = 2 * this.velocity.copy().dot(normalVector);
    console.log("\nbounce");
    console.log(normalVector.toString());
    console.log(unitNormal.toString());
    console.log(v);
    console.log(unitNormal.copy().mult(v).toString());
    console.log("\n");
    this.velocity.sub(unitNormal.mult(v));
  }
}
