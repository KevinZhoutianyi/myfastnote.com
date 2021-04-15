
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

var bucketManager = new qiniu.rs.BucketManager(mac, config);


let query = function( sql, values ) {
    // 返回一个 Promise
    myprint("mysql:"+sql)
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
   console.log("[personal.js]: " + output)
  //  console.log(output)
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
    
    if(result.length>=0){
  
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

router.post('/newdb',urlencodedParser, async (req, res) => {
  userid = getid(req.body.token)
  if(userid=="-1"){
    res.status(400).send("token expired")
    return;
}
  myprint("userid:"+userid+" newing database")
  const result1 = await query("select max(dbid) from db where userid="+userid);
  myprint("max db id for user"+userid+":"+result1[0]["max(dbid)"])
  const result2 = await query("insert into db values("+userid+","+(result1[0]["max(dbid)"]+1)+",'database:"+(result1[0]["max(dbid)"]+1)+"',0)");
  res.status(200).send("OK");
    

});

router.post('/imgcount',urlencodedParser, async (req, res) => {
  userid = getid(req.body.token)
  if(userid=="-1"){
    res.status(400).send("token expired")
    return;
}
  myprint("userid:"+userid+" getting img count")
  const result1 = await query("select count(fileid) from img  where dbid = " +req.body.dbid+ " and userid = " +userid);
  var x = {count:result1[0]["count(fileid)"]}
  res.status(200).send(x);
    

});

router.post('/deldb',urlencodedParser, async (req, res) => {
  userid = getid(req.body.token)
  if(userid=="-1"){
    res.status(400).send("token expired")
    return;
  }
  dbid = req.body.dbid;
  myprint("userid:"+userid+" deleting database: "+req.body.dbid)

  const result1 = await query("select nowopendbid from user where userid="+userid);
  nowopendbid = result1[0]["nowopendbid"];
  myprint("now db id for user"+userid+":"+nowopendbid)//得到当前打开的db

  

  const result2 = await query("select count(dbid) from db where userid="+userid);
  dblength = result2[0]["count(dbid)"];
  myprint("now db length for user "+userid+":"+dblength)//得到当前用户有多少db

  if(dblength<=1){
    res.status(400).send("Last database cannot be deleted :L")
  }

  // const result3 = await query("delete from db where dbid = " +dbid+ " and userid = " +userid);
  else{
    if(dbid == nowopendbid){//删除当前打开db的时候，切换当前db到别的db
      
      const result10 = await deleteDatabase(dbid,userid)
      const result3 = await query("select min(dbid) from db where userid = " +userid);
      const result4 = await query("update user set nowopendbid="+result3[0]["min(dbid)"]+" where userid = " +userid);
    }else{

      const result10 = await deleteDatabase(dbid,userid)
    }
    res.status(200).send("OK");
  
  }

});

const deleteDatabase = async (dbid,userid) => {

  
  const result1 = await query("delete from catalogue where dbid = " +dbid+ " and userid = " +userid);
  const result2 = await query("delete from note where dbid = " +dbid+ " and userid = " +userid);
  const result3 = await query("select hash,size from img where dbid = " +dbid+ " and userid = " +userid);
  // console.log(result2)
  var acc = 0;
  result3.forEach(x => {
    deleteImg(x.hash)
    acc += parseInt(x.size)
  });
  const result4 = await query("select size from user where userid = " +userid);
  var res = parseInt(result4[0]["size"]) - acc;
  const result5 = await query("update user set size = " + res +" where userid = " +userid);
  const result6 = await query("delete from img where dbid = " +dbid+ " and userid = " +userid);
  const result7 = await query("delete from db where dbid = " +dbid+ " and userid = " +userid);
  myprint("delete db" + dbid +" finish")
  
  
}
function deleteImg(hash) {
  bucketManager.delete(bucket, hash, function(err, respBody, respInfo) {
    if (err) {
      console.log(err);
      //throw err;
    } else {
       myprint("delete img ok!") // 最后还是res.end
    } 
  });
  
}
 
  module.exports = router