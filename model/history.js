const mongoose = require('mongoose');
const Schema = mongoose.Schema;

    // student history schema
const student_history_schema = new Schema({
    id_card:{ type:String },
    student_id:{ type:String },
    date:{ type:Date }, // day + time > dd/mm/yyyy,00:00:00
    status:{ type:String }, // Topup or buy
    store_number:{ type:String },
    store_name:{ type:String },
    food:{ type:String },
    calories:{ type:String },
    deposit:{ type:String }, // money in 
    withdraw:{ type:String }, // money out
    total:{ type:String }, // current money
    responsible:{type:String }, // storenumber + storeOwner
    foodOrderList:{type:Object }
});

    // store history schema
const store_history_schema = new Schema({
    store_number:{ type:String },
    store_name:{ type:String },
    date:{ type:Date },
    student_id:{ type:String },
    status:{ type:String },
    food_id:{ type:Number }, // new
    food_name:{ type:String }, // edit : food > food_name
    // calories:{ type:String },
    income:{ type:String }, // edit : deposit > income
    // withdraw:{ type:String }, // remove
    responsible:{type:String },
    foodOrderList:{type:Object }
})

var student_history_model = mongoose.model("studenthistory",student_history_schema);
var store_history_model = mongoose.model("storehistory",store_history_schema);

module.exports = {
    student_history_model,
    store_history_model
}; 