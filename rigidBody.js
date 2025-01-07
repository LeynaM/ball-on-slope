// export function rigidBody() {
//   let position;
//   let velocity;
//   let acceleration;
//   let radius;

//   const setProperties = ({
//     position: argPosition,
//     velocity: argVelocity,
//     acceleration: argAcceleration,
//     radius: argRadius,
//   }) => {
//     if (argPosition) position = argPosition;
//     if (argVelocity) velocity = argVelocity;
//     if (argAcceleration) acceleration = argAcceleration;
//     if (argRadius) radius = argRadius;
//   };

//   const draw = () => {
//     fill("red");
//     ellipse(position.x, position.y, radius * 2);
//   };

//   const update = () => {
//     velocity.add(acceleration);
//     position.add(velocity);
//     acceleration.mult(0);
//   };

//   const applyForce = (force) => {
//     acceleration.add(force);
//   };

//   return {
//     position,
//     velocity,
//     acceleration,
//     radius,

//     setProperties,
//     draw,
//     update,
//     applyForce,
//   };
// }
