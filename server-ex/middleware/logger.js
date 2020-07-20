// 로그 찍는, 로거(함수) 만든다.
// next함수 없으면 못넘어감.
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  next();
};

module.exports = logger;
