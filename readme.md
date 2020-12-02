# mysql rule
一个用户 filename可以重复
一个用户 fileid不可以重复
不同用户fileid可以重复，A有文件10，B也有fileid10
目录:fatherid = null, level = 0; isnote = 0
文件：level = 1; isnote = 1;


# 上传七牛云
用户上传图片form的形式到nodejs服务器，服务器在uploadimg接口处
1. 判断该用户是否有足够空间上传该图片
2. 如果没有足够空间 那么返回400
3. 如果用户有足够空间，上传图片到qiniuyun，后更新mysql

为了防止用户上传过大图片
在上传到七牛之前用nodejs最下面的lib压缩函数 压缩成一个800的blob
再在inputchange之中 转变为file之后上传到七牛云

防止用户上传过多图片
mysql user之后有maxsize和size，size表示他已经上传总图片字节数。max表示他被允许上传最大的字节数。如果max-size比用户新上传的图片小。那么上传失败
mysql之中的img存放用户   在哪个文件下上传的图片(这个没啥用) 和 对应图片的hash,用来批量删除七牛云的图片【比如删除userid0的所有图片】


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



# mysql 存 ' " \的问题
把文本内容里的 “  \'  ” 替换成  “   \\\'   ” 。加载到mysql之后的时候 变成 “   \'   " 。再load到网页上之后 才能显示成 '


# 加入token系统
改进index界面，加入js，ajax获取token登录成功后跳转


用户名密码登录之后ajax传给nodejs的/login，登录成功生成token并返回加载到localstorage之后，返回200，locationhref的get调用/main得到notepage.html。之后用token去解析数据


目前只用一个字符串作为私钥加密了id-》token。在jwtjs之中 generate和verify。在mainjs之中调用 用verify得到解码结果再判断是否expire，如果expire直接ressend(expire)前端收到expired之后console一下

# 多设备登录问题
是否需要限制登录？
目前的ajax操作
1. 把写的content直接存到对应file里
2. 改写文件名
3. 创建上传文件
4. 上传图片。。
目前而看多登录不会造成问题

# 功能测试
1. 登录，得到一个新token
2. main得到之后，加载上次保存的文件
3. 加载对应db的目录
4. 点击文件名字 得到内容
5. 删除文件，新建文件，删除文件夹，新建文件夹
6. 重命名文件夹和文件
7. 批量上传文件 
8. 展开收起目录
9. 保存
10. 上传图片


# 文件\n问题 思路
数据库里存的永远是可以直接用的md格式的文件
但问题是 textarea里的\n在marked翻译的时候没法被识别出来 （也就是在showarea里不能正常换行）
所以在 前端 用marked转md的时候，需要把文章内\n部分都替换成<br>