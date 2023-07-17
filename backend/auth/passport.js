const passport = require("passport");
const passportJwt = require("passport-jwt");
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const db = require('../db/index');


passport.use(
    new StrategyJwt(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        function (jwtPayload, done){
            db.getUserByEmail(jwtPayload.email, (err, user) => {
                if(err) { return done(err)}
                return done(null, user);
            });
        }
        ) 
)