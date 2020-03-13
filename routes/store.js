const express = require('express');
const router = express.Router();

const controller = require('../controller/controller_store');

// function
    // search student
router.post('/search_student',controller.search_student);
    // buy item
router.patch('/buy_item',controller.buy_item);
        // buy item list
router.patch('/buy_item_list',controller.buy_item_list);

    // store home page 
router.get('/', controller.store_home_page);
router.get('/test', controller.store_home_test_page);

    // storefront page
// router.get('/storefront',controller.store_storefront_page);

    // store report page
router.get('/report',controller.store_report_page);
        // get history data by select month and mode
router.get('/report/get_data_graph/',controller.get_data_graph);
        // get food rating 
router.get('/report/get_food_sales',controller.get_food_sales);
    // to pdf page 
router.get('/report/download_report',controller.download_report_page);
    // store category page
router.get('/category',controller.store_category_page);
    // get store food data 
router.get('/category/get_list',controller.get_list);
    // add menu
router.patch('/category/add_menu',controller.add_menu);
    // delete list
router.patch('/category/delete_menu',controller.delete_menu);



module.exports = router;