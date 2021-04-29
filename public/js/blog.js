var vm = new Vue({
    el: '#left',
    data: {
        folders: [
            
        ],
    },
    mounted () {
        let that = this;
        info = ($(".info").html())
        spinfo = (info.split(","))
        axios.post('/blog/catalogue',{
            userid:spinfo[0],
            dbid:spinfo[1],
        })
        .then(function (response) { 
        that.folders = response.data
        console.log(response.data)
        }).catch(function (error) { // 请求失败处理
        console.log(error);
        });

        axios.post('/blog/content', {
            userid:spinfo[0],
            fileid : 0
        })
        .then(function (response) {
            mdValue = response.data;
            mdValue = mdValue.replace(/\\/g,"\\\\");
            
            var html = marked(mdValue.replace(/\\n/g, '\n'))
            document.getElementById("rightcontent").innerHTML = html;
            
            MathJax.typesetClear()
            MathJax.typeset(["#rightcontent"]);
            mdValue = ""
            html =""
        })
        .catch(function (error) {
            console.log(error);
        });
    },
    methods : {
        clickfolder(e){
            let obj = e.target
            folderid = $(obj).attr('name')
            if($(obj).parent().children("#filecontainer").css('display') == 'flex')
                $(obj).parent().children("#filecontainer").hide();
            else
                $(obj).parent().children("#filecontainer").show();
        },
        clickfile(fileid) {
            
            info = ($(".info").html())
            spinfo = (info.split(","))
            axios.post('/blog/content', {
                userid:spinfo[0],
                fileid : fileid,
                dbid:spinfo[1],
            })
            .then(function (response) {
                mdValue = response.data;
                mdValue = mdValue.replace(/\\/g,"\\\\");
                
                var html = marked(mdValue.replace(/\\n/g, '\n'))
                document.getElementById("rightcontent").innerHTML = html;
                
                MathJax.typesetClear()
                MathJax.typeset(["#rightcontent"]);
                mdValue = ""
                html =""
            })
            .catch(function (error) {
                console.log(error);
            });
        },
    }
    
    
});

var vm2 = new Vue({
    el: '#right',
    data: {
        content:"Click any file"
    },
   
});

var vm3 = new Vue({
    el: '#gomain',
    methods : {
        gomain() {
            location.href='/'
        }
    }
});

/*查看用户ip*/
function checkiplocation(){
    var iPAddress = "", iPAttach = "";//IP地址，IP归属地
    GetIPAll();
    //获取IP地址，IP归属地
    function GetIPAll() {
        iPAddress = returnCitySN["cip"];//IP地址:
        $.ajax({ cache:false,
            url:"http://www.geoplugin.net/json.gp",
            type: "get",
            data:{ip:iPAddress},
            success: function (returnValue) {
                returnValue = JSON.parse(returnValue)
                $.ajax({ cache:false,
                    url:"main/checkip",
                    type: "post",
                    data:{location:returnValue.geoplugin_countryName+','+returnValue.geoplugin_city},
                
                    success: function (returnValue) {
                        
                    },
                    error: function (returnValue) {
                        
                    }
                })    
                
            },
            error: function (returnValue) {
                                      
            }
    }) 
    }
}
/*查看用户ip*/
