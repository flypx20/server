const Router = require('express').Router;

const UserModel = require('../model/model.js');
const CategoryModel = require('../model/category.js');
const productModel = require('../model/product.js');
const orderModel = require('../model/order.js');
const pagination = require('../model/pagination.js');
const hmac = require('../hmac/hmac.js');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const fs = require('fs');
const path = require('path');

const router = Router();


/*router.get("/init",(req,res)=>{
    //插入数据到数据库
    new UserModel({
        username:'admin',
        password:hmac('admin'),
        isAdmin:true
    })
    .save((err,newUser)=>{
        if(!err){//插入成功
            res.send('ok');
        }else{
            res.send('err');            
        }
    });
    const users = [];
    for (var i = 0; i < 50; i++) {
        users.push({
            username:'test'+i,
            password:hmac('test1'),
            isAdmin:false,
            phone:18790057163,
            email:'172892@qq.com'
        });
    }
    console.log(users);
    UserModel.create(users,(err,newUsers)=>{
        if(!err){//插入成功
            res.send('ok');
        }else{
            res.send('err');            
        }
    });
});
*/
//用户登录
router.post("/login",(req,res)=>{
    let body = req.body;
    //定义返回数据
    let result  = {
        code:0,// 0 代表成功 
        message:''
    };
    UserModel
    .findOne({username:body.username,password:hmac(body.password),isAdmin:true})
    .then((user)=>{
        if(user){//登录成功
             req.session.userInfo = {
                _id:user._id,
                username:user.username,
                isAdmin:user.isAdmin
             };
             result.data = {
               username:user.username
             };
             res.json(result);
        }else{
            result.code = 10;
            result.message = '用户名和密码错误';
            res.json(result);
        }
    });
});
    router.get('/logout',(req,res)=>{
        req.session.destroy();
        res.json({
            code:0,
            message:''
        });
    });
    //权限控制
    router.use((req,res,next)=>{
        if(req.userInfo.isAdmin){
            next();
        }else{
            res.json({
                code:10
            });
        }
    })

    .get('/count',(req,res)=>{

        UserModel.find()
        .then(user=>{
            CategoryModel.find()
            .then(cates=>{
                productModel.find()
                .then(products=>{

                    res.json({
                        code:0,
                        message:'',
                        userCount:user.length,
                        goodsCount:products.length,
                        catesCount:cates.length
                    });
                });
            });
        });

    });

router.get('/users',(req,res)=>{
console.log('admin/users',req.query.page);
    //获取所有用户的信息,分配给模板

    let options = {
        page: req.query.page,//需要显示的页码
        model:UserModel, //操作的数据模型
        query:{}, //查询条件
        sort:{_id:-1} //排序
    };

    pagination(options)
    .then((data)=>{
        res.json({
            code:0,
            current:data.page,
            total:data.count,
            list:data.docs,
            pageSize:data.pageSize
        }); 
    });
});



//显示管理员首页
router.get("/",(req,res)=>{
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});

//添加文章是处理图片上传
router.post('/uploadImages',upload.single('upload'),(req,res)=>{
    let path = "/uploads/"+req.file.filename;
    res.json({
        uploaded:true,
        url:path
    });
});

//显示用户评论列表
router.get('/comments',(req,res)=>{
    CommentModel.getPaginationComments(req)
    .then(data=>{
        res.render('admin/comment_list',{
            userInfo:req.userInfo,
            comments:data.docs,
            page:data.page,
            pages:data.pages,
            list:data.list,
            url:'/admin/comments'
        });
    });
});

//删除评论
router.get("/comment/delete/:id",(req,res)=>{
    let id = req.params.id;
    CommentModel.remove({_id:id},(err,raw)=>{
        if(!err){
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:'删除评论成功',
                url:'/admin/comments'
            });             
        }else{
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'删除评论失败,数据库操作失败'
            });             
        }       
    });

});


//显示站点管理页面
router.get("/site",(req,res)=>{
    let filePath = path.normalize(__dirname + '/../site-info.json');
    fs.readFile(filePath,(err,data)=>{
        if(!err){
            let site = JSON.parse(data);
            res.render('admin/site',{
                    userInfo:req.userInfo,
                    site:site
            }); 
        }else{
            console.log(err);
        }
    });

});
//处理修改网站配置请求
router.post("/site",(req,res)=>{
    let body = req.body;
    let site = {
        name:body.name,
        author:{
            name:body.authorName,
            intro:body.authorIntro,
            image:body.authorImage,
            wechat:body.authorWechat
        },
        icp:body.icp
    };
    site.carouseles = [];
    
    if(body.carouselUrl.length && (typeof body.carouselUrl == 'object')){
        for(let i = 0;i<body.carouselUrl.length;i++){
            site.carouseles.push({
                url:body.carouselUrl[i],
                path:body.carouselPath[i]
            });          
        }
    }else{
        site.carouseles.push({
            url:body.carouselUrl,
            path:body.carouselPath
        });
    }


    site.ads = [];

    if(body.adUrl.length && (typeof body.adUrl == 'object')){
        for(let i = 0;i<body.adUrl.length;i++){
            site.ads.push({
                url:body.adUrl[i],
                path:body.adPath[i]
            });          
        }
    }else{
        site.ads.push({
            url:body.adUrl,
            path:body.adPath
        });
    }

    let strSite = JSON.stringify(site);

    let filePath = path.normalize(__dirname + '/../site-info.json');
    fs.writeFile(filePath,strSite,(err)=>{
        if(!err){
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:'更新站点信息成功',
                url:'/admin/site'
            });              
        }else{
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'更新站点信息失败,文件写入失败'
            });             
        }
    });
});

//显示修改密码页面
router.get('/password',(req,res)=>{
    res.render('admin/password',{
        userInfo:req.userInfo
    });
});

//修改密码请求处理
router.post('/password',(req,res)=>{
    UserModel.update({_id:req.userInfo._id},{
        password:hmac(req.body.password)
    })
    .then(raw=>{
        req.session.destroy();
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'更新密码成功',
            url:'/'
        });         
    });
});

router.get('/order',(req,res)=>{
    let page = req.query.page;
    orderModel
    .getPaginationOrders(page)
    .then((result)=>{
        res.json({ 
            code:0,
            data:{
                current:result.current,
                total:result.count,
                list:result.docs,
                pageSize:result.pageSize
            }
        });  
    })
    .catch(e=>{
        console.log(e);
        res.json({
            code:1,
            massage:'获取订单商品失败'
        });
    });
});

module.exports = router;