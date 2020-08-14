const express = require('express');
const router = express.Router();

const controller = require('../controller/controller_student');


    // student home page  
router.get('/', controller.student_home_page);

    // student setting page
router.get('/setting',controller.student_setting_page);
        // student change password
router.patch('/update_profile',controller.update_profile);
router.patch('/edit_weight',controller.edit_weight);
router.patch('/edit_height',controller.edit_height);
router.patch('/edit_password',controller.edit_password);

    // student history page
router.get('/history',controller.student_history_page);
    // get order list by id
router.get('/history/get_order_by_id',controller.get_order_list);


        // get food data
// router.get('/get_food_history_data',controller.get_food_history_data);

        // get data to draw graph
router.get('/get_data_graph/',controller.get_data_graph)


module.exports = router;