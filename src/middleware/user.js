async function UserIdMiddleware(ctx, next) {
  console.log(ctx);
  await next();
  console.log("middleware end");
}

module.exports = {UserIdMiddleware};
