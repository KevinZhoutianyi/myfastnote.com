
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
const JwtUtil = require('./js/jwt');


app.use(bodyParser.urlencoded({ extended: false }))
app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
app.use('/public', express.static('public'));
app.use(bodyParser.json());//数据JSON类型

  app.set('view engine', 'ejs');//设置之后就能render .ejs了
  app.set("views",__dirname + "/public/html/"); //这个设置在router里报错 说No default engine was specified and no extension was provided.





app.use('/main', require('./js/router/main'));
app.use('/blog', require('./js/router/blog_back'));
app.use('/tempnote', require('./js/router/tempnote_back'));
app.use('/admin', require('./js/router/admin'));
app.use('/personal', require('./js/router/personal'));




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
// app.get('/query' , async (req, res) => {
//    const rows = await query(querySql.read);
//    res.end(JSON.stringify(rows));
// })


app.get('/', function (req, res) {
   console.log( req.ip + "visit your server  \n");
   res.sendFile( __dirname + "/public/html/" + "index.html" );
})



app.post('/login',urlencodedParser, async (req, res) => {
  console.log(req.body.username+","+req.body.password+" try to login\n")
  const result = await query("select userid from user where username = '"+req.body.username+"' and password = '"+req.body.password+"'");
  if(result.length == 1){
    var content = {id:result[0].userid}
    let jwt = new JwtUtil(content);
    let token = jwt.generateToken();
    console.log("userid "+result[0].userid+" login success"+",his token is "+token)
    res.status(200).send(token)

  }else{
    res.status(400).send("fail")
  }  
})


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

//如果该用户的token可用 就刷新他的token，给他新的24小时
//也就是说用户只要在24小时内 checktoken过就不会过期
app.post('/checktoken',urlencodedParser, async (req, res) => {
  console.log("check tocken for: "+req.body.token)
  userid = getid(req.body.token)
  if(userid=="-1"){
    res.status(400).send("cantverifytoken")
    return;
  }
  console.log("userid:"+userid+"check token success, give him a new one");
  var content = {id:userid}
  let jwt = new JwtUtil(content);
  let token = jwt.generateToken();
  res.status(200).send(token)
})










var server = app.listen(80, function () {
   console.log("server start!! lets get it \n\n")
})
