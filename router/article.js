const express = require('express');
var bookRouter = express.Router();

const swig = require('swig');
const category = require('../model/category.js');
const article = require('../model/article.js');
const pagination = require('../model/pagination.js');

var multer  = require('multer');
var upload = multer({ dest: 'static/uploads' });

bookRouter.use((req,res,next)=>{
    if(req.userInfo.isAdmin){
        next();
    }else{
        res.send('<h1>请用管理员账号登录</h1>');
    }
});

bookRouter
    .get('/',(req,res)=>{
    	article.findPagination(req)
        .then((data)=>{
            res.render('admin/article',{
                name:req.userInfo,
                sort:{_id:1},
                articleList:data.docs,
                page:data.page,
                list:data.list
            });

        });
	})
    .get('/article_add',(req,res)=>{

        category.find({},'_id name')
        .sort({order:1})
        .then((categories)=>{
            res.render('admin/article_edit_add',{
                name:req.userInfo,
                categories:categories
            });     
        });
    })
    .get('/logout',(req,res)=>{
    	req.session.destroy();
    	res.json({
    		code:0,
    		message:''
    	});
    })
    .post('/add',function(req,res) {
        let body = req.body;
        new article({
            category:body.category,
            user:req.userInfo._id,
            title:body.title,
            intro:body.intro,
            content:body.content,
        })
        .save()
       .then((article)=>{
            res.render('admin/success',{
                name:req.userInfo,
                message:'新增分类成功',
                url:'新增文章'
            });     
        })
        .catch((e)=>{
            res.render('admin/error',{
                name:req.userInfo,
                message:'新增分类失败,数据库操作失败',
                url:'新增文章'
            });          
        });
    })
    .post('/uploadImg',upload.single('upload'),(req,res)=>{
        let path = '/uploads/'+req.file.filename;
        res.json({
            uploaded:true,
            url:path
        });
    })
    .get('/delete/:id',(req,res)=>{
       article.deleteOne({_id:req.params.id})
        .then((data)=>{
            if (data) {
                res.render('admin/success',{
                    name:req.userInfo,
                    url:"删除文章",
                    message:'删除文章成功'
                });
            }else{
                res.render('admin/error',{
                    name:req.userInfo,
                    url:"删除文章",
                    message:'请检查网络'
                });
            }
        });
    })
    .get('/edit/:id',(req,res)=>{
        let id = req.params.id;
        category.find({})
        .then((cates)=>{
            article.findById(id)
            .then((articles)=>{
                res.render('admin/article_edit_add',{
                    name:req.userInfo,
                    cates:cates,
                    article:articles
                });  
            });
        });

    })
    .post('/edit',(req,res)=>{
        let body = req.body;
        article.updateOne({_id:req.body.id},{category:body.category,title:body.title,intro:body.intro,content:body.content})
        .then((result)=>{
            if (result) {
                res.render('admin/success',{
                    name:req.userInfo,
                    url:'编辑文章',
                    message:'编辑文章成功'
                });
            }else{
                res.render('admin/error',{
                    name:req.userInfo,
                    url:'编辑文章',
                    message:'请检查网络'
                });
            }
        });
    });
module.exports = bookRouter;