const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

    // user 
const user_schema = new Schema({
    username:{ type:String , unique:true }, //* **//
    password:String, //*  *//
    role:String, 
    uid:{ type:String , unique:true }
})

    // admin
const admin_schema = new Schema({
    // username:{ type:String , require:true , unique:true }, //*  *//
    // password: String, //*  *//
    // role:{ type:String , default:"admin" },
    // school_name:{ type:String },
    uid:{ type:String , unique:true },
    pre_name:{ type:String },
    first_name:{ type:String , require:true },
    last_name:{ type:String , require:true },
    dob:{ type:Date },
    sex:{ type:String },
    address:{ type:String },
    tel:{ type:String },
    email:{ type:String }
});

    // student
const student_schema = new Schema({
    // username:{ type:String , require:true , unique:true },
    // password:{ type:String },
    // role:{ type:String },
    // school_id:{ type:Number }, 
    class:{ type:String },
    room:{ type:Number },
    uid:{ type:String , unique:true },
    current_money:{ type:Number },
    weight:{ type:Number },
    height:{ type:Number },
    image:{ type:String },
    pre_name:{ type:String },
    first_name:{ type:String , require:true },
    last_name:{ type:String , require:true },
    dob:{ type:Date },
    sex:{ type:String },
    address:{ type:String },
    tel:{ type:String },
    student_id:{ type:String , unique:true },
    id_card:{ type:String , unique:true },
    email:{ type:String },
    parent_pre_name:{ type:String },
    parent_fname:{ type:String },
    parent_lname:{ type:String },
    parent_tel:{ type:String }
});

    // store
const store_schema = new Schema({
    // username:{ type:String , require:true , unique:true},
    // password: String,
    // role:{ type:String },
    // school_id:{ type:String },
    uid:{ type:Number , unique:true},
    current_money:{ type:Number },
    image:{ type:String },
    pre_name:{ type:String },
    first_name:{ type:String , require:true },
    last_name:{ type:String , require:true },
    dob:{ type:Date },
    sex:{ type:String },
    address:{ type:String },
    tel:{ type:String },
    email:{ type:String },
    store_name:{ type:String },
    store_number:{ type:Number , unique:true},
    menu_list:[{ type:Number }]

    // menu_list:[{
    //     food_image:{ type:String },
    //     food_name:{ type:String , unique:true  },
    //     food_id:{ type:Number , unique:true  },
    //     food_price:{ type:Number },
    //     food_calories:{ type:Number },
    //     food_quantity:{ type:String }
    // }]
});

    // old code
user_schema.statics.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10),null);
};

user_schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

user_schema.methods.roleStudent = function() {
    return (this.role === "นักเรียน");
};

user_schema.methods.roleStore = function() {
    return (this.role === "ร้านค้า");
};

user_schema.methods.roleAdmin = function() {
    return (this.role === "แอดมิน");
};

var user_model = mongoose.model("user",user_schema);
var admin_model = mongoose.model("admin",admin_schema);
var student_model = mongoose.model("student",student_schema);
var store_model = mongoose.model("store",store_schema);


module.exports = {    
    user_model:user_model,
    admin_model:admin_model,
    student_model,
    store_model:store_model,
}