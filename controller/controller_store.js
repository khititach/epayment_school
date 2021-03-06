const math = require('mathjs');
    // user model
const User = require('../model/User')
const user_model = User.user_model;
const store_model = User.store_model;
const student_model = User.student_model;
    // history model
const history = require('../model/history');
const student_history = history.student_history_model;
const store_history = history.store_history_model;
    // category model
const category = require('../model/category');
    // notification model
const { notification_model , receive_money_model} = require('../model/notification');
const { number, boolean } = require('mathjs');

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
                responsible:'เจ้าของร้าน:'+global_data.first_name
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
                    responsible:'เจ้าของร้าน:'+global_data.first_name
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


    // buy item more 2 order
buy_more_item = (req ,res ) => {
    const order_data = req.body;
    const cart_order = order_data.cart;
    // receive data > food id and amount , student id
    console.log(order_data);

    // find student to save history
    student_model.findOne({student_id:order_data.student_id},'-image',async(err , student_data) => {
        if (err) {
            console.log(err);
            res.status(500).send({error : 'buy more item > find student data something wrong.'})
        }
        if (!student_data) {
            res.status(400).send({error : 'ไม่พบข้อมูลนักเรียน'}) 
        }
        if (student_data) {
            // student data
            // console.log(student_data)

            // check length
            console.log('length')
            console.log(Object.keys(cart_order).length)

            // function sum all price
            total_price = function() {
                let total_all_price = 0;
                for (let i = 0; i < Object.keys(cart_order).length; i++) {
                    sum_price = cart_order[Object.keys(cart_order)[i]].food_price * cart_order[Object.keys(cart_order)[i]].amount
                    total_all_price = total_all_price + sum_price;
                }
                // console.log('sum price all : ',total_all_price)
                return total_all_price
            }

            total_calories = function() {
                let total_all_calories = 0;
                for (let i = 0; i < Object.keys(cart_order).length; i++) {
                    sum_calories = Number(cart_order[Object.keys(cart_order)[i]].food_calories) *  cart_order[Object.keys(cart_order)[i]].amount;
                    total_all_calories = total_all_calories + sum_calories;
                }
                // console.log('sum price all : ',total_all_price)
                return total_all_calories
            }

            console.log('total price : ',total_price())
            console.log('total calories : ',total_calories())

            // check student money enough for food ?
            if (student_data.current_money < total_price()) {
                res.status(400).send({ error : 'จำนวนเงินของนักเรียนไม่เพียงพอ'})
            } else {

                // student > init order to save hiatory
                const student_data_record = {
                    id_card:student_data.id_card,
                    student_id:student_data.student_id,
                    date:Date().toLocaleString(),
                    status:'ซื้อ',
                    store_number:global_data.store_number,
                    store_name:global_data.store_name,
                    deposit:'0',
                    calories:total_calories(),
                    // sum all food price in obj
                    withdraw:total_price(), 
                    total:student_data.current_money - total_price(),
                    responsible:'เจ้าของร้าน:'+global_data.first_name,
                    order_list:cart_order
                    
                }
                console.log('student data record')
                console.log(student_data_record)

                // store > init order to save hiatory
                const store_data_record = {
                    store_number:global_data.store_number,
                    store_name:global_data.store_name,
                    date:Date().toLocaleString(),
                    student_id:student_data.student_id,
                    status:'ซื้อ',
                    // calories:food_data.food_calories,
                    income:total_price(),
                    withdraw:'0',
                    responsible:global_data.first_name,
                    order_list:cart_order
                }

                console.log('store data record')
                console.log(store_data_record)

                // step init bill to save model
                    
                const studentNewHistory = new student_history(student_data_record);
                const storeNewHistory = new store_history(store_data_record);
                const msg_data = {title:'ซื้อ',message:global_data.store_name+' '+total_price()+' บาท'}
                add_notification_buy(order_data,msg_data);

                // new current money student
                const newCurrentMoney = math.subtract(Number(student_data.current_money),Number(total_price()));

                // save to model

            
                store_model.findOne({store_number:global_data.store_number},'store_number uid current_money',(err, store_data) => {
                    if (err) {
                        console.log('update store money function something wrong')
                    }
                    if (store_data) {
                        // console.log('store_data')
                        // console.log(store_data)
                        new_money = store_data.current_money + total_price();
                        // console.log('new_money')
                        // console.log(new_money)
                        console.log('store new current money')
                        console.log(new_money)

                        // update student money
                        student_model.updateOne({student_id:order_data.student_id},{current_money:newCurrentMoney},(err,studentUpdate) => {
                            // console.log("Update student : " + JSON.stringify(studentUpdate));
                            if (err) {
                                res.status(500).send({error:'Buy item : update money something wrong.'})
                            } 
                            // store money update
                            store_model.updateOne({store_number:global_data.store_number},{current_money:new_money},(err, store_update) => {
                                if (err) {
                                    console.log('update store money fail > ',err)
                                    res.status(500).send({error:'update store money something wrong.'})
                                } else {

                                    studentNewHistory.save((err_student) => {
                                        if (err_student) {
                                            console.log('save student history fail')
                                            res.status(500).send({error:'Buy item : record student history something wrong.'})
                                        } else {
                                            console.log('save student history success')
                                            storeNewHistory.save((err_store) => {
                                                if (err_store) {
                                                    console.log('save store history fail')
                                                    res.status(500).send({error:'Buy item : record store history something wrong.'})
                                                } else {
                                                    console.log('save store history success')
                                                    res.status(200).send({success:'ซื้อขายสำเร็จ'})        
                                                }
                                            })
                                        }
                                    })

                                }
                            })
                            
                        })

                    }
                })
                

                

                   



            }
        }
    })
}

    // Notification
add_notification_buy = (data,msg_data) => {
    // data = topup data , msg_data = title, message 
    console.log("notification ADD > student data : ",data.student_id , ' / msg title : ',msg_data.title,' / msg body : ',msg_data.message);
    
    const notification_data = {student_id:data.student_id,title:msg_data.title,message:msg_data.message,date:Date().toLocaleString()};
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
            category.find({food_id:store_data.menu_list},'food_id food_name food_price food_calories food_quantity ')
            // .sort({ food_id : "asc"  })
            .exec((err, store_food_list) => {
                // console.log("store_food_list : " ,store_food_list);
                
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
    // console.log('selected month : ' + selected.month + ' mode : '+selected.mode);
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

get_food_sales = (req ,res ) => {
    const selected = req.query;
    const data_to_client = [];
    // console.log('selected month : ' + selected.month);
    store_history.find({$and:[{store_number:global_data.store_number},{status:'ซื้อ'}]},'store_number date food_id food_name order_list',(err , history_data) => {
        if (err) {
            throw err;
        } else {
            history_data.forEach((history_data,index) => {
                // console.log('No : '+index+' date format : ' +formatDate(calories_data.date));
                // console.log('select date  : ' +select_data.month);
                if (formatDate(history_data.date) == selected.month) {
                    data_to_client.push(history_data)
                }
            });
            // console.log('data to client  : ' +data_to_client);
            res.status(200).send(data_to_client)
        }
    }).sort({food_id : 'asc'});
}

    // store download report page
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

get_order_list = (req ,res ) => {
    const id_order = req.query.id
    // console.log('id ', id_order);

    store_history.findOne({_id:id_order},'income order_list',(err , order_list_data) => {
        if (err) {
            console.log('find order in store history something wrong. > ', err)
        }
        if (!order_list_data) {
            console.log('Not found order')
            res.status(400).send({ error : 'ไม่เจอรายการซื้อ'})
        }
        if (order_list_data) {
            // console.log('order list')
            // console.log(order_list_data)

            res.status(200).send({ success : order_list_data})
        }
    })
}

get_current_money = (req ,res) => {
    store_model.findOne({store_number:global_data.store_number},'store_number current_money',(err, store_data) => {
        if (err) {
            console.log('get current money something wrong. > ',err)
        } else {
            res.status(200).send({success:store_data})
        }
    })
}

    // check request receive money in db
check_req_receive_money = (req ,res ) => {
    receive_money_model.findOne({$and:[{store_number:global_data.store_number},{status:'Disapproval'}]},(err, req_data) => {
        if (err) {
            console.log('check request receive money somthing wrong. > '+err)
        }
        if (req_data) {
            console.log(req_data)
            // res.status(200).send({success:req_data})
            if (req_data.status === 'Approve') {
                res.status(200).send({success:true})
            }
            if (req_data.status === 'Disapproval') {
                res.status(200).send({success:false})
            }
        }
    })
}

receive_money = (req ,res ) => {
    const req_data = req.body.store_number;
    console.log('store number > '+req_data+ ' to receive money');


    const init_req_receive = {
        store_number:req_data,
        title:'คำขอรับเงิน',
        status:'Disapproval',
        request_date:Date().toLocaleString(),
        accept_date:''
    }

    console.log('init req receive money')
    console.log(init_req_receive)

    const initReqReceive = new receive_money_model(init_req_receive)

    console.log('init req receive money model')
    console.log(initReqReceive)


    receive_money_model.create(init_req_receive,(err , req_receive_money_data) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log('insert request receive money success');
            res.status(200).send({success:'ส่งคำขอรับเงินสำเร็จ'})
        }
    })

}

download_report_page = (req ,res ) => {
    const month = req.body.month;
    const data_selected_month = [];
    // console.log('month : ',month);
    
    store_history
    .find({store_number:global_data.store_number})
    .sort({ date: 'desc'})
    .exec((err , store_history_data) => {
        if (err) {
            res.status(500).send({error : ' find store history something wrong.'})
        } else {
            // console.log(store_history_data);
            
            store_history_data.forEach((data,index) => {
                // console.log('data : ',data);
                
                if (formatDate(data.date) == month) {
                    data_selected_month.push(data)
                    
                }
            })
            // console.log('data_selected_month : ',data_selected_month);
            
            res.status(200).render('../views/store_page/report_component/pdf_page.ejs',{global_data,store_history_data:data_selected_month})
        }
        // console.log('history : ',store_history_data);
        
        // res.status(200).render('../views/store_page/report_component/pdf_page.ejs',{global_data,store_history_data})
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

    // store change password
store_change_password_page = (req ,res ) => {
    // console.log('store data : ',global_data);
    store_model.findOne({uid:global_data.uid},(err, store_data ) => {
        if (err) {
            throw err;
        } else {
            res.status(200).render('../views/store_page/store_edit',{store_data})
        }
    })
    
}
change_password = (req ,res ) => {
    const req_change_password = req.body;
    console.log('req change password : ',req_change_password);

    var newPassword = User.user_model.generateHash(req_change_password.new_password);

    user_model.updateOne({uid:global_data.uid},{password:newPassword},(err) => {
        if (err) {
            res.status(500).send({ error : 'update password something wrong.'})
        } else {
            console.log('password updated.');
            res.status(200).send({ success : 'เปลี่ยนรหัสผ่านเสร็จสิ้น'})
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
    get_food_sales,
    change_password,
    // page
    store_home_page,
    store_home_test_page,
    store_report_page,
    store_category_page,
    download_report_page,
    store_change_password_page,
    // add menu
    add_menu,
    delete_menu,
    // test
    buy_more_item,
    get_order_list,
    get_current_money,
    receive_money,
    check_req_receive_money
}