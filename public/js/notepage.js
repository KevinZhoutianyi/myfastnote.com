// 转md
    function mdSwitch() {
        var mdValue = document.getElementById("md-area").value;
        var converter = new showdown.Converter();
        converter.setOption('simpleLineBreaks', true);
        var html = converter.makeHtml(mdValue);
        for (let index = 0; index < 10; index++) {
            html += "<br>";
        }
        
        document.getElementById("show-area").innerHTML = html;
    }


// 加载上次编辑文档
    function loadData() {
        // to do : get the real data
        console.log("username: "+localStorage.username + "loading data")
        $.ajax({
            url:"notepage/getdata",
            type: "post",
            data:{username : localStorage.username},
        
            success: function (returnValue) {
                // console.log("dataloaded:"+ JSON.stringify(returnValue) )
                document.getElementById("md-area").innerHTML= returnValue.content;
                localStorage.nowopenfileid = returnValue.id;
                m = document.getElementById("md-area");
                m.style.height='auto';
                m.style.height = m.scrollHeight + 50 + 'px';
                mdSwitch();
            },
            error: function (returnValue) {
                alert("lose connection");
                mdSwitch();
            }
        })
        
        
    }
    function loadfile(id) {
        // to do : get the real data
        console.log("username: "+localStorage.username +" loading file id: "+id)
        $.ajax({
            url:"notepage/getfile",
            type: "post",
            data:{username : localStorage.username, fileid : id},
        
            success: function (returnValue) {
                // console.log("dataloaded:"+ JSON.stringify(returnValue) )
                document.getElementById("md-area").value= returnValue.content;
                localStorage.nowopenfileid = returnValue.fileid;
                localStorage.userid = returnValue.userid;
                m = document.getElementById("md-area");
                m.style.height='auto';
                m.style.height = m.scrollHeight + 50 + 'px';
                mdSwitch();
            },
            error: function (returnValue) {
                alert("lose connection");
                mdSwitch();
            }
        })
        
        
    }
    // 加载目录
    function loadcatalogue() {
        // to do : get the real data
        console.log("username: "+localStorage.username+ "loading catalogue")
        $.ajax({
            url:"notepage/getcatalogue",
            type: "post",
            data:{username : localStorage.username},
            success: function (returnValue) {
                var content = JSON.stringify(returnValue);
                var showhtml = "<br><br>";
                var foldersfileidarray =[];
                for (let index = 0; index < returnValue.length; index++) {
                    if(returnValue[index].level == 0){
                        var temp = {};
                        temp.fileid = returnValue[index].fileid;
                        temp.filename = returnValue[index].filename;
                        foldersfileidarray.push(temp);
                    }
                    
                }
                
                console.log("folder's file id and name" +JSON.stringify(foldersfileidarray)  )
                for (let i = 0; i < foldersfileidarray.length; i++) {
                    showhtml += "<div id='folder' name='" + foldersfileidarray[i]  +"'>";
                    showhtml += "<h2 ondrop='drop(event,this)' ondragover='allowDrop(event)' id='foldername' name = "+ foldersfileidarray[i].fileid+"  onclick='folderclick(this)' contenteditable='false' onmousedown='mousedown(this);'  onmouseup='mouseup(this);' onmouseout  =' mouseout(this)' tabindex='1' onblur='myblur(this);'>" + foldersfileidarray[i].filename + "</h2>";
                    for (let j = 0; j < returnValue.length; j++) {
                        if(returnValue[j].fatherid == foldersfileidarray[i].fileid)
                        {
                            showhtml += "<h4 ondrop='drop(event,this)' ondragover='allowDrop(event)' id = 'file' name = "+ returnValue[j].fileid+" onmousedown='mousedown(this);clickfile(this)'  onmouseup='mouseup(this);' onmouseout  =' mouseout(this)' tabindex='1' onblur='myblur(this);'contenteditable='false' style='display: block;' >" + returnValue[j].filename+ "</h4>";
                        }
                        
                    }
                    showhtml += "</div>";
                }
                

                
                document.getElementById("menutextarea").innerHTML = showhtml;
            },
            error: function (returnValue) {
                alert("lose connection");
            }
        })
        
    }

// 按键保存 删除时候调整高度
//     document.onkeydown=function() {
//     if (event.keyCode == 8) {
//         if (document.activeElement.type == "text"||document.activeElement.type == "textarea"||document.activeElement.type == "password") {
//             if (document.activeElement.readOnly == false)
//                 m = document.getElementById("md-area");
//                 m.style.height='auto';
//                 m.style.height = m.scrollHeight - 50 + 'px';
//                 return true;
//         }
//         m = document.getElementById("md-area");
//         m.style.height='auto';
//         m.style.height = m.scrollHeight - 50 + 'px';
//         return false;
//     }
   
    
// }

    window.addEventListener("keydown", function(e) {
            //可以判断是不是mac，如果是mac,ctrl变为花键
            //event.preventDefault() 方法阻止元素发生默认的行为。
            if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                e.preventDefault();
                // Process event...
                m = document.getElementById("md-area");
                m.style.height='auto';
                m.style.height = m.scrollHeight + 50 + 'px';
                m = document.getElementById("md-area").value;
                $.ajax({
                    url:"notepage/savedata",
                    type: "post",
                    data:{content : m,id :localStorage.nowopenfileid,userid : localStorage.userid},
                    success: function (returnValue) {
                        $('<div>').appendTo('body').addClass('alert alert-success').html('Saved').show().delay(500).fadeOut();
                    },
                    error: function (returnValue) {
                        console.log("save fail")
                    }
                })
            }
         
        }, false);

// 锁
    function lock(){
        if(localStorage.islock == 1){
            localStorage.islock = 0;
            $("#locked").hide();
            $("#notlocked").show();
        }else{
            localStorage.islock = 1;
            $("#locked").show();
            $("#notlocked").hide();
        }            
    }
    // 目录 上下
    function arrow(){
        if(localStorage.isarrowdown == 1){
            localStorage.isarrowdown = 0;
            $("#downarrow").hide();
            $("#uparrow").show();
            $("#pop").show();
        }else{
            localStorage.isarrowdown = 1;
            $("#downarrow").show();
            $("#uparrow").hide();
            $("#pop").hide();
            // document.getElementById('md-area').focus();
        }     
        // myblur();       
    }
    // 右上角帮助
function question(){
    if(localStorage.showhelp == 1){
        localStorage.showhelp = 0;
        $("#question").css('z-index',5);
        $("#questionpop").hide();
    }else{
        localStorage.showhelp = 1;
        $("#question").css('z-index', 12);
        $("#questionpop").show();
        // document.getElementById('md-area').focus();
    }            
}
function folderclick(obj) {
    if($(obj).attr("contentEditable")=='false'){
        if($(obj).parent().children("#file").css('display') == 'block'){
    
            $(obj).parent().children("#file").hide();
        }else{
            
            $(obj).parent().children("#file").show();
        }

    }
}
function clickfile(obj) {
    loadfile($(obj).attr('name'));
}

// $(function(){
//     setInterval(function(){
//         console.log("123")
//         m = document.getElementById("md-area");
//         m.style.height='auto';
//         m.style.height = m.scrollHeight - 50 + 'px';
//     }, 3000);
// });

var timeout;//用于存储定时器的变量
// 长按
function mousedown(obj) {
    timeout= setTimeout(function() {
        $(obj).attr("contentEditable",true)
        localStorage.edited = 1;
        
        obj.focus();
    }, 700);//鼠标按下1秒后发生事件
}
function mouseup(obj) {
    clearTimeout(timeout);//清理掉定时器
}

function mouseout(obj) {
    
    // $(obj).attr("contentEditable",false)
    clearTimeout(timeout);//清理掉定时器 
}


// div失去焦点 分点了一下 点了别的地方 和 编辑之后点了别的地方
// localedited用来 排除点了一下 div 之后点了别的地方的失去焦点
// undefined是 div blur的bug
function myblur(obj) {
    
    if($(obj).html()==undefined)
    return;
    if(localStorage.edited == 1){
        
        localStorage.edited = 0;
        
        console.log(localStorage.edited)
        
        if($(obj).html().length<=3){
            alert("too short")
            loadcatalogue();
        }else{
            savecatalogue($(obj).html(),$(obj).attr('name'))
        }
        console.log($(obj).html())
        $(obj).attr("contentEditable",false)
        }
}
function savecatalogue(filename,fileid) {
    console.log("username: "+localStorage.username +" save file id: "+fileid)
        $.ajax({
            url:"notepage/savecatalogue",
            type: "post",
            data:{username : localStorage.username, fileid : fileid,filename:filename},
        
            success: function (returnValue) {
                console.log("save catalogue success")
                loadcatalogue();
            },
            error: function (returnValue) {
                alert("lose connection");
            }
        })
}
function anim(obj) {
    $(obj).addClass("avaanim");
    timeout= setTimeout(function() {
        $(obj).removeClass("avaanim");
    }, 10000);//鼠标按下1秒后发生事件
}

function newfolder(obj){
    console.log("username: "+localStorage.username +" new file ")
        $.ajax({
            url:"notepage/newfolder",
            type: "post",
            data:{userid : localStorage.userid},
        
            success: function (returnValue) {
                console.log(returnValue)
                loadcatalogue();
            },
            error: function (returnValue) {
                alert("lose connection");
            }
        })
}

function dragStart(event,op) {
    event.dataTransfer.setData("Text", op);
}
function allowDrop(event) {
    event.preventDefault();
}
function drop(event,obj) {
    event.preventDefault();
    console.log($(obj).attr('id'))
    var data = event.dataTransfer.getData("Text");
    console.log(data)

    if(data=="delete"){
        if($(obj).attr('id')=='foldername'){
            //提示是否要删除文件和文件夹下所有内容
            var r=confirm("是否要删除文件夹下所有内容?");
            if (r==true){
                //ajax删除文件夹 和它下面的所有文件
                $.ajax({
                    url:"notepage/deletefile",
                    type: "post",
                    data:{fileid : $(obj).attr('name'),userid:localStorage.userid},
                
                    success: function (returnValue) {
                        console.log(returnValue)
                        loadcatalogue();
                    },
                    error: function (returnValue) {
                        alert("lose connection");
                    }
                })
            }
            else{
            }
        }
        else if($(obj).attr('id')=='file'){
            //提示是否要删除文件
            var rr=confirm("是否要删除文件?");
            if (rr==true){
                $.ajax({
                    url:"notepage/deletefile",
                    type: "post",
                    data:{fileid : $(obj).attr('name'),userid:localStorage.userid},
                
                    success: function (returnValue) {
                        console.log(returnValue)
                        loadcatalogue();
                    },
                    error: function (returnValue) {
                        alert("lose connection");
                    }
                })
            }
            else{
            }

        }

    }else if(data == "new"){
        if($(obj).attr('id')=='foldername'){
            $.ajax({
                url:"notepage/newfile",
                type: "post",
                data:{userid : localStorage.userid,folderid:$(obj).attr('name')},
            
                success: function (returnValue) {
                    console.log(returnValue)
                    loadcatalogue();
                },
                error: function (returnValue) {
                    alert("lose connection");
                }
            })
        }
    }
    
}
//用localstorage在loadcatalogue之后展开folder