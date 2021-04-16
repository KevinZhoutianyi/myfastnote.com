
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
 //  myprint(sql)
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( "mysql got some error" )
          } else {

             // myprint(rows)
            resolve( rows )
          }
          // 结束会话
          connection.release()
        })
      }
    })
  })
  .catch(error => console.log('caught', error))
}
function getid(token) {
   
  var jwt = new JwtUtil(token);
  var ret;
  try{
     ret = jwt.verifyToken().id;
  }catch(e){
      ret = "-99";
  }
  return(ret)
}

router.post('/login',urlencodedParser, async (req, res) => {
  console.log(req.body.username+","+req.body.password+" try to query login\n")
  if(req.body.username=="admin"&&req.body.password=="Kevin_1212"){
    var content = {id:-1}
    let jwt = new JwtUtil(content);
    let token = jwt.generateToken();
    console.log("admin login success"+",his token is "+token)
    res.status(200).send(token)
    
  }
  else{
    res.status(400)
  }
})
router.post('/showpage',urlencodedParser, async (req, res) => {
  res.status(200).sendFile( path.resolve(__dirname + "/../../public/html/" + "admin.html") );
})
router.post('/query',urlencodedParser, async (req, res) => {

  userid = getid(req.body.token)
    if(userid!="-1"){
       res.status(400).send("token expired")
       return;
    }
  console.log("admin query mysql:"+req.body.query)
  const result = await query(req.body.query);
  res.status(200).send(result)
})
router.post('/log',urlencodedParser, async (req, res) => {

  userid = getid(req.body.token)
    if(userid!="-1"){
       res.status(400).send("token expired")
       return;
    }
  console.log("admin query mysql:"+req.body.query)
  const result = await query(req.body.query);
  res.status(200).send(result)
  
  
})

router.get('/',urlencodedParser, async (req, res) => {
    res.status(200).sendFile( path.resolve(__dirname + "/../../public/html/" + "adminLogin.html") );
    
})


 module.exports = router