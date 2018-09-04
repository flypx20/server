const express = require('express');
var bookRouter = express.Router();
const wish = require('../model/model.js');
const swig = require('swig');
const hmac = require('../hmac/hmac.js');

bookRouter
.use((req,res,next)=>{
        if(req.userInfo.isAdmin){
            next();
        }else{
            res.json({
                code:10
            });
        }
    })
    .get('/logout',(req,res)=>{
        req.session.destroy();
        res.json({
            code:0,
            message:''
        });
    })
	.post('/regist',(req,res)=>{
		let body = req.body;
		wish.findOne({username:body.username})
		.then((user)=>{
			if (user) {
				res.json({
					code:0,
					message:'用户名已经存在'
				});
			}else{
				wish.insertMany({username:body.username,password:hmac(body.password)},(err,data)=>{
					if (!err) {
						res.json({
							code:10,
							message:'注册成功'
						});
					}else{
						res.json({
							code:11,
							message:'注册失败'
						});
					}
				});
			}
		});
	})
	.post('/login',function(req,res) {
		let body = req.body;
		wish.findOne({username:body.username,password:hmac(body.password)})
		.then((data)=>{
			if (!data) {
				res.json({
					code:0,
					message:'您输入的用户名或密码错误'
				});
			}else{
				let result = {
					code:10,
					_id:data._id,
					username:data.username,
					isAdmin:data.isAdmin
				};
				 req.session.userInfo = result;
				res.json(result);
			}
		});
	})
	.post('/updatepassword',(req,res)=>{
		let body = req.body;
		wish.findOneAndUpdate({username:body.username,password:hmac(body.oldpassword)},{$set:{password:hmac(body.newpasword)}})
		.then((data)=>{
			if (!data) {
				res.json({
					code:0,
					message:'您输入的用户名或密码错误'
				});
			}else{
				let result = {
					code:10,
					_id:data._id,
					username:data.username,
					isAdmin:data.isAdmin
				};
				res.json(result);	
			}
		});
	});
    

module.exports = bookRouter;