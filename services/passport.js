const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");

const keys = require("../config/keys");

const User = mongoose.model("users");

// To generate some unique identifier for the user to set in 'cookie'
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize serialized used to turn it back into a User model
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      // Async operation, so returns a promise
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        // we already have a record with the gived profile ID
        return done(null, existingUser);
      }

      // we don't have a user record with this ID, make a new record
      const user = await new User({ googleId: profile.id }).save();
      done(null, user);
    }
  )
);
