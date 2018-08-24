const express = require('express');
var bookRouter = express.Router();
const swig = require('swig');
const category = require('../model/category.js');
const article = require('../model/article.js');
const comment = require('../model/comment.js');
const pagination = require('../model/pagination.js');
const resource = require('../model/resource.js');

const path = require('path');
const fs = require('fs');
 let filePath = path.normalize(__dirname+'/../site.json');


const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/resource/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


//显示首页
bookRouter
//权限控制
 
    .get('/',(req,res)=>{
       
    	category.find({},'_id name')
		.then((categories)=>{
            article.find({})
            .sort({click:-1})
            .limit(10)
            .then((topArticles)=>{
               article.findPagination(req)
                .then((data)=>{
                  fs.readFile(filePath,(err,result)=>{
                    if (!err) {
                         let site = JSON.parse(result);
                        res.render('index',{
                            userInfo:req.userInfo,
                            articleList:data.docs,
                            page:data.page,
                            list:data.list,
                            pages:data.pages,
                            categories:categories,
                            topArticles:topArticles,
                            site:site
                         });
                    }
                  });
                        
                    
                });
            }); 
        });
        		
	})
    .get('/list/:id',(req,res)=>{
        let id = req.params.id;
        category.find({},'_id name')
        .then((categories)=>{
            article.find({})
            .sort({click:-1})
            .limit(10)
            .then((topArticles)=>{
               article.findPagination(req,{category:id})
                .then((data)=>{
                    fs.readFile(filePath,(err,result)=>{
                     if (!err) {
                        let site = JSON.parse(result);
                        res.render('index',{
                        userInfo:req.userInfo,
                        articleList:data.docs,
                        page:data.page,
                        list:data.list,
                        pages:data.pages,
                        categories:categories,
                        topArticles:topArticles,
                        cate:id,
                        site:site
                    });
                     }
                 });
                    
                });
            }); 
        });

    })
	.get('/articles',(req,res)=>{
        let category = req.query.category;
         let query = {};
        if (category) {
            query.category = category;
        }
		article.findPagination(req,query)
		.then((data)=>{
			res.json({
				code:0,
				userInfo:req.userInfo,
	            articleList:data.docs,
	            page:data.page,
	            list:data.list,
                pages:data.pages
        	});
			
		});
	})
    .get('/view/:id',(req,res)=>{
        let id = req.params.id;
        article.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})
        .then(()=>{
        category.find({},'_id name')
        .sort({order:1})
        .then((categories)=>{
            article.find({})
           
            .sort({click:-1})
            .limit(10)
             .then((topArticles)=>{
                article.findById(id)
                .populate({path:'category',select:'name'})
                .then((article)=>{
                    comment.findPagination(req,{article:id})
                    .then(data=>{
                        fs.readFile(filePath,(err,result)=>{
                            let site = JSON.parse(result);
                            if (!err) {
                                 res.render('detail',{
                                userInfo:req.userInfo,
                                comment:data.docs,
                                article:article,
                                categories:categories,
                                topArticles:topArticles,
                                cate:article.category._id.toString(),
                                list:data.list,
                                page:data.page,
                                pages:data.pages,
                                site:site
                            });
                            }
                        });
                      
                    });                   
                });
                    
            }); 
        });
        });

    })
    .get('/comment',(req,res)=>{
        comment.findPagination(req)
        .then(data=>{
           res.render('admin/comment',{
                name:req.userInfo,
                commentList:data.docs,
                list:data.list,
                page:data.page,
                pages:data.pages
           });
        });
    })
    .get('/resource',(req,res)=>{
        resource.findPagination(req)
        .then(data=>{
            res.render('admin/resource_list',{
                name:req.userInfo,
                resources:data.docs,
                page:data.page,
                pages:data.pages,
                list:data.list
            });
        });
        
    })
    .get('/resource/add',(req,res)=>{
        res.render('admin/resource_add.html',{
            name:req.userInfo,
        });
    })
    .post('/resource/add',upload.single('file'),(req,res)=>{
        new resource({
            name:req.body.name,
            path:'/resource/'+req.file.filename
        })
        .save()
        .then(resource=>{
            res.render('admin/success',{
                name:req.userInfo,
                message:'添加资源成功',
                url:'资源管理'
            });          
         });
    })
    .get('/resource/delete/:id',(req,res)=>{
        let id = req.params.id;
        console.log(id);
        resource.findByIdAndRemove(id)
        .then(doc=>{
            let filePath = path.normalize(__dirname+'/../static/'+doc.path);
            fs.unlink(filePath,err=>{
                if(!err){
                    res.render('admin/success',{
                        name:req.userInfo,
                        message:'删除资源成功',
                        url:'资源管理'
                    });                  
                }else{
                    res.render('admin/error',{
                        name:req.userInfo,
                        message:'删除资源失败,删除文件错误',
                        url:'资源管理'
                    });                  
                }
            });
           
        })
        .catch(e=>{
            res.render('admin/error',{
                name:req.userInfo,
                message:'删除资源失败,删除文件错误',
                url:'资源管理'
            });          
         });
    });
    

module.exports = bookRouter;