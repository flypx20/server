const Router = require('express').Router;
const path = require('path');
const product = require('../model/product.js');


const router = Router();

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.use((req,res,next)=>{
    if(req.userInfo.isAdmin){
        next();
    }else{
        res.json({
            code:10
        });
    }
});

router.post('/uploadImage/',upload.single('image'),(req,res)=>{
    let path = "http://127.0.0.1:3000/uploads/"+req.file.filename;
    res.send(path);
});
router.post('/uploadetailImage/',upload.single('photo'),(req,res)=>{
    let path = "http://127.0.0.1:3000/uploads/"+req.file.filename;
    res.json({
  "success": true,
  "msg": "上传成功",
  "file_path":path
  });
});
router.post('/',(req,res)=>{
    let body = req.body;
    product.insertMany({productName:body.productName,category:body.category,detail:body.detail,imageList:body.imageList,productIntro:body.productIntro,productNum:body.productNum,productPrice:body.productPrice})
    .then((docs)=>{
      if (docs) {
        product.findPagination(req,{category:body.category})
        .then((cates)=>{
            res.json({
              code:0,
              message:'新增商品成功',
              data:cates
            });
        });
      }
    });
        
})
router.put('/',(req,res)=>{
    let body = req.body;
    product.findByIdAndUpdate(req.body.id,{productName:body.productName,category:body.category,detail:body.detail,imageList:body.imageList,productIntro:body.productIntro,productNum:body.productNum,productPrice:body.productPrice})
    .then((docs)=>{
      if (docs) {
        product.findPagination(req,{category:body.category})
        .then((cates)=>{
            res.json({
              code:0,
              message:'编辑商品成功'
            });
        });
      }
    });
        
})
.get('/',(req,res)=>{
      let page = req.query.page;
      if (page) {
        product.findPagination(req,{})
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
        product.find({pid:pid})
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
.get('/order',(req,res)=>{
    let id = req.query.id;
    let order = req.query.order;
      product.update({_id:id},{order:order},(err,raw)=>{
        if(!err){
          product.findPagination(req,{})
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
.get('/status',(req,res)=>{
    let id = req.query.id;
    let status = req.query.status;
      product.update({_id:id},{status:status},(err,raw)=>{
        if(!err){
          product.findPagination(req,{})
          .then((result)=>{
            res.json({
                code:0,
                data:{
                  total:result.count,
                  current:result.page,
                  list:result.docs,
                  pageSize:result.pageSize
                },
                message:'设置状态成功'
            });
          });
                  
        }else{
          res.json({
            code:1,
            message:'设置状态失败,数据库操作失败',
          });         
        }
      });           
    })
.get('/edit',(req,res)=>{
    let id = req.query.id;
         product.findById(id,'-__v -order -updatedAt -createdAt')
         .populate({path:'category',select:'_id pid'})
        .then((product)=>{
          if (product) {
            res.json({
              code:0,
              data:product,
              message:'获取商品信息成功'
            });
          }else{
            res.json({
              code:1,
              message:'获取商品信息失败'
            });
          }
        });           
    })
.get('/search',(req,res)=>{

    let keyword = req.query.keyword;
      product.findPagination(req,{productName:new RegExp(keyword,'ig')})
      .then((result)=>{
        res.json({
            code:0,
            data:{
              total:result.count,
              current:result.page,
              list:result.docs,
              pageSize:result.pageSize,
              keyword:keyword
            },
            message:'查询成功'
        });
      });
  });
module.exports = router;