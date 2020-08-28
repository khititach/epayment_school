const express = require('express');
const router = express.Router();

const controller = require('../controller/controller_admin');

// const passport = require('passport')

    // admin home page
router.get('/',controller.admin_home_page);

    // register student
router.get('/register_student',controller.register_student_page)
router.post('/register_student',controller.register_student)

    // register store
router.get('/register_store',controller.register_store_page);
router.post('/register_store',controller.register_store);
// router.get('/register_store_test',controller.register_store_page_test);

        // register store auto check
router.patch('/register_auto_check',controller.register_store_check);
router.patch('/register_auto_check_store_name',controller.register_store_check_store_name);

    // edit student
router.get('/edit_student',controller.edit_student_page);
router.get('/edit_student/?:student_id',controller.edit_student_detail_page);

    // edit store
router.get('/edit_store',controller.edit_store_page);
router.get('/edit_store/?:id',controller.edit_store_detail_page);
router.patch('/edit_profile',controller.edit_store_profile);
router.patch('/edit_store/?:id/approve_requset',controller.approve_request);
        // edit store password
router.patch('/store_change_password',controller.edit_store_change_password);
        // edit store change status
router.patch('/edit_store/change_status',controller.edit_store_change_status);
        // reset password
router.patch('/edit_store/reset_password',controller.reset_store_password);
        // delete store 
router.delete('/delete_store',controller.delete_user);

    // category
router.get('/category',controller.category_page);
        // add
router.get('/category/add',controller.category_add_page);
router.post('/category/add',controller.category_add);
router.post('/category/add/auto_check',controller.category_add_check);
router.get('/category/add/get_id_list',controller.get_food_id_list);
        // edit
router.patch('/category/edit',controller.category_edit);
router.post('/category/edit/check_name',controller.category_edit_check_name);
        // delete
router.delete('/category/delete',controller.category_delete);

    // category test page
router.get('/category/edit',controller.category_edit_page);

    // Function
        // Search student
router.post('/search_student',controller.search_student);

        // Top-up
router.patch('/topup',controller.topup);

        // Sidebar get name
// router.get('/get_name',controller.sidebar_get_name)

//  For dev
    // add school
router.post('/add_school/',controller.add_school);
router.post('/test_function',controller.test_function);

    // register admin
router.get('/register_admin/:password',controller.register_admin_page);
router.post('/register_admin',controller.register_admin);

// Delete User
router.delete('/delete_user',controller.delete_user);

module.exports = router;