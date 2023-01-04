const passport = require('passport');
const httpStatus = require('http-status');
const { OAuth2Client } = require('google-auth-library');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const config = require('../config/config');
const userService = require('../services/user.service');

const client = new OAuth2Client(config.google.clientId);

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }
  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

const googleAuth = async (req, res, next) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.idToken,
      audience: config.google.clientId,
    });
    const payload = ticket.getPayload();
    const user = await userService.getOrCreateUserByPayload(payload, 'google');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// const facebookAuth = async (req, res, next) => {
//   try {
//     const resposnes = await axios.get(
//       `https://graph.facebook.com/v11.0/me?fields=id,name,email,picture&access_token=${req.body.accessToken}`
//     );
//     const payload = resposnes.data;
//     const user = await userService.getOrCreateUserByPayload(
//       {
//         sub: payload.id,
//         email: payload.email,
//         given_name: payload.name,
//         family_name: '',
//         picture: payload.picture.data.url,
//       },
//       'facebook'
//     );
//     req.user = user;
//   } catch (err) {
//     next(err);
//   }
// };

module.exports = {
  auth,
  googleAuth,
  // facebookAuth,
};
