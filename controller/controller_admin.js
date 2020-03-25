const math = require('mathjs');
const bcrypt = require('bcryptjs');
const fs = require('fs');
    // school data
let config_file = fs.readFileSync('./config/school_data.json');
let school_data = JSON.parse(config_file);
    // user model
const User = require('../model/User')
const user_model = User.user_model;
const student_model = User.student_model;
const store_model = User.store_model;
const admin_model = User.admin_model;
    // history model
const history = require('../model/history');
const student_history = history.student_history_model;
    // category model
const category = require('../model/category');
    // notification model
const notification_model = require('../model/notification');


// const school_model = require('../model/School');

// other function
    // format date
formatDate_for_password = (date) => {
    // req > year month day
    var Format_date = new Date(date),
        month = '' + (Format_date.getMonth() + 1 ),
        day = '' + Format_date.getDate(),
        year = '' + Format_date.getFullYear();

    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }
    return [year,month,day].join('');
}

format_store_number = (store_number) => {
    // console.log('format store number : ',store_number);
    if (store_number < 10) {
        // console.log('between 1 - 9');
        
        store_number = '00' + store_number;
    }
    else if (store_number >= 10 && store_number < 100) {
        // console.log('between 10 - 99');
        store_number = '0' + store_number;
    }
    else if (store_number >= 100 && store_number < 1000) {
        // console.log('between 100 - 999');
    }
    
    return store_number;
    // no function
}

format_food_id = (food_id) => {
    console.log('format food id : ', food_id);
    if (food_id < 10) {
        console.log('food id between 1 - 9');
        food_id = '000' + food_id;
    }
    else if (food_id >= 10 && food_id < 100) {
        console.log('food id between 10 - 99');
        food_id = '00' + food_id;
    }
    else if (food_id >= 100 && food_id < 1000) {
        console.log('food id between 100 - 999');
        food_id = '0' + food_id;
    }
    else if (food_id >= 1000 && food_id < 10000) {
        console.log('food id between 1000 - 9999');
    }

    return food_id;
    
}

    // generate username (store and admin)
generate_username = (username) => {
    // console.log(username);
    var modify_username = [];
    for (let i = 6; i < username.length; i++) {
        const int_pass_for_number = username[i];
        modify_username.push(int_pass_for_number);
    }
    // console.log(modify_username.join('').toString());
    var new_username = modify_username.join('').toString();
    return new_username;
}

    // Notification
add_notification = (data,msg_data) => {
    // data = topup data , msg_data = title, message 
    console.log("student data : ",data , ' / msg title : ',msg_data.title,' / msg body : ',msg_data.message);
    
    const notification_data = {student_id:data.student_ID,title:msg_data.title,message:msg_data.message,date:Date().toLocaleString()};
    notification_model.create(notification_data, (err, insert_notification) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log('insert notification success');
            
        }
    })
    
}

    // Sidebar get name
sidebar_get_name = (req ,res) => {
    res.status(200).send(global_data)
}

    // Search student
search_student = (req ,res ) => {
    const idcard = req.body.idcard;
    // console.log(idcard);
    // console.log('ID Card : ' + JSON.stringify(idcard));
    
    const student_fake = {
        id_card : '123456789',
        student_id : '123456',
        pre_name : 'Mr.',
        first_name : 'khititach',
        last_name : 'kamjohn',
        current_money : 0
    };

    student_model.findOne({$or:[{student_id:idcard},{id_card:idcard}]},(err ,studentData) => {
        // console.log(studentData);
        if (err) {
            // throw err;
            res.status(500).send({error:'searching stundet something wrong.'})
        } 
        if (!studentData) {
            res.status(400).json({error:'ไม่พบข้อมูลนักเรียน'})
        }
        if (studentData) {
            res.status(200).json({success : studentData});
        }
    })
}

    // Top up and record history
topup = (req ,res ) => {
    const reqTopup = req.body;
    console.log("req top up : " + JSON.stringify(reqTopup));

    // increase current money
    
    student_model.findOne({student_id:reqTopup.student_ID},(err , studentData) => {
        // console.log("Found student : " + studentData);
        if (err) {
            res.status(500).send({error:'Top-up something wrong.'})
        } 
        if (!studentData) {
            res.status(400).send({error:'student not found.'})
        } 
        if (studentData) {
            // new current money
            const newCurrentMoney = math.add(Number(reqTopup.amount_Topup),Number(studentData.current_money));
            // console.log("New current money : " + newCurrentMoney);

            // record history
                // init data for save history
            const student_data_record = {
                id_card:studentData.id_card,
                student_id:studentData.student_id,
                date:Date().toLocaleString(),
                status:'เติมเงิน',
                store_number:0,
                store_name:'-',
                food:'-',
                calories:'-',
                deposit:reqTopup.amount_Topup,
                withdraw:'0',
                total:newCurrentMoney,
                responsible:'admin:' + global_data.first_name
            }
            // console.log("Record history model preview : " + JSON.stringify(student_data_record));

            const studentNewHistory = new student_history(student_data_record);
            // console.log("Record history preview : " + studentNewHistory);
            const msg_data = {title:'เติมเงิน',message:reqTopup.amount_Topup+' บาท'}
            add_notification(reqTopup,msg_data);
            student_model.updateOne({student_id:reqTopup.student_ID},{current_money:newCurrentMoney},(err,studentUpdate) => {
                // console.log("Update student : ", studentUpdate);
                if (err) {
                    res.status(500).send({error:'Top-up : update money something wrong.'})
                } 
                
                studentNewHistory.save((err) => {
                    if (err) {
                        res.status(500).send({error:'Top-up : record history something wrong.'})
                    } else {
                        res.status(200).json({success:'เติมเงินสำเร็จ'})        
                    }
                })
            })
        }
    })
}

// Router page
    // Admin hone page
admin_home_page = async (req ,res ) => {
    // console.log(global_data);
        // student conut
    const student_count = await user_model.countDocuments({role:'นักเรียน'},(err , user_student_data_count) => {
        if (err) {
            throw err;
        }
        // console.log('student count : ',user_student_data_count);
        return user_student_data_count;
    })

        // store conut
    const store_count = await user_model.countDocuments({role:'ร้านค้า'},(err , user_store_data_count) => {
        if (err) {
            throw err;
        }
        // console.log('student count : ',user_store_data_count);
        return user_store_data_count;
    })

        // food count
    const food_count = await category.countDocuments({},(err , food_data_count) => {
        if (err) {
            throw err;
        }

        return food_data_count;
    })

    console.log('student count : ', student_count,' / store count : ',store_count, ' / food count : ',food_count);
    
    res.render('../views/admin_page/admin_home',{admin_data:global_data,student_count,store_count,food_count});
}

    // Register student
register_student_page = (req ,res ) => {
    res.render('../views/admin_page/admin_register_student');
}

register_student = (req ,res ) => {
    const student_data = req.body;
    console.log('Request user data : ' + JSON.stringify(student_data));  
    console.log(student_data.studentID);
    
    // check studentId and idcard in school 

    user_model.findOne({$or:[
       {username:student_data.studentID},
       {uid:student_data.uid}
    ]},(err, found_user_data) => {
        if (err) {
            throw err;
        }
        if (found_user_data) {
            console.log("found user : " + found_user_data);
            res.send("found user : " + found_user_data);
        } else {
            student_model.findOne({$or:[{uid:student_data.uid},{student_id:student_data.studentID},{id_card:student_data.idCard}]},(err, found_student_data) => {
                if (err) {
                    // throw err;
                    console.log("ERROR > " + err);
                    res.send('ERROR')
                } 
                if (found_student_data) {
                    console.log("student is already.");
                    res.send('student is already.')
                } else {
                    console.log("นักเรียน " + student_data.pName + " " +student_data.fName + " " + student_data.lName + " สามารถสมัครได้");
                    const newStudent = new student_model({
                        uid:student_data.uid,
                        current_money:0,
                        class:student_data.class,
                        room:student_data.room,
                        weight:student_data.weight,
                        height:student_data.height,
                        image:'',
                        pre_name:student_data.pName,
                        first_name:student_data.fName,
                        last_name:student_data.lName,
                        dob:student_data.dob,
                        sex:student_data.sex,
                        address:student_data.address,
                        tel:student_data.tel,
                        student_id:student_data.studentID,
                        id_card:student_data.idCard,
                        email:student_data.email,
                        parent_pre_name:student_data.parentPName,
                        parent_fname:student_data.parentFName,
                        parent_lname:student_data.parentLName,
                        parent_tel:student_data.parentTel
                    });
        
                    const newUser = new user_model({
                        username:student_data.studentID,
                        password:User.user_model.generateHash(formatDate_for_password(student_data.dob)),
                        role:student_data.role,
                        uid:student_data.uid,
                    })
        
                    // console.log("New User : " + newUser);
                    // console.log("New Student : " + newStudent);
                    // res.send("register complete.");
        
                    newUser.save((err) => {
                        if(err){
                            console.log("save user error > " + err);
                            res.send("error")
                            // throw err;
                        } else {
                            newStudent.save((err) => {
                                if(err){
                                    console.log("save student error > " + err);
                                    res.send("error")
                                    // throw err;
                                } else {
                                
                                    res.send(newStudent);
                                }
                            })
                        }
                    }) 
        
                }
            })
            
        }
        
    })
        

}

    // Register Store
register_store_page = async (req ,res) => {
        // old code register store page 
    // const Num_of_store = school_data.Number_of_stores;
    // const store_number_available = [];
    // for (let i = 1; i <= Num_of_store; i++) {
    //     await store_model.findOne({},'store_number',(err , store_data) => {
    //         console.log('found data : ',store_data);
            
    //         if (err) {
    //             throw err;
    //         }
    //         if (!store_data) {
    //             store_number_available.push(i)
    //         }
    //     })
        
    // }

        // new code v2 register store oage
    await store_model.find({}).limit(1).sort({store_number:-1}).exec((err,store_data) => {
        if (err) {
            throw err;
        } else {
            console.log(store_data[0].store_number);
            console.log(Number(store_data[0].store_number) + 1);
            
            const store_number_available = format_store_number(Number(store_data[0].store_number) + 1);
            // const new_store_number = format_store_number(130);
            console.log(store_number_available);
            res.render('../views/admin_page/admin_register_store',{store_number_available});
        }
    })
    
    
    // res.render('../views/admin_page/admin_register_store',{store_number_available});
}

register_store = (req ,res ) => {
    const store_data = req.body;
    // console.log(store_data);
    const new_Username = 'store'+generate_username(store_data.tel);
    
    user_model.findOne({$or:[
        {username:new_Username},
        {uid:store_data.uid}
    ]},(err, found_user_data) => {
        if (err) {
            res.status(400). res.render('../views/admin_page/admin_register_store');
        }
        if (found_user_data) {
            console.log("found user : " + found_user_data);
            // res.status(400).send("found user : " + found_user_data);
            res.status(400).render('../views/admin_page/admin_register_store');
        } else {
            store_model.findOne(
                {$or:[
                    {uid:store_data.uid},
                    {store_number:store_data.storeNumber}
                ]},(err , found_store_data) => {
                    if (err) {
                        throw err;
                    }
                    if (found_store_data) {
                        console.log("Can not register store, this store is already.");
                        res.send("this store is already.");
                    } else {
                        console.log("ร้านค้า "+ store_data.storeName +" สามารถสมัครได้");
                        const newStore = new store_model({
                            current_money:0,
                            image:"image to based 64",
                            pre_name:store_data.pName,
                            first_name:store_data.fName,
                            last_name:store_data.lName,
                            dob:store_data.dob,
                            sex:store_data.sex,
                            uid:store_data.uid,
                            address:store_data.address,
                            tel:store_data.tel,
                            email:store_data.email,
                            store_name:store_data.storeName,
                            store_number:store_data.storeNumber,
                            store_status:'เปิด',
                            menu_list:[]
                        });
        
                        const newUser = new user_model({
                            username:new_Username,
                            password:User.user_model.generateHash(formatDate_for_password(store_data.dob)),
                            // role:store_data.role,
                            role:'ร้านค้า',
                            uid:store_data.uid,
                        })
        
                        // console.log(newStore);
                        
                        newUser.save((err) => {
                            if(err){
                                console.log("save user error > " + err);
                                res.send("error")
                                // throw err;
                            } else {
                                newStore.save((err) => {
                                    if(err){
                                        console.log("save student error > " + err);
                                        res.send("error")
                                        // throw err;
                                    } else {
                                    
                                        res.status(200).send({success : 'สมัครร้านค้าเสร็จสิ้น'});
                                        // res.redirect('/admin');
                                    }
                                })
                            }
                        }) 
                    }
                })  
        }
    })
    
    
}

    // register auto check
        // Telephone Number
        // Store name
        // Store number
        // UID
register_store_check = (req ,res ) => {
    const data_check = req.body;
    // data & name_field_data
    console.log(data_check);
    
    store_model.findOne({$or:[
        {tel:data_check.data},
        {store_number:data_check.data},
        {store_name:data_check.data},
        {uid:data_check.data} 
    ]},(err, found_store_data) => {
        // console.log(found_store_data);
        if (err) {
            throw err;
        }
        if (!found_store_data) {
            res.status(200).send({success : 'สามารถใช้ได้'})
        } else {
            res.status(400).send({error : 'มีผู้ใช้แล้ว'})
        }
    })
}

register_store_check_store_name = (req ,res ) => {
    const data_check = req.body;
    // data & name_field_data
    console.log(data_check);
    
    store_model.findOne({store_name:data_check.data},(err, found_store_data) => {
        // console.log(found_store_data);
        if (err) {
            throw err;
        }
        if (!found_store_data) {
            res.status(200).send({success :'สามารถใช้ได้'})
        } else {
            res.status(400).send({error :'มีผู้ใช้แล้ว'})
            
        }
    })
}

    // edit student
edit_student_page = (req ,res ) => {
    student_model
    .find({}).sort({student_id:'asc'})
    .exec((err, student_data) => {
        if (err) {
            res.send('ERROR > somthing wrong.')
        } else {
            res.render('./admin_page/admin_edit_student',{student_data});
        }
    })
    
}

edit_student_detail_page = (req ,res ) => {
    const data = req.params;
    console.log(data);
    student_model.findOne({student_id:data.student_id},(err , student_data) => {
        // console.log(student_data);
        
        res.render('./admin_page/admin_edit_student_detail',{student_data});
    })
    
}

    // edit store
edit_store_page = (req ,res ) => {
    store_model
    .find({}).sort({ store_number: 'asc' })
    .exec((err,store_data)=>{
        if (err) {
            res.send('ERROR something.');
            // throw err;
        } else {
            res.render('./admin_page/admin_edit_store',{store_data});
        }
    })
}

edit_store_detail_page = (req ,res ) => {
    const store_NO = req.params;
    console.log(store_NO);
    store_model.findOne({store_number:store_NO.id},(err , store_data) => {
        res.render('./admin_page/admin_edit_store_detail',{store_data});
    })
}

        // Store edit profile  
edit_store_profile = (req ,res ) => {
    const reqEditProfile = req.body.newReqEditProfile;
    console.log("edit_store_profile : "+ JSON.stringify(reqEditProfile));
    if (!reqEditProfile.newNumTel && !reqEditProfile.newEmail) {
        res.json({error : "Not req for edit profile."})
    }
    // else if (reqEditProfile.newNumTel && reqEditProfile.newEmail) {
    //     store_model.findOneAndUpdate({uid:reqEditProfile.user_uid},{tel:reqEditProfile.newNumTel,email:reqEditProfile.newEmail},{new:true},(err,user) => {
    //         if (err) {
    //             // res.json({error : "Change profile something wrong."});
    //             res.status(500).json({error: 'Change profile something wrong.'}); 
    //         } else {

    //             res.json({success : "Changed new number telephone and new email success."})
    //         }
    //     })
    // }
    // else if (reqEditProfile.newNumTel) {
    //     store_model.findOneAndUpdate({uid:reqEditProfile.user_uid},{tel:reqEditProfile.newNumTel},{new:true},(err,user) => {
    //         if (err) {
    //             // res.send({error : "Change profile something wrong."});
    //             res.status(500).json({error: 'Change profile something wrong.'}); 
    //         } else {
    //             res.json({success : "Changed new number telephone success."})
    //         }
    //     })
    // }
    else if (reqEditProfile.newEmail) {
        store_model.findOneAndUpdate({uid:reqEditProfile.user_uid},{email:reqEditProfile.newEmail},{new:true},(err,user) => {
            if (err) {
                // res.json({error : "Change profile something wrong."});
                res.status(500).json({error: 'Change profile something wrong.'}); 
            } else {
                res.json({success : "Changed new email success."})        
            }
        })
    }
}

        // Store change password
edit_store_change_password = (req ,res ) => {
    const store_data_CP = req.body;
    // console.log("User : " + store_data_CP.store_uid + " / New Password : " + store_data_CP.new_password);
    const new_password_hash = user_model.generateHash(store_data_CP.new_password);
    // console.log("New password hash : "+ new_password_hash)
    user_model.findOneAndUpdate({uid:store_data_CP.store_uid},{password:new_password_hash},{new: true},(err, user) => {
        if (err) {
            res.status(400).send({error : "Change password something wrong."});
        }
        res.status(200).send({success : "เปลี่ยนรหัสผ่านสำเร็จ."});
    })
}
        // store change status
edit_store_change_status = (req ,res ) => {
    const req_change_status = req.body;
    // console.log('req change status : ',req_change_status);
    store_model.updateOne({store_number:req_change_status.store_number},{store_status:req_change_status.status},(err ) => {
        if (err) {
            throw err;
        } else {
            // console.log('changed status');
            res.status(200).send({success : req_change_status.status+'ร้านค้าแล้ว'})
            
        }
    })
    
}
        // store reset password
reset_store_password = (req ,res ) => {
    const ReqResetPassword = req.body;
    // console.log('req reset password : ',ReqResetPassword);
    // console.log('defaul password : ',formatDate_for_password(ReqResetPassword.store_dob));
    
    if (bcrypt.compareSync(ReqResetPassword.admin_password, req.user.password) === false) {
        res.status(400).send({error : 'รหัสผ่านแอดมินไม่ถูกต้อง'})
    } else {
        user_model.updateOne({uid:ReqResetPassword.store_uid},{password:User.user_model.generateHash(formatDate_for_password(ReqResetPassword.store_dob))},(err) => {
            if (err) {
                throw err;
            } else {
                res.status(200).send({success : 'รีเซ็ตรหัสผ่านสำเร็จ'})
            }
        })
    }
}

        // Delete store ** test req ** use delete_user
delete_store = (req, res) => {
    const req_uid_store = req.body.store_user_uid;
    console.log("Store delete : " + req_uid_store);
    res.json({success : "Deleted Store."});
}

    // category page
category_page = (req ,res ) => {
    category.find({},(err , food_data) => {
        if (err) {
            console.log(err);
            res.render('../views/admin_page/admin_category.ejs',{error:'Get food data something wrong.'})
        } else {
            res.render('../views/admin_page/admin_category',{food_data});
        }
    })
    
}

category_add_page = (req ,res ) => {
    res.render('../views/admin_page/category_component/category_add');
}
        // menu function
            // add
category_add = async (req ,res ) => {
    const AddMenuReq = req.body;
    // console.log(AddMenuReq);
    // console.log(AddMenuReq.food_data);
    const food_already = [];
    const food_avaliable = [];

        // new code : find food in db
    var process_promise = new Promise((resolve,reject) => {
        AddMenuReq.food_data.forEach(data => {
            // console.log('data : ',data);
            
            category.findOne({$or:[{food_id:data.food_id},{food_name:data.food_name}]},(err , found_food_data) => {
                // console.log('found data : ',found_food_data);
                
                const food_Data = new category({
                        food_id:data.food_id,
                        food_name:data.food_name,
                        food_price:data.food_price,
                        food_calories:data.food_calories,
                        food_quantity:data.food_quantity,
                        food_image:'',
                    });
                
                // console.log('food data model : ',food_Data);
                    

                if (err) {
                    console.log(err);
                    res.status(500).send({error : 'found food something wrong'});
                }
                if (found_food_data != null) {
                    // console.log('found food data');
                    
                    food_already.push(food_Data)
                    // console.log('food already : ',food_already);
                    resolve();
                }
                if (found_food_data == null) {

                    // console.log('New model : ');
                    // console.log(food_Data);
                    food_avaliable.push(food_Data)
                    // console.log('food avaliable : ',food_avaliable);
                    resolve();
                }
            })
        })
    })
    process_promise.then(() => {

        console.log('Process data done');
        console.log('food already : ',food_already);
        console.log('food avaliable : ',food_avaliable);
        category.insertMany(food_avaliable,(err , found_food_Data) => {
            if (err) {
                console.log(err);
                res.status(500).send({error : 'insert new food something wrong.'});
            } else {
                res.status(200).send({success:'เพิ่มอาหาร '+ found_food_Data.length +' รายการสำเร็จ', error:'มีรายการในคลังอาหารแล้ว ' + food_already.length + ' รายการ'})
            }
        })
    })

}

category_add_check = (req ,res) => {
    const AddMenuAutoCheckReq = req.body;
    // console.log(AddMenuAutoCheckReq);

    category.findOne({$or:[{food_id:AddMenuAutoCheckReq.food_id},{food_name:AddMenuAutoCheckReq.food_name}]},(err , found_food_Data) => {
        if (err) {
            console.log(err);
            res.status(500).send({error : 'auto find food something wrong'});
        }
        if (found_food_Data) {
            res.status(400).send({error : 'อาหาร ' + AddMenuAutoCheckReq.name_food_data + ' มีในคลังอาหารแล้ว'});
        }
        if (!found_food_Data) {
            // if (AddMenuAutoCheckReq.name_food_data == 'food_id') {
            //     res.status(200).send({success : 'ID : ' + AddMenuAutoCheckReq.name_food_data + 'สามารถเพิ่มได้'});
            // }
            // if (AddMenuAutoCheckReq.name_food_data == 'food_name') {
            //     res.status(200).send({success : 'ID : ' + AddMenuAutoCheckReq.name_food_data + 'สามารถเพิ่มได้'});
            // }
            res.status(200).send({success : 'ID : ' + AddMenuAutoCheckReq.name_food_data + 'สามารถเพิ่มได้'});
        }
    })
    
}

get_food_id_list = (req ,res ) => {
    category.find({},'food_id',(err ,food_id_list ) => {
        if (err) {
            throw err;
        } else {
            res.status(200).send({food_id_list})
        }
    })
}

            // edit
category_edit_page = (req ,res ) => {
    res.render('../views/admin_page/category_component/category_edit')
}

        // category check name
category_edit_check_name = (req ,res ) => {
    const CheckFoodNameReq = req.body;
    console.log(CheckFoodNameReq);
    category.findOne({food_name:CheckFoodNameReq.food_name},(err , food_data) => {
        if (err) {
            console.log(err);
            res.status(500).send({error : 'find food name something wrong.'})
        }
        if (food_data) {
            res.status(400).send({error : 'มีชื่อในรายการอาหารแล้ว'})
        }
        if (!food_data) {
            res.status(200).send({success : 'สามารถใช้ชื่ออาหารได้'})
        }
    })    
}

category_edit = async (req ,res ) => {
    const EditMenuReq = req.body;
    // food_id , dataEdit (price) , image {food_price:EditMenuReq.food_price}
    // console.log(EditMenuReq);
    // await category.findOne({$or:[{food_id:EditMenuReq.food_id},{food_name:EditMenuReq.food_name}]},(err , food_data ) => {
    //     if (err || food_data) {
    //         // res.status(500).send({error : 'Find food for new food data something wrong.'})
    //         res.status(400).send({error : 'ไม่สามารถใช้ชื่ออาหารได้'})
    //     }
    // })   

    category.findOneAndUpdate({food_id:EditMenuReq.food_id},
            {food_name:EditMenuReq.food_name,
            food_price:EditMenuReq.food_price,
            food_calories:EditMenuReq.food_calories,
            food_quantity:EditMenuReq.food_quantity,
            food_image:EditMenuReq.image_base64},
        (err , food_data) => {
        if (err) {
            console.log(err);
            res.status(500).send({error : 'Edit food data something wrong.'})
        } else {
            res.status(200).send({success : 'แก้ไขสำเร็จ'})
        }
    })

}

            // delete
category_delete = (req ,res ) => {
    const DelMenuReq = req.body;
    // console.log(DelMenuReq);
    
    category.findOneAndDelete({food_id:DelMenuReq.food_id},(err , data) => {
        if (err) {
            console.log(err);
            res.status(500).send({error : 'delete food by id something wrong.'})
        } else {
            res.status(200).send({success : 'ลบอาหารแล้ว'})
        }
    })
}

// For dev
    // add school
add_school = (req, res) => {
    const req_school_data = req.query;
    console.log("TCL: add_school -> school_data", req_school_data);
    school_model.findOne({รหัสโรงเรียน:req_school_data.รหัสโรงเรียน},(err , data) => {
        if (err) {
            throw err;
        }
        if (data) {
            console.log("มีรหัสโรงเรียนแล้ว");
            res.send("มีรหัสโรงเรียนแล้ว");
        } else {
            const school_data = new school_model(req_school_data);
            school_data.save((err) => {
                if (err) {
                    throw err;
                } else {
                    res.send("add school complete." + school_data);
                }
                
            })
        }
    })
    
}

    // test function
test_function = (req ,res ) => {
// test function formatDate_for_password
    // const req_date = req.query;
    // console.log("TCL: test_function -> date", req_date.date)
    // console.log("TCL: test_function -> formatDate(date)", formatDate_for_password(req_date.date))
    // var newDate = new Date(req_date.date);
    // console.log("TCL: test_function -> newDate", newDate)
    // res.send(formatDate_for_password(req_date.date));
// test function formatDate_for_password
}

    // register admin
register_admin_page = (req ,res ) => {
    const pass_dev = req.params.password;
    if (pass_dev == 'devaddadministrator') {
        res.render('../views/admin_page/admin_register_admin')
    } else {
        res.send("<h1 style='color:red'>YOU AREN'T DEVELOPER, CONTACT DEV FOR REGISTER ADMIN.</h1>")
    }
    
}

register_admin = (req ,res ) => {
    const admin_data = req.body;
    console.log("TCL: register_admin -> admin_data", admin_data);
    const new_Username = 'admin'+generate_username(admin_data.tel);
    console.log(new_Username);

    user_model.findOne({$or:[
        {username:new_Username},
        {uid:admin_data.uid}
    ]},(err, found_user_data) => {
        if (err) {
            throw err;
        }
        if (found_user_data) {
            console.log("found user : " + found_user_data);
            res.send("found user : " + found_user_data);
        } else {
            admin_model.findOne({uid:admin_data.uid},(err, found_admin_data) => {
                if (err) {
                    throw err;
                }
                if (found_admin_data) {
                    console.log("Can not register admin, this admin is already.");
                    res.send("this admin is already.");
                } else {
                    const newAdmin = new admin_model({
                        pre_name:admin_data.pName,
                        first_name:admin_data.fName,
                        last_name:admin_data.lName,
                        dob:admin_data.dob,
                        sex:admin_data.sex,
                        uid:admin_data.uid,
                        address:admin_data.address,
                        tel:admin_data.tel,
                        email:admin_data.email,
                    });
    
                    const newUser = new user_model({
                        username:new_Username,
                        password:User.user_model.generateHash(formatDate_for_password(admin_data.dob)),
                        role:admin_data.role,
                        uid:admin_data.uid,
                    })

                    // console.log(newAdmin);
                    // res.send(newAdmin);
    
                    newUser.save((err) => {
                        if(err){
                            console.log("save user error > " + err);
                            res.send("error")
                            // throw err;
                        } else {
                            newAdmin.save((err) => {
                                if (err) {
                                    console.log("save user, something wrong.");
                                    throw err;
                                } else {
                                    console.log("register admin complete.");
                                    res.send(newAdmin);
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

    // delete user
delete_user = (req ,res ) => {
    const req_del_user =  req.body;
    console.log(req_del_user);
    // console.log(req.user.password);
    // console.log(bcrypt.compareSync(req_del_user.admin_password, req.user.password));   

    if (bcrypt.compareSync(req_del_user.admin_password, req.user.password) === false) {
        res.status(400).send({error : 'รหัสผ่านแอดมินไม่ถูกต้อง'})
    } 
    if (bcrypt.compareSync(req_del_user.admin_password, req.user.password) === true) {
        // res.status(200).send({error : 'รหัสผ่านแอดมินถูกต้อง'})
         user_model.findOneAndDelete({uid:req_del_user.uid},(err,user) => {
            if (err) {
                throw err;
            } 
            if (!user) {
                console.log('User not found.');
                res.send('User not found.');
            } else {
                console.log(user);
                if (user.role == 'นักเรียน') {
                    student_model.findOneAndDelete({uid:req_del_user.uid},(err) => {
                        if (err) {
                            throw err;
                        } 
                        return res.status(200).send('Delete complete.')
                    })
                }
                if (user.role == 'ร้านค้า') {
                    store_model.findOneAndDelete({uid:req_del_user.uid},(err) => {
                        if (err) {
                            throw err;
                        } 
                        return res.status(200).send({success : "ลบร้านค้าสำเร็จ"});
                    })
                }
                if (user.role == 'แอดมิน') {
                    admin_model.findOneAndDelete({uid:req_del_user.uid},(err) => {
                        if (err) {
                            throw err;
                        } 
                        return res.status(200).send('Delete complete.')
                    })
                }
            }
        })
    }
}

module.exports = {

    admin_home_page,
    // topup
    search_student,
    topup,
    // resgister 
    register_student_page,
    register_store_page,
    register_student,
    register_store,
    // regiter auto check
    register_store_check,
    register_store_check_store_name,
    // edit 
    edit_student_page,
    edit_student_detail_page,
    edit_store_page,
    edit_store_detail_page,
    edit_store_profile,
    edit_store_change_password,
    edit_store_change_status,
    reset_store_password,
    delete_store,
    // category 
    category_page,
    category_add_page,
    category_add,
    category_edit,
    category_delete,
        // function
    get_food_id_list,
    // dev zone
    add_school,
    test_function,
    register_admin_page,
    register_admin,
    delete_user,
    // other Function
    sidebar_get_name,
    category_add_check,
    category_edit_check_name,
    // test page
    category_edit_page

}