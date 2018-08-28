const mongoose = require('mongoose');
const pagination = require('../model/pagination.js');

const fzfSchema = mongoose.Schema({
		name:String,
		pid:String,
		order:{
			type:Number,
			default:0
		}
},{timestamps:true});

fzfSchema.statics.findPagination = function(req,query={}){

	return new Promise((resolve,reject)=>{
		pagination({
	        page:req.query.page,
	        model:this,
	        query:query,
	    })
        .then((data)=>{
        	resolve(data);
        });
	});
	
};

const CategoryModle = mongoose.model('category',fzfSchema);

module.exports = CategoryModle;