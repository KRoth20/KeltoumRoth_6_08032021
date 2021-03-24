const rateLimit = require("express-rate-limit");//limite le nombre de tentatives de connexion

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: "trop de tentatives de connexion, merci de réesayer dans 5 minutes",
});

module.exports = { limiter };
