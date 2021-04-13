

var vm = new Vue({
    el: '#databaseContainer',
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
        refresh(){
            console.log("refresh")
            var that = this;
            axios.post('/personal/refresh', {
                token : localStorage.token
            })
            .then(function (response) {
                that.databases =  response.data.db;
                that.nowopendbid = response.data.nowopendbid;
                console.log(that.nowopendbid)
                for(var i = 0; i < that.databases.length; i++) {
                    if(that.databases[i].dbid == that.nowopendbid){
                        that.databases[i].checked = 'True';
                    }else{
                        that.databases[i].checked = '';

                    }
                }
                console.log(that.databases)
                that.$forceUpdate();
            })
            .catch(function (error) {
                console.log(error);
            });
            
        },
        clickUnit(id){
            var that = this;
            axios.post('/personal/changenowopendbid', {
                token : localStorage.token,
                dbid:id
            })
            .then(function (response) {
                console.log("then")
                that.refresh();
               
            })
            .catch(function (error) {
                that.refresh();
            });
            
        },

  
    }
    
    
});