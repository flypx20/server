const mongoose = require('mongoose');
const pagination = require('../model/pagination.js');
const fzfSchema = mongoose.Schema({
	name:{
		type:String
	},
	path:{
		type:String
	}
});
fzfSchema.statics.findPagination = function(req,query={}){

	return new Promise((resolve,reject)=>{
		pagination({
	        page:req.query.page,
	        model:this,
	        query:query,
	        projection:'-__v', //投影，
        	sort:{_id:-1}, //排序
	    })
        .then((data)=>{
        	resolve(data);
        });
	});
	
};
const resourceModle = mongoose.model('resource',fzfSchema);


module.exports = resourceModle;