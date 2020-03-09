const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const school_schema = new Schema({
    school_name:{ type:String },
    school_id:{ type:Number , unique:true },
    sub_district:{ type:String },
    district:{ type:String },
    province:{ type:String },
    postral_code:{ type:Number }
})

// const school_schema = new Schema({
//     ชื่อสถานศึกษา:{ type:String },
//     รหัสโรงเรียน:{ type:Number },
//     ตำบล:{ type:String },
//     อำเภอ:{ type:String },
//     จังหวัด:{ type:String },
//     รหัสไปรษณีย์:{ type:Number }
// })

// var school_model = mongoose.model("school",school_schema);

module.exports = school_model;

