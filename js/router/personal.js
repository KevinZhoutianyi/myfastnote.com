
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
  //  console.log(sql)
    return new Promise(( resolve, reject ) => {
      pool.getConnection(function(err, connection) {
        if (err) {
          reject( err )
        } else {
          connection.query(sql, values, ( err, rows) => {
  
            if ( err ) {
              reject( err )
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

 
router.get('/',urlencodedParser, function (req, res) {
  res.status(200).sendFile( path.resolve(__dirname + "/../../public/html/" + "personal.html") );
});
 
router.post('/refresh',urlencodedParser, async (req, res) => {
    userid = getid(req.body.token)
    if(userid=="-1"){
      res.status(400).send("token expired")
      return;
  }
    myprint("userid:"+userid+" refreshing database")
    
    const result = await query("select dbid,dbname from db where userid = '"+userid+"'");
    
    if(result.length>=1){
  
      const result2 = await query("select nowopendbid from user where userid = '"+userid+"'");
      if(result2.length>=1){
          var x = {nowopendbid:result2[0].nowopendbid,db:result}
          // console.log(x) 
          res.status(200).send(x);
      }
    }else{
      res.status(400).send(result)
    }

});

router.post('/changenowopendbid',urlencodedParser, async (req, res) => {
  userid = getid(req.body.token)
  if(userid=="-1"){
    res.status(400).send("token expired")
    return;
}
  myprint("userid:"+userid+" changing database")
  
  const result = await query("update user set nowopendbid="+req.body.dbid+" where userid = " +userid);
      myprint("change to"+ req.body.dbid)
      res.status(200).send("OK");
    

});
  
  
 
  module.exports = router