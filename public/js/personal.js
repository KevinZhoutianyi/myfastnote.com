
var zoomScale = 1
function getWindowSize(params) {
    let windowWidth=$(window).width();
    let windowHeigh=$(window).height();
    let documentWidth = 1800;
    zoomScale=windowWidth/documentWidth;
    // console.log(zoomScale)
    // console.log(documentWidth)
    // console.log(windowWidth)
    $('body').css({'zoom':zoomScale});
    
}
$(document).ready(function(){
    localStorage.dbshowhelp = 0;
    $("#questionxD").css('z-index', 99);
    refreshQuestion()
    getWindowSize()
    
})

$(window).bind('resize',function(){getWindowSize()});
var vm = new Vue({
    el: '.databaseContainer',
    data: {
        content:"",
        databases: [
            
        ],
        nowopendbid : -1,
    },
    mounted () {
        this.refresh()
        
        // alert("!")
        // let that = this
        // axios
        //   .post('blog/catalogue')
        //   .then(function (response) { 
              
        //     that.folders = response.data
        //     console.log(response.data)
        //   })
        //   .catch(function (error) { // 请求失败处理
        //     console.log(error);
        //   });
        // axios.post('/blog/content', {
        //     id : 11
        // })
        // .then(function (response) {
        //     mdValue = response.data;
        //     mdValue = mdValue.replace(/\\/g,"\\\\");
            
        //     var html = marked(mdValue.replace(/\\n/g, '\n'))
        //     document.getElementById("rightcontent").innerHTML = html;
            
        //     MathJax.typesetClear()
        //     MathJax.typeset(["#rightcontent"]);
        //     mdValue = ""
        //     html =""
        // })
        // .catch(function (error) {
        //     console.log(error);
        // });
    },
    methods : {
        refresh(){//从dbtable里加载用户所有dbid name ，根据user里的nowopendbid 高亮当前db,
            console.log("refresh")
            var that = this;
            axios.post('/personal/refresh', {
                token : localStorage.token
            })
            .then(function (response) {
                that.databases =  response.data.db;
                that.nowopendbid = response.data.nowopendbid;
                // console.log(that.nowopendbid)
                for(var i = 0; i < that.databases.length; i++) {

                    if(that.databases[i].status==0){
                        that.databases[i].status='Private';
                    }else if(that.databases[i].status==1){
                        that.databases[i].status='Reviewing';
                    }
                    else if(that.databases[i].status==2){
                        that.databases[i].status='Public';
                    }

                    if(that.databases[i].dbid == that.nowopendbid){
                        that.databases[i].checked = 'True';
                    }else{
                        that.databases[i].checked = '';

                    }
                }
                // console.log(that.databases)
                that.$forceUpdate();
            })
            .catch(function (error) {
                alert("token expired ;(")
                location.href = "/"
            });
            
        },
        clickUnit(id){//更改user table里的nowopenid
            var that = this;
            axios.post('/personal/changenowopendbid', {
                token : localStorage.token,
                dbid:id
            })
            .then(function (response) {
                // console.log("then")
                that.refresh();
               
            })
            .catch(function (error) {
                that.refresh();
            });
            
        },
 

  
    },
    myblur(obj) {
    
        if($(obj).html()==undefined)
        return;
        if(localStorage.edited == 1){
            localStorage.edited = 0;
    
            if($(obj).html().length<=2){
                alert("too short")
                loadcatalogue();
            }else{
                var s = "";
                s = $(obj).html();
                s = s.replace(/<div>/g, "");
                s = s.replace(/<\/div>/g, "");
                savecatalogue(s,$(obj).attr('name'));
            }
            // console.log($(obj).html())
            
            $(obj).attr("contentEditable",false)
            }
    }
    
    
});




window.addEventListener("keydown", function(e) {
    console.log("1")
    if(e.keyCode == 13 && localStorage.edited==1){
        console.log("2")
        e.preventDefault();
        var obj  = document.getElementsByName(localStorage.contextmenudbid)
        // console.log(obj)
        myblur(obj);
    }
      
 
}, false);
/*右键的context menu*/
document.addEventListener("click", hideMenu);
document.addEventListener("keypress", hideMenu);
document.addEventListener("contextmenu", (e) => {
    // console.log(e.path[0])
    let x = e.path[0].id
    $(".newfolder").css("display","none");
    $(".trash").css("display","none");
    $(".rename").css("display","none");
    $(".soloppl").css("display","none");
    $(".multippl").css("display","none");
    $(".blog").css("display","none");
    
    localStorage.contextmenudbname = $(e.path[0]).attr("dbname");
    localStorage.contextmenudbid = $(e.path[0]).attr("dbid");
    if(x=="pathUnit"||x=="pathContainer"){//右键在file上
        
        e.preventDefault();

        if(x=="pathUnit"){

            $.ajax({cache:false,
                url:"personal/checkstatus",
                type: "post",
                data:{token:localStorage.token,dbid:localStorage.contextmenudbid},
            
                success: function (returnValue) {
                    if(returnValue.status == 1 ){
                        $(".soloppl").css("display","flex");
                        $(".trash").css("display","flex");
                        $(".rename").css("display","flex");

                    }else if(returnValue.status==0){
                        $(".multippl").css("display","flex");
                        $(".trash").css("display","flex");
                        $(".rename").css("display","flex");
                    }else if(returnValue.status == 2){
                        $(".soloppl").css("display","flex");
                        $(".blog").css("display","flex");
                        $(".trash").css("display","flex");
                        $(".rename").css("display","flex");

                    }
                },
                error: function (returnValue) {
                }
            })

        }
        
        else if(x=="pathContainer"){
            $(".newfolder").css("display","flex");
        }
        

        console.log(localStorage.contextmenudbname+","+localStorage.contextmenudbid)
        showMenu(e);
    }else{
        hideMenu();
    }
  });
  const ContextMenu = function (options) {
    // 唯一实例
    let instance;
  
    // 创建实例方法
    function createMenu() {
        const ul = document.createElement("div");
        ul.classList.add("custom-context-menu");
        const { menus } = options;
        if (menus && menus.length > 0) {
          for (let menu of menus) {
            const li = document.createElement("div");
            li.style = "background-color:rgba(80, 79, 79, 0.657);";
            $(li).attr("id","icon");
            $(li).attr("class",menu.class);

            $(li).append( "<img src='"+menu.name+"' class='"+menu.class+"img'>")

            li.onclick = menu.onClick;
            ul.appendChild(li);
          }
        }
        const body = document.querySelector("body");
        body.appendChild(ul);
        return ul;
      }
  
    return {
      // 获取实例的唯一方式
      getInstance: function () {
        if (!instance) {
          instance = createMenu();
          
        }
        return instance;
      },
    };
  };
  
const menuSinglton = ContextMenu({
menus: [
    {
        name: "public/png/trashwhite.png",
        class: "trash",
        onClick: function (e) {
            deldb();
        },
    },
    {
        name: "public/png/newfolder.png",
        class: "newfolder",
        onClick: function (e) {
            newdb();
        },
    },
    {
        name: "public/png/rename.png",
        class: "rename",
        onClick: function (e) {
            rename();
        },
    },
    
    {
        name: "public/png/soloppl.png",
        class: "soloppl",
        onClick: function (e) {
            soloppl();
        },
    },
    
    {
        name: "public/png/multippl.png",
        class: "multippl",
        onClick: function (e) {
            multippl();
        },
    },
    
    {
        name: "public/png/blog2.png",
        class: "blog",
        onClick: function (e) {
            blog();
        },
    },
    
],
});


const menus = menuSinglton.getInstance();//加载的时候先创建一次 不然bug
function showMenu(e) {
    const menus = menuSinglton.getInstance();
    menus.style.top = `${e.clientY/zoomScale+5}px`;
    menus.style.left = `${e.clientX/zoomScale+5}px`;
    menus.style.display = "flex";
}


function hideMenu(e) {
    const menus = menuSinglton.getInstance();
    menus.style.display = "none";
}

document.addEventListener("click", hideMenu);
document.addEventListener("keypress", hideMenu);
/*右键的context menu*/

function newdb() {
    $.ajax({cache:false,
        url:"personal/newdb",
        type: "post",
        data:{token:localStorage.token},
    
        success: function (returnValue) {
            vm.refresh();
        },
        error: function (returnValue) {
            alert(returnValue.responseText);
            vm.refresh();
        }
    })
}


function deldb() {
    $.ajax({cache:false,
        url:"personal/imgcount",
        type: "post",
        data:{token:localStorage.token,dbid:localStorage.contextmenudbid},
    
        success: function (returnValue) {

            var rr=confirm("Sure to delete "+returnValue.count+" images and all the files?");
            if(rr == true){
                $(".loading").css("display","flex")
                console.log("deleting:"+localStorage.contextmenudbid)
                $.ajax({cache:false,
                    url:"personal/deldb",
                    type: "post",
                    data:{token:localStorage.token,dbid:localStorage.contextmenudbid},
                
                    success: function (returnValue) {
                        vm.refresh();
                        
                        $(".loading").css("display","none")
                    },
                    error: function (returnValue) {
                        alert(returnValue.responseText)
                        vm.refresh();
                        $(".loading").css("display","none")
                    }
                })

            }
        },
        error: function (returnValue) {
        }
    })




    
}

/* 重命名全选 */
function selectText(obj){
    console.log(obj)
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(obj[0]);
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNodeContents(obj[0]);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}
/* 重命名全选 */
/* 重命名 */
function rename() {
    // console.log("renamefor " +(localStorage.contextmenudbname))
    var obj  = document.getElementsByName(localStorage.contextmenudbid)
    // console.log(obj)
    $(obj).attr("contentEditable",true)
    localStorage.edited = 1;
    $(obj).focus();
        selectText(obj);
}
/* 重命名 */
function myblur(obj) {

    if($(obj).html()==undefined)
    return;
    if(localStorage.edited == 1){
        localStorage.edited = 0;

        if($(obj).html().length<=2){
            alert("too short")
            vm.refresh();
        }else{
            var s = "";
            s = $(obj).html();
            s = s.replace(/\s*/g,"");
            s = s.replace(/<div>/g, "");
            s = s.replace(/<\/div>/g, "");
            savedbname(s,$(obj).attr('dbid'));
            
        }
        
        $(obj).attr("contentEditable",false)
        }
}
/*保存目录*/
function savedbname(dbname,dbid) {
    console.log("dbname: "+dbname +" dbid: "+dbid)
        $.ajax({ 
            cache:false,
            url:"personal/rename",
            type: "post",
            data:{token:localStorage.token, dbid : dbid,dbname:dbname},
        
            success: function (returnValue) {
                console.log("rename success")
                vm.refresh();
            },
            error: function (returnValue) {
                alert(returnValue.responseText);;
                location.href = "/"
            }
        })
}
/*保存目录*/



/*私有化*/
function soloppl(params) {
    console.log("solo ppl")
        $.ajax({ 
            cache:false,
            url:"personal/private",
            type: "post",
            data:{token:localStorage.token, dbid : localStorage.contextmenudbid},
        
            success: function (returnValue) {
                code = (returnValue.code)
                if(code == 0){
                    console.log("Already private")
                }else if (code == 1 || code ==2){
                    console.log("success")
                }
                vm.refresh();
            },
            error: function (returnValue) {
                alert(returnValue.responseText);;
                location.href = "/"
            }
        })


    
}
/*私有化*/


/*公开*/
function multippl(params) {
    console.log("multi ppl")
        $.ajax({ 
            cache:false,
            url:"personal/public",
            type: "post",
            data:{token:localStorage.token, dbid : localStorage.contextmenudbid},
        
            success: function (returnValue) {
                console.log(returnValue)
                code = (returnValue)
                vm.refresh();
            },
            error: function (returnValue) {
                alert(returnValue.responseText);;
                location.href = "/"
            }
        })

}
/*公开*/

function blog(params) {
    $.ajax({cache:false,
        url:"personal/checkstatus",
        type: "post",
        data:{token:localStorage.token,dbid:localStorage.contextmenudbid},
    
        success: function (returnValue) {
            if(returnValue.status == 2){
                location.href = "/blog/"+returnValue.id+"/"+returnValue.dbid

            }
        },
        error: function (returnValue) {
        }
    })

}



/* 右上角帮助 */
function question(){
    if(localStorage.dbshowhelp == 1){
        localStorage.dbshowhelp = 0;
        $("#questionxD").css('z-index',99);
        $("#questionpop").hide();
    }else{
        localStorage.dbshowhelp = 1;
        $("#questionxD").css('z-index', -1);
        $("#questionpop").show();
        // document.getElementById('md-area').focus();
    }            
    }
/* 右上角帮助 */

/* 帮助菜单切换 */

var questionNum = 1;
function leftclick(){
    questionNum = questionNum -1;
    refreshQuestion()  
}
function rightclick(){
    questionNum = questionNum +1;
    refreshQuestion()  
}
function refreshQuestion(){
    // alert(questionNum)
    // console.log($("#helpmenumid").children("#mathjaxhelp"))
    console.log("!")
    if(questionNum%2 == 0){
        
        $("#helpmenumid").children("#mathjaxhelp").show()
        $("#helpmenumid").children("#menuhelp").hide()
    }
    else if(questionNum%2 == 1){
        $("#helpmenumid").children("#mathjaxhelp").hide()
        $("#helpmenumid").children("#menuhelp").show()

    }
}
/* 帮助菜单切换 */


