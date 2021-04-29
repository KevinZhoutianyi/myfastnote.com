
/* init */
var express = require('express');
const path = require('path');
var mysql      = require('mysql');
var dbConfig = require('../../database/DBConfig');//数据库登陆信息
var querySql = require('../../database/querysql');//
var bodyParser = require('body-parser');
var pool = mysql.createPool( dbConfig.mysql );//创建数据库池
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var qiniu = require("qiniu");
const multiparty = require('multiparty');
const fs = require('fs');
const JwtUtil = require('../jwt');
const { strict } = require('assert');
var router = express.Router();
var app = express();
var ejs = require('ejs') 
//要上传的空间名
var bucket = 'onlydrinkwater'; 
var imageUrl = 'img.myfastnote.com'; // 域名名称
var accessKey = '3PoDKOO6j9uXap5iTeeb5TE6JsYN4_okFnX9nozI';
var secretKey = 'mXf52W_o7P8Q01HeT-lf1MehQeUxg0KtH-RnIxzo';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;


let query = function( sql, values ) {
    // 返回一个 Promise
    // myprint(sql)
    return new Promise(( resolve, reject ) => {
      pool.getConnection(function(err, connection) {
        if (err) {
          reject( err )
        } else {
          connection.query(sql, values, ( err, rows) => {
  
            if ( err ) {
              reject( err )
            } else {
              resolve( rows )
            }
            // 结束会话
            connection.release()
          })
        }
      })
    })
  }
 
 
 
  app.use(bodyParser.urlencoded({ extended: false }))
  app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
  app.use('/public', express.static('public'));
  
  app.use(bodyParser.json());//数据JSON类型

 
function getid(token) {
   
   var jwt = new JwtUtil(token);
   var ret;
   try{
      ret = jwt.verifyToken().id;
   }catch(e){
       ret = "-1";
   }
   return(ret)
}

function myprint(output){
  console.log(new Date(Date.now()))
  console.log(output)
}
router.post('/catalogue',urlencodedParser, async (req, res) => {
  
  const result2 = await query("select filename,isnote,level,fileid,fatherid from catalogue where userid = "+req.body.userid+" and dbid =" + req.body.dbid);
  ret = []
  
  result2.forEach(function(e){  
    if((e.level == 0) && (e.filename == "Demo")){
      ret.push({name:e.filename,id:e.fileid,files:[]})
    }
   });
  result2.forEach(function(e){  
    if((e.level == 0) && (e.filename != "Demo")){
      ret.push({name:e.filename,id:e.fileid,files:[]})
    }
   });
  result2.forEach(function(i){  
    ret.forEach(function(j){  
      if(j.id == i.fatherid){
        j.files.push({id:i.fileid,name:i.filename})
      }
    });
  });
  res.send(ret)

})
router.post('/checkip',urlencodedParser, function (req, res) {
  var location = req.body.location;
  
  myprint('====userlocation:'+location+" open blog====")
  res.status(200)
    

})
router.post('/content',urlencodedParser, async (req, res) => {
  
  const result2 = await query("select content from note where userid =" +req.body.userid+ " and fileid = "+req.body.fileid+" and dbid = " +req.body.dbid);
 
  res.send(result2[0].content)

})

 
router.get('/:userid/:dbid',urlencodedParser, async (req, res) => {
  
  res.render( "blog",{userid:req.params.userid,dbid:req.params.dbid});
  // res.status(200).sendFile( path.resolve(__dirname + "/../../public/html/" + "blog.html") );
})


 module.exports = router