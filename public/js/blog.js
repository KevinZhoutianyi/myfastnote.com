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
            
        ]
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
        clickfile(fileid) {
            axios.post('/blog/content', {
                id : fileid
            })
            .then(function (response) {
                mdValue = response.data;
                mdValue = mdValue.replace(/\\/g,"\\\\");
                var html = marked(mdValue);
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
        content:"123\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r123\n\r"
    },
   
});


function mdSwitch() {
    var mdValue = document.getElementById("md-area").value;
    
}