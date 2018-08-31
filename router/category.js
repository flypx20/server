const express = require('express');
var bookRouter = express.Router();
const category = require('../model/category.js');
const pagination = require('../model/pagination.js');


   bookRouter
   .post('/',(req,res)=>{
		let body = req.body;
		category.findOne({name:body.name,pid:body.pid})
		.then((cate)=>{
			if (cate) {
				res.json({
					code:1,
					message:'新增分类失败,存在同名分类'
				});
			}else{
				category.insertMany({name:body.name,pid:body.pid})
				.then((docs)=>{
					if (docs) {
						category.find({pid:body.pid})
						.then((cates)=>{
							if (body.pid == 0) {
								res.json({
									code:0,
									message:'新增分类成功',
									data:cates
								});
							}else{
								res.json({
									code:0,
									message:'新增分类成功'
								});
							}
						});
					}
				});
				
			}
		});
	})
   .get('/',(req,res)=>{
    	let pid = req.query.pid;
    	let page = req.query.page;
    	if (page) {
    		category.findPagination(req,{pid:pid})
    		.then((result)=>{
    			if (result) {
    				res.json({
    					code:0,
    					data:{
    						total:result.count,
    						current:result.page,
    						list:result.docs,
    						pageSize:result.pageSize
    					}
    				});
    			}else{
    				res.json({
    					code:1,
    					message:'获取数据失败，请重新获取'
    				});
    			}
    		});
    	}else{
	    	category.find({pid:pid})
	    	.then((cates)=>{
	    		if (cates) {
	    			res.json({
	    				code:0,
	    				data:cates
	    			});
	    		}else{
	    			res.json({
	    				code:1,
	    				message:'获取分类失败'
	    			});
	    		}
	    	});    		
    	}

	})
   .get('/edit',(req,res)=>{
		let id = req.query.id;
		let name = req.query.name;
		let pid = req.query.pid;
		category.findById(id)
		.then((docs)=>{
			if (name == docs.name && order == docs.order ) {
				res.json({
					code:1,
					message:'编辑分类失败，存在相同分类'
				});
			}else{
				category.findOne({name:name,_id:{$ne:id}})
				.then((cate)=>{
					if (cate) {
						res.json({
							code:1,
							message:'编辑分类失败，存在相同分类'
						});
					}else{
						category.update({_id:id},{name:name},(err,raw)=>{
						if(!err){
							category.findPagination(req,{pid:pid})
    						.then((result)=>{
    							res.json({
			    					code:0,
			    					data:{
			    						total:result.count,
			    						current:result.page,
			    						list:result.docs,
			    						pageSize:result.pageSize
			    					},
			    					message:'更改分类名称成功'
    							});
    						});
											
						}else{
					 		res.json({
								code:1,
								message:'修改分类失败,数据库操作失败',
							});					
						}
					});						
					}
				});
			}
		});
	})
   .get('/order',(req,res)=>{
		let id = req.query.id;
		let order = req.query.order;
		let pid = req.query.pid;
			category.update({_id:id},{order:order},(err,raw)=>{
				if(!err){
					category.findPagination(req,{pid:pid})
					.then((result)=>{
						res.json({
	    					code:0,
	    					data:{
	    						total:result.count,
	    						current:result.page,
	    						list:result.docs,
	    						pageSize:result.pageSize
	    					},
	    					message:'设置排序成功'
						});
					});
									
				}else{
			 		res.json({
						code:1,
						message:'设置排序失败,数据库操作失败',
					});					
				}
			});						
		})

			








	.get('/category_add',(req,res)=>{
    	res.render('admin/category_edit_add',{
    		name:req.userInfo
    	});
	})
	
	.get('/edit/:id',(req,res)=>{
		res.render('admin/category_edit_add',{
			name:req.userInfo,
			id:req.params.id
		});
	})
	
	.get('/delete/:id',(req,res)=>{
		category.deleteOne({_id:req.params.id})
		.then((data)=>{
			if (data) {
				res.render('admin/success',{
					name:req.userInfo,
					url:"删除分类",
					message:'删除分类成功'
				});
			}else{
				res.render('admin/error',{
					name:req.userInfo,
					url:"删除分类",
					message:'请检查网络'
				});
			}
		});
	});

module.exports = bookRouter;