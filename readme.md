# mysql rule
一个用户 filename可以重复
一个用户 fileid不可以重复
不同用户fileid可以重复，A有文件10，B也有fileid10
目录:fatherid = null, level = 0; isnote = 0
文件：level = 1; isnote = 1;


# 上传七牛云
在index.js0->main.js生成提供一个获得七牛云我的服务器的token的一个接口
用户登陆的时候调用得到token存在 localstorage里
(裁剪完图片之后)
把图片用form+ajax传给七牛服务器
在md区域加入生成的地址


# 文件路径
凡是前端用到的都丢到了public里
/js存放所有js文件。/js/router用来管理 不同页面的postget接口(main.js用来处理main页面下所有postget请求)
index.js 里require一个router 


# 文件名
main 主要 的记笔记页面
index 登陆页面，服务器主接口


# extramenu
设置一个div在右下角。碰到之后移动menu
mouseleavemenu之后再移动回去


