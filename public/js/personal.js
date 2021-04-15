

var vm = new Vue({
    el: '.databaseContainer',
    data: {
        content:"All notes are originally token in Chinese and are translated by translator in this page",
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

  
    }
    
    
});


/*右键的context menu*/
document.addEventListener("click", hideMenu);
document.addEventListener("keypress", hideMenu);
document.addEventListener("contextmenu", (e) => {
    console.log(e.path[0])
    let x = e.path[0].id
    $(".newfile").css("display","none");
    $(".newfolder").css("display","none");
    $(".trash").css("display","none");
    $(".upload").css("display","none");
    $(".rename").css("display","none");
    $(".foldall").css("display","none");
    $(".unfoldall").css("display","none");
    if(x=="pathUnit"||x=="pathContainer"){//右键在file上
        
        e.preventDefault();

        if(x=="pathUnit"){
            $(".trash").css("display","flex");
            $(".rename").css("display","flex");
        }
        
        else if(x=="pathContainer"){
            $(".newfolder").css("display","flex");
        }
        
        localStorage.contextmenudbname = $(e.path[0]).attr("dbname");
        localStorage.contextmenudbid = $(e.path[0]).attr("dbid");

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
    
],
});


const menus = menuSinglton.getInstance();//加载的时候先创建一次 不然bug
function showMenu(e) {
    const menus = menuSinglton.getInstance();
    menus.style.top = `${e.clientY/1+5}px`;
    menus.style.left = `${e.clientX/1+5}px`;
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