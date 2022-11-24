const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
const googleStrategy = new GoogleStrategy(
  {
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    passReqToCallback: true,
  },
  (req, accessToken, refreshToken, profile, done) => {
    const { email, name } = profile._json;
    const user = {
      email,
      name,
      password: accessToken,
      googleId: profile.id,
    };
    done(null, user);
  }
);
module.exports = {
  jwtStrategy,
  googleStrategy,
};
