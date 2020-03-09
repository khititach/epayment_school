const LocalStrategy = require('passport-local').Strategy;

const User = require('../model/User');
 
    // Login 
module.exports = (passport) => {
    passport.use('local-login', new LocalStrategy({
        usernameField:'username',
        passwordField:'password',
        passReqToCallback: true
    },(req, username, password, done) => {
        console.log("username : " + username + " / password : " + password )
        User.user_model.findOne({username: username})
            .then(user => {
                if (!user) {
                    return done(null, false);
                }

                if (!user.validPassword(password)) {
                    return done(null, false, { msg : 'Password incorrect.'});
                }
                
                return done(null, user);

            })
            .catch(err => done(err , false))
    }
    ));

    passport.serializeUser((user,done) => {
        done(null, user);
    });

    passport.deserializeUser((id,done) => {
        User.user_model.findById(id, (err, user) => {
            done(err,user);
        });
    });
}