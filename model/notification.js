const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notification_schema = new Schema({
    id:{ type:String },
    title:{ type:String },
    message:{ type:String },
    date:{ type:Date}
})

var notification_model = mongoose.model("notification",notification_schema);

module.exports = notification_model;
