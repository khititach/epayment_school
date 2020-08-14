const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notification_schema = new Schema({
    student_id:{ type:String },
    title:{ type:String },
    message:{ type:String },
    date:{ type:Date}
})

const receive_money_schema = new Schema({
    store_number:{ type:String },
    title:{ type:String }, // คำขอรับเงิน
    status:{type:String}, // Approve and Disapproval อนุมัติ , ไม่อนุมัติ
    request_date:{ type:Date}, // วันที่ส่งคำขอ
    accept_date:{ type:Date} // วันที่อนุมัติคำขอ
})

var notification_model = mongoose.model("notification",notification_schema);
var receive_money_model = mongoose.model("reqreceivemoney",receive_money_schema);

module.exports = {
    notification_model,
    receive_money_model
};
