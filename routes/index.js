const express = require('express');
const router = express.Router();

const controller = require('../controller/controller_index');

const passport = require('passport')

router.get('/',controller.init_page);

    // Get school name
router.get('/get_school_name',controller.school_name);

    // Get sidebar name
router.get('/get_name',controller.sidebar_get_name)

router.get('/test_login',controller.test_login_page);

module.exports = router;