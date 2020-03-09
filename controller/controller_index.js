const fs = require('fs');
let config_file = fs.readFileSync('./config/school_data.json');
let school_data = JSON.parse(config_file);

const User = require('../model/User')
const user_model = User.user_model;
const student_model = User.student_model;
const store_model = User.store_model;
const admin_model = User.admin_model;

init_page = (req ,res ,next) => {  
    if (!req.user) {
        res.render('login');
        // res.render('login_test');
    } 
    else {
        // console.log("req user : "+ req.user );
        // res.send('test');
        if (req.user.roleStudent()) {
            if (req.isAuthenticated() && req.user.roleStudent()) {
                const User_data = req.session.passport.user;
                student_model.findOne({uid:User_data.uid},(err, student_data) => {
                    if (err) {
                        throw err;
                    } else {
                        global.global_data = student_data;
                        console.log("Login by : " + student_data.first_name);
                        // res.render('../views/student_page/student_home',{student_data});
                        res.redirect('/student')
                    }
                })
                
            } 
            else {
                console.log('student page fail.');
                res.sendStatus(403);
            }
        }
        if (req.user.roleStore()) {
            if (req.isAuthenticated() && req.user.roleStore()) {
                const User_data = req.session.passport.user;     
                store_model.findOne({uid:User_data.uid},(err, store_data) => {
                    if (err) {
                        throw err;
                    } else {
                        global.global_data = store_data;
                        console.log("Login by : " + store_data.first_name);
                        // res.render('../views/store_page/store_home',{store_data});
                        res.redirect('/store')
                    }
                })
            } 
            else {
                console.log('store page fail.');
                res.sendStatus(403);
            }
        }
        if (req.user.roleAdmin()) {
            if (req.isAuthenticated() && req.user.roleAdmin()) {
                const User_data = req.session.passport.user;
                admin_model.findOne({uid:User_data.uid},(err, admin_data) => {
                    if (err) {
                        throw err;
                    } else {
                        global.global_data = admin_data;
                        console.log("Login by : " + admin_data.first_name);
                        res.redirect('/admin')
                    }
                })
            } 
            else {
                console.log('admin page fail.');
                res.sendStatus(403);
            }
        }
    }
}

// school name
school_name = (req, res) => {
    // console.log(school_data);
    res.status(200).send(school_data);
    
}

// Sidebar get name
sidebar_get_name = (req ,res) => {  
    res.status(200).send(global_data)
}

// test login page
test_login_page = (req ,res ) => {
    res.render('login_test');
}



module.exports = {
    init_page,
    school_name,
    sidebar_get_name,
    test_login_page
}