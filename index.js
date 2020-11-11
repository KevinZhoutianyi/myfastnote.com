
/* init */
var express = require('express');
var mysql      = require('mysql');
var dbConfig = require('./database/DBConfig');//数据库登陆信息
var querySql = require('./database/querysql');//
var bodyParser = require('body-parser');
const { send } = require('process');
var pool = mysql.createPool( dbConfig.mysql );//创建数据库池
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var app = express();
var qiniu = require("qiniu");
const multiparty = require('multiparty');
const fs = require('fs');


app.use(bodyParser.urlencoded({ extended: false }))
app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
app.use('/public', express.static('public'));
app.use(bodyParser.json());//数据JSON类型





app.use('/main', require('./js/router/main'));
app.use('/getqiyuntoken', require('./js/router/upload'));




let query = function( sql, values ) {
   // 返回一个 Promise
   // console.log(sql)
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

//read database
app.get('/query' , async (req, res) => {
   const rows = await query(querySql.read);
   res.end(JSON.stringify(rows));
})


app.get('/', function (req, res) {
   console.log( req.ip + "visit your server  \n");
   res.sendFile( __dirname + "/public/html/" + "index.html" );
})


app.post('/login',urlencodedParser, function (req, res) {
  console.log(req.body.username+","+req.body.password+"   login ing \n\n")
  // 输出 JSON 格式
  var response = {
      "username":req.body.username,
      "password":req.body.password
  };
  pool.getConnection(function(err,connection){
     console.log("userlogin : connection to sql success")
     //var params = req.query || req.params;        //前端传的参数（暂时写这里，在这个例子中没用）
     var params = [];
     params[0] = response["username"];
     params[1] = response["password"];
     var qu = "select userid from user where username = '"+params[0]+"' and password = '"+params[1]+"'";
     connection.query(qu,function(err,result){
        if(result.length==1){
           console.log("login success")
           connection.release();
           console.log("userlogin : mysql release")
           res.status(200).send("suc")
        }
        else{
           console.log("login fail")
           connection.release();
           console.log("userlogin : mysql release")
           res.status(400).send("fail")
        }    
        })
     })
})



var server = app.listen(80, function () {
   console.log("server start!! lets get it \n\n")
})
