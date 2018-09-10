const express = require('express');
var bookRouter = express.Router();
const wish = require('../model/model.js');
const hmac = require('../hmac/hmac.js');
const product = require('../model/product.js');

bookRouter
    .get('/logout',(req,res)=>{
        req.session.destroy();
        res.json({
            code:0,
            message:''
        });
    })
     .get('/userInfo',(req,res)=>{
        	wish.findById(req.userInfo._id,'username email phone')
        	.then((userInfo)=>{
        		if (userInfo) {
		         	res.json({
		        		code:0,
		        		username:req.userInfo.username,
		        		userInfo:userInfo
		        	});       			
		         }else{
		         	res.json({
		         		code:1,
		         		message:'未知错误'
		         	});
		         }
        	});


    })
    .get('/checkusername',(req,res)=>{
		wish.findOne({username:req.query.username})
		.then((user)=>{
			if (user) {
				res.json({
					code:1,
					message:'用户名已经存在'
				});
			}else{
				res.json({
					code:0
				});
			}
		});
    })
	.post('/regist',(req,res)=>{
		let body = req.body;
		wish.findOne({username:body.username})
		.then((user)=>{
			if (user) {
				res.json({
					code:1,
					message:'用户名已经存在'
				});
			}else{
				wish.insertMany({username:body.username,password:hmac(body.password),phone:body.phone,
email:body.email},(err,data)=>{
					if (!err) {
						res.json({
							code:0,
							message:'注册成功'
						});
					}else{
						res.json({
							code:1,
							message:'注册失败,网络跑路咯'
						});
					}
				});
			}
		});
	})
	.post('/login',function(req,res) {
		let body = req.body;
		wish.findOne({username:body.username,password:hmac(body.password),isAdmin:false})
		.then((data)=>{
			if (!data) {
				res.json({
					code:1,
					message:'您输入的用户名或密码错误'
				});
			}else{
				let result = {
					code:0,
					_id:data._id,
					username:data.username,
					isAdmin:data.isAdmin
				};
				req.session.userInfo = result;
				console.log(req.session.userInfo);
				res.json(result);
			}
		});
	})
	.post('/updatepassword',(req,res)=>{
		let body = req.body;
		wish.findByIdAndUpdate(req.userInfo._id,{$set:{password:hmac(body.repassword)}})
		.then((data)=>{
			if (!data) {
				res.json({
					code:1,
					message:'修改失败'
				});
			}else{
				let result = {
					code:0,
					_id:data._id,
					username:data.username,
					isAdmin:data.isAdmin
				};
				res.json(result);	
			}
		});
	});
    

module.exports = bookRouter;