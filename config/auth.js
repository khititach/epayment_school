const express = require('express');
const router = express.Router();
const passport = require('passport');

    // Sign up
router.get('/signup',(req, res) => {
    res.render('signup');
});

    // Register
router.post('/signup', passport.authenticate('local-signup', {
    failureRedirect: '/auth/signup',
    failureFlash: false
}),(req,res,next) => {
    res.redirect('/');
});

    // Login
router.get('/login',(req,res,next) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

    // Login Handle
router.post('/login', passport.authenticate('local-login', {
    failureRedirect:'/',
    // failureFlash:'Username or Password is wrong.'
    failureFlash:'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง โปรดลองใหม่อีกครั้ง'
}),(req,res,next) => {
    var user = req.session.passport.user;
    // console.log("name : " + user);
    res.redirect('/');
});

    // Logout
router.get('/logout',(req,res,next) => {
    console.log("- - - LOG OUT SUCCESS - - -");
    req.logOut();
    res.redirect('/');
});

module.exports = router;