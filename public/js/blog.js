// var vm = new Vue({
//     el: '#databinding',
//         data: {
//             show:true,
//             styleobj :{
//                 fontSize:'30px',
//                 color:'red'
//             }
//         },
//         methods : {
//         }
//     });

// import "./blog.css";/
var vm = new Vue({
    el: '#left',
    data: {
        folders: [
            
        ],
    },
    mounted () {
        let that = this
        axios
          .post('blog/catalogue')
          .then(function (response) { 
              
            that.folders = response.data
            console.log(response.data)
          })
          .catch(function (error) { // 请求失败处理
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
            axios.post('/blog/content', {
                id : fileid
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
        content:"All notes are originally token in Chinese and are translated by translator in this page"
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


