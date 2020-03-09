const math = require('mathjs');
    // user model
const User = require('../model/User')
const store_model = User.store_model;
const student_model = User.student_model;
    // history model
const history = require('../model/history');
const student_history = history.student_history_model;
const store_history = history.store_history_model;
    // category model
const category = require('../model/category');
    // notification model
const notification_model = require('../model/notification');

// other function
    // Search student
search_student = (req ,res ) => {
    const idcard = req.body.idcard;
    // console.log(idcard);
    console.log('ID Card : ' ,idcard);

    student_model.findOne({$or:[{student_id:idcard},{id_card:idcard}]},(err ,studentData) => {
        // console.log(studentData);
        if (err) {
            // throw err;
            res.status(500).send({error:'searching stundet something wrong.'})
        } 
        if (!studentData) {
            res.status(400).json({error:'ไม่พบข้อมูลนักเรียน.'})
        }
        if (studentData) {
            res.status(200).json({success : studentData});
        }
    })
}
    
    // buy item
buy_item = (req , res) =>{
    const reqBuyItem = req.body;
        // data : student_id / item_price
    // console.log(reqBuyItem);
    student_model.findOne({student_id:reqBuyItem.student_id},(err , studentData) => {
        if (err) {
            res.status(500).send({error:'Buy item something wrong. ERR > ' + err})
        }
        if (!studentData) {
            res.status(400).send({error:'student not found.'})
        }
        if (studentData) {
             // new current money
             const newCurrentMoney = math.subtract(Number(studentData.current_money),Number(reqBuyItem.item_price));
            //  console.log("New current money : " + newCurrentMoney);

            // record history
                // init data for save student history
            const student_data_record = {
                id_card:studentData.id_card,
                student_id:studentData.student_id,
                date:Date().toLocaleString(),
                status:'ซื้อ',
                store_number:global_data.store_number,
                store_name:global_data.store_name,
                food:'-',
                calories:'0',
                deposit:'0',
                withdraw:reqBuyItem.item_price,
                total:newCurrentMoney,
                responsible:'store owner:'+global_data.first_name
            }
            // console.log("Record student history model preview : " + JSON.stringify(student_data_record));

                // init data fot save store history
            const store_data_record = {
                store_number:global_data.store_number,
                store_name:global_data.store_name,
                date:Date().toLocaleString(),
                student_id:studentData.student_id,
                status:'ซื้อ',
                food_id:0,
                food_name:'-',
                // calories:'-',
                income:reqBuyItem.item_price,
                // withdraw:'0',
                responsible:global_data.first_name
            }

            // console.log("Record store history model preview : " + JSON.stringify(store_data_record));

            // save to model
            const studentNewHistory = new student_history(student_data_record);
            const storeNewHistory = new store_history(store_data_record);
            const msg_data = {title:'ซื้อ',message:reqBuyItem.item_price+' บาท'}
            add_notification_buy(reqBuyItem,msg_data);
            student_model.updateOne({student_id:reqBuyItem.student_id},{current_money:newCurrentMoney},(err,studentUpdate) => {
                // console.log("Update student : " + JSON.stringify(studentUpdate));
                if (err) {
                    res.status(500).send({error:'Buy item : update money something wrong.'})
                } 
                studentNewHistory.save((err_student) => {
                    if (err_student) {
                        res.status(500).send({error:'Buy item : record student history something wrong.'})
                    } else {
                        storeNewHistory.save((err_store) => {
                            if (err_store) {
                                res.status(500).send({error:'Buy item : record store history something wrong.'})
                            } else {
                                res.status(200).json({success:'ซื้อขายสำเร็จ'})        
                            }
                        })
                    }
                })
            })


        }
    })
} 

        // buy item list
buy_item_list = (req ,res ) => {
    const reqBuyItemData = req.body;
    // console.log('student data to buy item list :',reqBuyItemData);
    student_model.findOne({student_id:reqBuyItemData.student_id},(err , student_data) => {
        if (err) {
            console.log(err);
            res.status(500).send({error : 'buy item list > find student data something wrong.'})
        }
        if (!student_data) {
            res.status(400).send({error : 'ไม่พบข้อมูลนักเรียน'}) 
        }
        if (student_data) {
            category.findOne({food_id:reqBuyItemData.food_id},'food_id food_name food_price food_calories',(err , food_data) => {
                // new current money
                const newCurrentMoney = math.subtract(Number(student_data.current_money),Number(food_data.food_price));
                // console.log("New current money : " + newCurrentMoney);

                // record history
                    // init data for save student history
                const student_data_record = {
                    id_card:student_data.id_card,
                    student_id:student_data.student_id,
                    date:Date().toLocaleString(),
                    status:'ซื้อ',
                    store_number:global_data.store_number,
                    store_name:global_data.store_name,
                    food:food_data.food_name,
                    calories:food_data.food_calories,
                    deposit:'0',
                    withdraw:food_data.food_price,
                    total:newCurrentMoney,
                    responsible:'store owner:'+global_data.first_name
                }
                // console.log("Record student history model preview : ",student_data_record);

                    // init data fot save store history
                const store_data_record = {
                    store_number:global_data.store_number,
                    store_name:global_data.store_name,
                    date:Date().toLocaleString(),
                    student_id:student_data.student_id,
                    status:'ซื้อ',
                    food_id:food_data.food_id,
                    food_name:food_data.food_name,
                    // calories:food_data.food_calories,
                    income:food_data.food_price,
                    // withdraw:'0',
                    responsible:global_data.first_name
                }

                // console.log("Record store history model preview : ",store_data_record);

                    // save to model
                const studentNewHistory = new student_history(student_data_record);
                const storeNewHistory = new store_history(store_data_record);
                const msg_data = {title:'ซื้อ',message:food_data.food_name+' '+food_data.food_price+' บาท'}
                add_notification_buy(reqBuyItemData,msg_data);
                student_model.updateOne({student_id:reqBuyItemData.student_id},{current_money:newCurrentMoney},(err,studentUpdate) => {
                    // console.log("Update student : " + JSON.stringify(studentUpdate));
                    if (err) {
                        res.status(500).send({error:'Buy item : update money something wrong.'})
                    } 
                    studentNewHistory.save((err_student) => {
                        if (err_student) {
                            res.status(500).send({error:'Buy item : record student history something wrong.'})
                        } else {
                            storeNewHistory.save((err_store) => {
                                if (err_store) {
                                    res.status(500).send({error:'Buy item : record store history something wrong.'})
                                } else {
                                    res.status(200).send({success:'ซื้อขายสำเร็จ'})        
                                }
                            })
                        }
                    })
                })


            })
        }

    })
    // res.status(200).send({ success : 'ซื้ออาหารสำเร็จ'})
}

    // Notification
add_notification_buy = (data,msg_data) => {
    // data = topup data , msg_data = title, message 
    console.log("notification ADD > student data : ",data.student_id , ' / msg title : ',msg_data.title,' / msg body : ',msg_data.message);
    
    const notification_data = {id:data.student_id,title:msg_data.title,message:msg_data.message,date:Date().toLocaleString()};
    notification_model.create(notification_data, (err, insert_notification) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log('insert notification success');
            
        }
    })
    
}

// page
    // store home page
store_home_page = (req ,res) => {

    store_model.findOne({store_number:global_data.store_number},(err , store_data) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error : 'store home page > find store data something wrong.'})
        } else {
            // console.log('store food list 1 : ', store_data.menu_list);
             category.find({food_id:store_data.menu_list},'food_id food_name food_price food_calories food_quantity ',(err, store_food_list) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({ error : 'store home page > find food data something wrong.'})
                } else {
                    // console.log('store food list 2 : ', store_food_list);
                    res.status(200).render('../views/store_page/store_home',{store_data:global_data,store_food_list});
                }
            })
        }
    })

    // res.render('../views/store_page/store_home',{store_data:global_data});
} 

    // store home test page
store_home_test_page = (req ,res) => {
    res.render('../views/store_page/store_home_test',{store_data:global_data});
}

    // store report page
store_report_page = (req ,res ) => {
    store_history
    .find({store_number:global_data.store_number})
    .sort({ date: 'desc'})
    .exec((err , store_history_data) => {
        if (err) {
            res.status(500).send({error : ' find store history something wrong.'})
        }
        // console.log('history : ',store_history_data);
        
        res.status(200).render('../views/store_page/store_report',{global_data,store_history_data})
    })
}

    // format date
formatDate = (date) => {
    // req > year month day
    var Format_date = new Date(date),
        month = '' + (Format_date.getMonth() + 1 ),
        year = '' + Format_date.getFullYear();

    if (month.length < 2) {
        month = '0' + month;
    }

    return [year,month].join('-');
}

get_data_graph = (req ,res ) => {
    const selected = req.query;
    const data_to_client = [];
    console.log('selected month : ' + selected.month + ' mode : '+selected.mode);
    store_history.find({store_number:global_data.store_number})
    .exec((err , history_data) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error : 'find store history something wrong.'})
        } else {
            history_data.forEach((history_data,index) => {
                // console.log('No : '+index+' date format : ' +formatDate(calories_data.date));
                // console.log('select date  : ' +select_data.month);
                if (formatDate(history_data.date) == selected.month) {
                    data_to_client.push(history_data)
                }
            });
            // console.log('select date data : ' +data_to_client);
            res.status(200).send({data_to_client})
        }
    })
}

    // store category page
store_category_page = (req ,res) => {
    // const store_number_test = 1;
    store_model.findOne({store_number:global_data.store_number},(err , store_data) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error : 'find store data something wrong.'})
        } else {
            category.find({food_id:store_data.menu_list},'food_id food_name food_price food_calories')
            .exec((err , store_food_data) => {
                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    category.find({},'food_id food_name food_price food_calories')
                    .exec((err, food_data) => {
                        if (err) {
                            console.log(err);
                            throw err;
                        } else {
                            // console.log(store_food_data);
                            res.status(200).render('../views/store_page/store_category.ejs',{store_food_data,food_data})
                        }
                    })
                    
                }
            })
        }
    })
    
}

    // store food data
get_list = (req ,res ) => {
    const food_menu_list = [];
    const list_data_test = [1,2];
    
    store_model.findOne({store_number:global_data.store_number},(err , store_data) => {
        category.find({},'food_id')
        .exec((err , food_data) => {
            if (err) {
                throw err;
            } else {
                res.status(200).send({store_food_list:store_data.menu_list,food_data})
            }
        })
    })
    
}

    // add menu 
add_menu = (req ,res ) => {
    // const idAndMenu = req.query;
    const add_food_id = req.body;
    // store_number , food_id
    console.log(add_food_id);
    store_model.findOne({store_number:global_data.store_number},(err , found_store_data) => {
        if (err) {
            // throw err;
            res.status(500).send({ error : 'add menu something wrong.'})
        }
        if (!found_store_data) {
            console.log('Store data not found.');
            res.status(400).send({ error : 'ไม่เจอร้านค้า'})
        }
        if (found_store_data) {
            found_store_data.menu_list.push(add_food_id.food_id);
            found_store_data.save((err) => {
                if (err) {
                    // throw err;
                    res.status(400).send({ error : 'เพิ่มเมนูผิดพลาด'})
                } else {
                    res.status(200).send({success : 'เพิ่มเมนูสำเร็จ'})
                }
            });
        }
    })
    
}

    // delete menu
delete_menu = (req ,res ) => {
    const food_id = req.body.food_id;
    console.log('food id to delete : ',food_id);
    const new_list = [];

    store_model.findOneAndUpdate({store_number:global_data.store_number},{ $pull: { menu_list: food_id } },(err , store_data) => {
        if (err) {
            console.log(err);
            res.status(500).send({error : 'delete food something wrong.'})
        } else {
            console.log(store_data);
            res.status(200).send({success : 'ลบรายการสำเร็จ'})
        }
    })

}


module.exports = {
    // function
    search_student,
    buy_item,
    buy_item_list,
    get_list,
    get_data_graph,
    // page
    store_home_page,
    store_home_test_page,
    store_report_page,
    store_category_page,
    // add menu
    add_menu,
    delete_menu
}