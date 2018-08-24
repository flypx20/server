const mongoose = require('mongoose');
const pagination = require('../model/pagination.js');
const fzfSchema = mongoose.Schema({
	category:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'category'
	},
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'blog'
	},
	 title:{
		type:String,
	},
	intro:{
		type:String,
	},
	content:{
		type:String,
	}, 
	click:{
		type:Number,
		default:0
	},
	createdAt:{
		type:Date,
		default:Date.now
	}    
});
fzfSchema.statics.findPagination = function(req,query={}){

	return new Promise((resolve,reject)=>{
		pagination({
	        page:req.query.page,
	        model:this,
	        query:query,
	        populate:[{path:'category',select:'name'},{path:'user',select:'username'}]
	    })
        .then((data)=>{
        	resolve(data);
        });
	});
	
};
const articleModle = mongoose.model('article',fzfSchema);


module.exports = articleModle;