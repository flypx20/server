const express = require('express');
var bookRouter = express.Router();
const swig = require('swig');
const category = require('../model/category.js');
const pagination = require('../model/pagination.js');


   bookRouter.get('/',(req,res)=>{
    	pagination({

    		page:req.query.page,
    		model:category,
    		query:{},
    		projection:'name _id sort',
    	})
    	.then((data)=>{
    		res.render('admin/categoryList',{
    			name:req.userInfo,
    			sort:{_id:1},
    			categoryList:data.docs,
    			page:data.page,
    			list:data.list
    		});

    	});
	})
	.get('/category_add',(req,res)=>{
    	res.render('admin/category_edit_add',{
    		name:req.userInfo
    	});
	})
	.post('/add',(req,res)=>{
		let body = req.body;
		category.findOne({name:body.name})
		.then((cate)=>{
			if (cate) {
				res.render('admin/error',{
					name:req.userInfo,
					url:"新增分类",
					message:'新增分类失败,存在同名分类'
				});
			}else{
				category.insertMany({name:body.name,order:parseInt(body.order)})
				.then((docs)=>{
					if (docs) {
						res.render('admin/success',{
							name:req.userInfo,
							url:"新增分类",
							message:'新增分类成功'
						});
					}else{
						res.render('admin/error',{
							name:req.userInfo,
							url:"新增分类",
							message:'请检查网络'
						});
					}
				});
				
			}
		});
	})
	.get('/edit/:id',(req,res)=>{
		res.render('admin/category_edit_add',{
			name:req.userInfo,
			id:req.params.id
		});
	})
	.post('/edit',(req,res)=>{
		let body = req.body;
		category.findById(body.id)
		.then((docs)=>{
			if (body.name == docs.name && body.order == docs.order ) {
				res.render('admin/error',{
					name:req.userInfo,
					url:"编辑分类",
					message:'编辑分类失败，存在相同分类'
				});
			}else{
				category.findOne({name:body.name,_id:{$ne:body.id}})
				.then((cate)=>{
					if (cate) {
						res.render('admin/error',{
							name:req.userInfo,
							url:"编辑分类",
							message:'编辑分类失败，存在相同分类'
						});
					}else{
						category.update({_id:body.id},{name:body.name,order:body.order},(err,raw)=>{
						if(!err){
							res.render('admin/success',{
								name:req.userInfo,
								message:'修改分类成功',
								url:"编辑分类"
							});					
						}else{
					 		res.render('admin/error',{
								name:req.userInfo,
								message:'修改分类失败,数据库操作失败',
								url:"编辑分类"
							});					
						}
					});						
					}
				});
			}
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