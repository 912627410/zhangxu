
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('revenueMngController', revenueMngController);

  /** @ngInject */
  function revenueMngController($rootScope,$scope,$timeout,$uibModal,treeFactory,NgTableParams, ngTableDefaults,Notification,simService,serviceResource,DEFAULT_SIZE_PER_PAGE,SIM_STATUS_URL,REVENUE_URL, FLEET_PAGE_URL) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化查询参数
    vm.sim={
      "phoneNumber":"",
      "deviceinfo":{},

    };

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    vm.query = function(page,size,sort,fleetRecord){
      var restCallURL = FLEET_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != fleetRecord) {
        if (null != deviceinfo.deviceNum&&deviceinfo.deviceNum!="") {
          restCallURL += "&search_LIKE_deviceNum=" +$filter('uppercase')(deviceinfo.deviceNum);
        }
        if (null != deviceinfo.phoneNumber&&deviceinfo.phoneNumber!="") {
          restCallURL += "&search_LIKE_sim.phoneNumber=" + deviceinfo.phoneNumber;
        }
      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&search_EQ_organization.id=" + vm.org.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取车队记录数据失败");
      });
    };


      vm.query(0,10,null,null);


    //查询条件相关

    //日期控件相关
    //date picker
    vm.activeTimeStartOpenStatus = {
      opened: false
    };

    vm.activeTimeStartOpen = function ($event) {
      vm.activeTimeStartOpenStatus.opened = true;
    };

    vm.activeTimeEndOpenStatus = {
      opened: false
    };

    vm.activeTimeEndOpen = function ($event) {
      vm.activeTimeEndOpenStatus.opened = true;
    };


    var date = new Date();
    date.setDate(date.getDate()-30);  //默认查询最近一个月的异常数据
    vm.startDate=date;
    vm.endDate=new Date();

    // 日期控件相关
    // date picker
    vm.startDateOpenStatus = {
      opened: false
    };

    vm.startDateOpen = function ($event) {
      vm.startDateOpenStatus.opened = true;
    };

    vm.endDateOpenStatus = {
      opened: false
    };

    vm.endDateOpen = function ($event) {
      vm.endDateOpenStatus.opened = true;
    };


    //查询sim卡的状态集合
    var simStatusData = serviceResource.restCallService(SIM_STATUS_URL, "QUERY");
    simStatusData.then(function (data) {
      vm.sim.simStatusList = data;
    }, function (reason) {
      Notification.error('获取SIM卡状态集合失败');
    })



    vm.query=function(page,size,sort,queryPhoneNumber){
       var rspData=simService.queryPage(page,size,sort,queryPhoneNumber);
       rspData.then(function(data){
         vm.simList = data.content;

         vm.tableParams = new NgTableParams({},
           {
           dataset: data.content
         });
         vm.page = data.page;
         vm.pageNumber = data.page.number + 1;
       },function(reason){
         vm.macheineList = null;
         Notification.error("获取SIM数据失败");
       });
     }

   // vm.query();




    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow();
    }

    //选中组织模型赋值
    $rootScope.$on('orgSelected', function (event, data) {
      vm.sim.deviceinfo.org = data;
    });

    //得到收入
    vm.queryRevenue = function() {

      var rspData = serviceResource.restCallService(REVENUE_URL, "GET");
      rspData.then(function(data) {


      //  alert(data[0].desc);

        for(var i=0;i<data.length;i++){
          console.log(i+" "+data[i].desc);
        }


        var monthes=new Array();
        var amounts=new Array();
        //根据月份升序排列
          var result=data.content.sort(function(a, b) { return a.desc > b.desc ? 1 : -1;} );//升序

        //var result=[{"incomeMonth":"1","amount":23}]
        for(var i=0;i<result.length;i++){
          //     console.log("new "+i+" "+result[i].incomeMonth);
          monthes[i]=result[i].desc;
          amounts[i]=result[i].amount;
        }

        //alert(monthes.length);
        //alert(amounts.length);
        //for(var i=0;i<amounts.length;i++){
        //    console.log("new "+i+" "+amounts[i]);
        //   }


        var rnd = []
        for (var i = 0; i < 10; i++) {
          rnd.push(Math.floor(Math.random() * 20) + 1)
        }
        vm.revenueLineChart.series.push({
          data: rnd
        })

      }, function(reason) {
        Notification.error("获取数据失败");
       // vm.deviceInfoList = null;
      });





    };

    vm.queryRevenue();

    vm.revenueLineChart = {
      // $('#revenueLineChart').highcharts({
      options: {
        chart: {
          type: 'line',
          height: 300
        },
        plotOptions: {
          line: {
            //dataLabels: {
            //    enabled: true
            //},
            enableMouseTracking: true
          },
          series: {
            cursor: 'pointer',
            events: {
              click: function(e) {

                console.log(e.point.category);
              //  vm.getCustomers();
                vm.$apply();
              }

              //click: function (e) {
              //    alert('Category: ' + e.point.category);
              //}
            }
          }
        }
      },
      title: {
        text: '最近12个月'
      },
      subtitle: {
        text: '收入汇总'
      },
      xAxis: {
      //  categories:monthes
        categories:[]
      },
      yAxis: {
        title: {
          text: '收入(W)'
        }

      },
      series: [{
        name: '收入',
         //    data: []
             data: [100.00, 50.00, 130.00, 160.00, 100.00, 70.00, 90.00, 145.00, 125.50, 100.01, 120.23,100.00, 50.00, 130.00, 160.00, 100.00, 70.00, 90.00, 145.00, 125.50, 100.01, 120.23,100.00, 50.00, 130.00, 160.00, 100.00, 70.00, 90.00, 145.00, 125.50, 100.01, 120.23]
        //data:amounts
      }]
      //    });
    };

  }
})();
