const express = require('express');
var bookRouter = express.Router();
const swig = require('swig');
const wish = require('../model/model.js');
const pagination = require('../model/pagination.js');
const hmac = require('../hmac/hmac.js');
const CommentModel = require('../model/comment.js');

bookRouter
    .get('/',(req,res)=>{
    	res.render('home/home',{
             name:req.userInfo
        });
	})
    .get('/logout',(req,res)=>{
        req.session.destroy();
        res.json({
            code:0,
            message:''
        });
    })
    .get('/comment',(req,res)=>{
        let body = req.userInfo;
        let query = {};
        query.user = body._id;
        CommentModel.findPagination(req,query)
        .then(data=>{
            res.render('home/comment',{
                name:req.userInfo,
                commentList:data.docs,
                pages:data.pages,
                page:data.page,
                list:data.list
             });
        });
       
    })
    .get('/comment/delete/:id',(req,res)=>{
        let id = req.params.id;
        CommentModel.deleteOne({_id:id})
        .then((result)=>{
            if (result) {
                res.render('home/success',{
                    name:req.userInfo,
                    title:"评论管理",
                    message:'删除评论成功',
                    url:'/home/comment'
                });
            }else{
                res.render('home/error',{
                    name:req.userInfo,
                   title:"评论管理",
                    message:'删除失败,请检查网络',
                    url:'/home/comment'
                });
            }
        });
    })
    .get('/password',(req,res)=>{

        res.render('home/update',{
            name:req.userInfo
        });
    })
    .post('/password',(req,res)=>{
         let body = req.body;
        req.session.destroy();
        wish.findOneAndUpdate({username:body.username},{$set:{password:hmac(body.newpassword)}})
        .then(doc=>{
            if (doc) {
                res.json({
                    code:10,
                    message:''
                }); 
            }else{
                res.json({
                    code:0,
                    message:'您输入的用户名或密码错误'
                });
            }
           
        });
    });

    

module.exports = bookRouter;