var isLogin = 0;
function query(){
    console.log("query")
    $.ajax({
        //几个参数需要注意一下
            type: "POST",//方法类型
            url: "/admin/query" ,//url
            data: {query:$('.query').val(),token:localStorage.adminToken},
            success: function (result) {
                
                $('#resultPart').text(JSON.stringify(result))
            },
            error : function(result) {
                console.log("fail");
            }
        });

}









// register the grid component
Vue.component('demo-grid', {
    template: '#grid-template',
    props: {
      data: Array,
      columns: Array,
      filterKey: String
    },
    data: function () {
      var sortOrders = {}
      this.columns.forEach(function (key) {
        sortOrders[key] = 1
      })
      return {
        sortKey: '',
        sortOrders: sortOrders
      }
    },
    methods: {
      sortBy: function (key) {
        this.sortKey = key
        this.sortOrders[key] = this.sortOrders[key] * -1
      }
    }
  })
  
  // bootstrap the demo
  var demo = new Vue({
    el: '#demo',
    data: {
      log:"",
      searchQuery: '',
      gridColumns: ['name', 'power'],
      gridData: [
        { name: 'Chuck Norris', power: Infinity },
        { name: 'Bruce Lee', power: 9000 },
        { name: 'Jackie Chan', power: 7000 },
        { name: 'Jet Li', power: 8000 }
      ]
    },
    methods : {
      getuser(){
          let that = this
          axios
        .post('admin/query', {
          token:localStorage.adminToken,
          query:'select * from user  limit 1000;'
          })
        .then(function (response) { 
          that.gridColumns = Object.keys(response.data[0])
          that.gridData = response.data
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });
        
        // that.$forceUpdate();
      },
      getcatalogue(){
        let that = this
        axios
      .post('admin/query', {
        token:localStorage.adminToken,
        query:'select * from catalogue  limit 1000;'
        })
      .then(function (response) { 
        that.gridColumns = Object.keys(response.data[0])
        that.gridData = response.data
      })
      .catch(function (error) { // 请求失败处理
        console.log(error);
      });
      
      // that.$forceUpdate();
    },
    
    getdb(){
      let that = this
      axios
    .post('admin/query', {
      token:localStorage.adminToken,
      query:'select * from db  limit 1000;'
      })
    .then(function (response) { 
      that.gridColumns = Object.keys(response.data[0])
      that.gridData = response.data
    })
    .catch(function (error) { // 请求失败处理
      console.log(error);
    });
    
    // that.$forceUpdate();
  },
  getimg(){
    let that = this
    axios
  .post('admin/query', {
    token:localStorage.adminToken,
    query:'select * from img limit 1000;'
    })
  .then(function (response) {
    that.gridColumns = Object.keys(response.data[0])
    that.gridData = response.data
  })
  .catch(function (error) { // 请求失败处理
    console.log(error);
  });
  
  // that.$forceUpdate();
},



  // that.$forceUpdate();
},




  })

  var display3 = new Vue({
    el: '#display--3',
    data: {
      logdata:'123'
    },
    methods : {
      logfile(){
        let that = this
        axios
        .post('admin/logfile', {
          token:localStorage.adminToken
          })
        .then(function (response) { 
          logdata = response.data
          console.log("logdata",logdata)
          // $('#display--3').html(logdata)
        })
        .catch(function (error) { // 请求失败处理
          console.log(error);
        });
      }
    }
    
  })

  var login = new Vue({
    el: '.vuedata',
    data: {
    },
    created () {
      
      
    },
    methods:{
      login(){
        console.log("login")
        $.ajax({
            //几个参数需要注意一下
                type: "POST",//方法类型
                url: "/admin/login" ,//url
                data: $('#myform').serialize(),
                success: function (result) {
                    // console.log(result)
                    localStorage.adminToken = result;
                    $.ajax({
                        //几个参数需要注意一下
                            type: "POST",//方法类型
                            url: "/admin/showpage" ,//url
                            success: function (result) {
                                $('body').html($(result));
                                isLogin = 1;
                                demo.getcatalogue()
                                review.getreview()
                                // display3.logfile()
                                $('.modal').hide()
                            },
                            error : function(result) {
                                alert("fail");
                            }
                        });
                },
                error : function(result) {
                    alert("fail");
                }
            });
    
    }
    }
    
  })


  var review = new Vue({
    el: '.reviewcontainer',
    data: {
      content:[]
    },
    created () {
     
      
      
    },
    methods:{
      getreview(){
        var that = this;
        console.log("review")
        $.ajax({
            //几个参数需要注意一下
                type: "POST",//方法类型
                url: "/admin/review" ,//url
                data:{token:localStorage.adminToken},
                success: function (result) {
                  that.content = (result)
                  console.log(that.content)
                  // that.$forceUpdate();
                    
                },
                error : function(result) {
                    alert("fail");
                }
            });
    
    },
    
      rej(x){
        var that = this
        $.ajax({
          //几个参数需要注意一下
              type: "POST",//方法类型
              url: "/admin/rej" ,//url
              data:{token:localStorage.adminToken,userid:x.userid,dbid:x.dbid},
              success: function (result) {
                console.log("ok")
                  
                that.getreview()
              },
              error : function(result) {
                  alert("fail");
              }
          });
      },
      acc(x){
        var that = this
        $.ajax({
          //几个参数需要注意一下
              type: "POST",//方法类型
              url: "/admin/acc" ,//url
              data:{token:localStorage.adminToken,userid:x.userid,dbid:x.dbid},
              success: function (result) {
                console.log("ok")
                that.getreview()
                  
              },
              error : function(result) {
                  alert("fail");
              }
          });
      },
    }
    
  })
