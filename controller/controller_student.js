const User = require('../model/User');
const user_model = User.user_model;
const student_model = User.student_model;
    // history model
const history = require('../model/history');
const student_history = history.student_history_model;
    // notification model
const notification_model = require('../model/notification');

    // student home page
student_home_page = (req ,res) => {
    // console.log(student_data);
    var student_data = global_data;
    notification_model.find({id:global_data.student_id})
    .sort({date : 'desc'})
    .exec((err , posts) => {
        // console.log('post : ',posts);
        
        res.render('../views/student_page/student_home',{student_data,posts});
    })
    
}

    // student setting page
student_setting_page = (req ,res ) => {
    // var student_data = global_data;
    student_model.findOne({uid:global_data.uid},(err ,student_data) => {
        if (err) {
            res.status(500).send({ error : 'find student something wrong.'})
        } else {
            res.render('../views/student_page/student_setting',{student_data});
        }
    })
    
}

    // student history page
student_history_page = (req ,res ) => {
    student_history
    .find({student_id:global_data.student_id})
    .sort({ date : 'descending'})
    .exec((err , student_history_data) => {
        if (err) {
            res.status(500).send({ error : 'Get student history data something wrong.'})
        }
        if (!student_history_data) {
            res.status(400).send({ error : 'ไม่พบข้อมูลประวัติการซื้อของนักเรียน'})
        }
        if (student_history_data) {
            // const date = new Date();
            // console.log(date);
            
            res.status(200).render('../views/student_page/student_history',{student_data:global_data,student_history_data});
        }
    })
}

    // Change Password
update_profile = (req ,res) => {
    const update_profile_data = req.body;
    // const update_profile_data = req.query;
    var newPassword = User.user_model.generateHash(update_profile_data.new_password);
    var newWeight ='' ;
    var newHeight ='';
    // console.log(newPassword);

    if (update_profile_data.new_password != '') {
         user_model.updateOne({uid:global_data.uid},{password:newPassword},(err) => {
            if (err) {
                // throw err;
                res.status(500).send({ error : 'update password something wrong.'})
            } else {
                console.log('password updated.');
                
            }
        })
    }
   
    if (update_profile_data.new_weight != '' && update_profile_data.new_height != '') {
        newWeight = update_profile_data.new_weight;
        newHeight = update_profile_data.new_height;
    }
    if (update_profile_data.new_height != '' && update_profile_data.new_weight == '') {
        newHeight = update_profile_data.new_height;
        newWeight = global_data.weight;
    }
    if (update_profile_data.new_height == '' && update_profile_data.new_weight != '') {
        newWeight = update_profile_data.new_weight;
        newHeight = global_data.height;
    }

    student_model.updateOne({uid:global_data.uid},{weight:newWeight,height:newHeight},(err) => {
        if (err) {
            // throw err;
            res.status(500).send({ error : 'update weight and height something wrong.'})
        } else {
            console.log('weigth and height updated.');
            
        }
    })

    res.status(200).send({ success : 'อัพเดทข้อมูลสำเร็จ'})
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
    const select_data = req.query;
    const data_to_client = [];
    // console.log('select month : '+select_data.month+' > mode : ' + select_data.mode);
    if (select_data.month && select_data.mode == 'mode_calories') {
        student_history.find({$and:[{student_id:global_data.student_id},{status:'ซื้อ'}]},'student_id status date deposit withdraw calories')
        .exec((err , calories_list) => {
            if (err) {
                console.log(err);     
            } else {
                // console.log(calories_list);
                // console.log(calories_list.length);
                calories_list.forEach((calories_data,index) => {
                    // console.log('No : '+index+' date format : ' +formatDate(calories_data.date));
                    // console.log('select date  : ' +select_data.month);
                    if (formatDate(calories_data.date) == select_data.month) {
                        data_to_client.push(calories_data)
                    }
                });
                // console.log('select date data : ' +data_to_client);
                res.status(200).send({data_to_client})
            }
        }) 
    }
    if (select_data.month && select_data.mode == 'mode_income') {
        student_history.find({$and:[{student_id:global_data.student_id},{status:'เติมเงิน'}]},'student_id status date deposit')
        .exec((err , deposit_list) => {
            if (err) {
                console.log(err);     
            } else {
                // console.log(deposit_list);
                // console.log(deposit_list.length);
                deposit_list.forEach((deposit_data,index) => {
                    // console.log('No : '+index+' deposti : ' +formatDate(deposit_data.date));
                    // console.log('select date  : ' +select_data.month);
                    if (formatDate(deposit_data.date) == select_data.month) {
                        data_to_client.push(deposit_data)
                    }
                });
                // console.log('select date data : ' +data_to_client);
                res.status(200).send({data_to_client})
            }
        }) 
    }
    if (select_data.month && select_data.mode == 'mode_expend') {
        student_history.find({$and:[{student_id:global_data.student_id},{status:'ซื้อ'}]},'student_id status date withdraw')
        .exec((err , withdraw_list) => {
            if (err) {
                console.log(err);     
            } else {
                // console.log(withdraw_list);
                // console.log(withdraw_list.length);
                withdraw_list.forEach((withdraw_data,index) => {
                    // console.log('No : '+index+' deposti : ' +formatDate(withdraw_data.date));
                    // console.log('select date  : ' +select_data.month);
                    if (formatDate(withdraw_data.date) == select_data.month) {
                        data_to_client.push(withdraw_data)
                    }
                });
                // console.log('select date data : ' +data_to_client);
                res.status(200).send({data_to_client})
            }
        }) 
    }
}


module.exports = {

    student_home_page,
    student_setting_page,
   
    student_history_page,

    // function
    get_data_graph,
    update_profile,
    
}