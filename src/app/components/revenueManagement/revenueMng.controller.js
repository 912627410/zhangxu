
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('revenueMngController', revenueMngController);

  /** @ngInject */
  function revenueMngController($rootScope,$scope,$timeout,$uibModal,$filter ,treeFactory,NgTableParams, ngTableDefaults,Notification,simService,serviceResource,DEFAULT_SIZE_PER_PAGE,SIM_STATUS_URL,REVENUE_URL, FLEET_PAGE_URL) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化查询参数
    vm.fleetRecord={

    };

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    vm.buildQueryUrl=function(URL,fleetRecord){
      var restCallURL = URL+"?1=1";

      if (null != fleetRecord) {
        if (null != fleetRecord.deviceNum&&fleetRecord.deviceNum!="") {
          restCallURL += "search_deviceNum=" +$filter('uppercase')(fleetRecord.deviceNum);
        }
        if (null != fleetRecord.licenseId&&fleetRecord.licenseId!="") {
          restCallURL += "&search_licenseId=" + fleetRecord.licenseId;
        }
      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&search_orgId=" + vm.org.id;
      }

      //console.log(vm.startDate);
      //console.log($filter('date')(vm.startDate,'yyyy-MM-dd'));
      //console.log(vm.endDate);
      restCallURL+="&search_startDate="+$filter('date')(vm.startDate,'yyyy-MM-dd');
      restCallURL+="&search_endDate="+$filter('date')(vm.endDate,'yyyy-MM-dd');

      return restCallURL;
    }

    vm.buildQueryUrl2=function(URL,fleetRecord){
      var restCallURL = URL+"?1=1";

      if (null != fleetRecord) {
        if (null != fleetRecord.deviceNum&&fleetRecord.deviceNum!="") {
          restCallURL += "search_LIKE_machineEntity.deviceinfo.deviceNum=" +$filter('uppercase')(fleetRecord.deviceNum);
        }
        if (null != fleetRecord.licenseId&&fleetRecord.licenseId!="") {
          restCallURL += "&search_LIKE_machineEntity.licenseId=" + fleetRecord.licenseId;
        }
      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
      }

      //console.log(vm.startDate);
      //console.log($filter('date')(vm.startDate,'yyyy-MM-dd'));
      //console.log(vm.endDate);
      restCallURL+="&search_DGTE_endDate="+$filter('date')(vm.startDate,'yyyy-MM-dd');
      restCallURL+="&search_DLTE_endDate="+$filter('date')(vm.endDate,'yyyy-MM-dd');

      return restCallURL;
    }

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


    vm.initDate=function(){
      var date = new Date();
      date.setDate(date.getDate()-30);  //默认查询最近一个月的异常数据
      vm.startDate=date;
      vm.endDate=new Date();
    }



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






    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.query = function(page,size,sort,fleetRecord){

      var restCallURL=vm.buildQueryUrl2(FLEET_PAGE_URL,fleetRecord);

      var pageUrl = page || 0;
      var sizeUrl = size || 10;
      var sortUrl = sort || "endDate";
      restCallURL += "&page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;


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

    vm.initDate();


    //重置查询框
    vm.reset = function () {
      vm.fleetRecord = null;
      vm.org=null;
      vm.initDate();

    }


    //得到收入
    vm.queryRevenue = function(fleetRecord) {

      var restCallURL=vm.buildQueryUrl(REVENUE_URL,fleetRecord);


      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function(data) {


      //  alert(data[0].desc);

        for(var i=0;i<data.length;i++){
          console.log(i+" "+data[i].desc);
        }


        var monthes=new Array();
        var oilCost=new Array();
        var amounts=new Array();
        var profit=new Array();
        var times=new Array();
        //根据月份升序排列
          var result=data.content.sort(function(a, b) { return a.desc > b.desc ? 1 : -1;} );//升序

        //var result=[{"incomeMonth":"1","amount":23}]
        for(var i=0;i<result.length;i++){
          //     console.log("new "+i+" "+result[i].incomeMonth);
          monthes[i]=result[i].desc;
          oilCost[i]=result[i].oilCost;
          amounts[i]=result[i].amount;
          profit[i]=result[i].profit;
          times[i]=result[i].times;
        }

        //alert(monthes.length);
        //alert(amounts.length);
        //for(var i=0;i<amounts.length;i++){
        //    console.log("new "+i+" "+amounts[i]);
        //   }


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

                    // console.log(e.point.category);
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
            text: '收入汇总'
          },
          subtitle: {
            text: ''
          },
          xAxis: {
             categories:monthes
            //categories:[]
          },
          yAxis: [{
            title: {
              text: '收入'
            }
          },{
            title: {
              text: '趟数'
            },
            opposite: true
          }],
          series: [{
             type: 'column',
             name: '收入',
           // data: []
            //     data: [100.00, 50.00, 130.00, 160.00, 100.00, 70.00, 90.00, 145.00, 125.50, 100.01, 120.23,100.00, 50.00, 130.00, 160.00, 100.00, 70.00, 90.00, 145.00, 125.50, 100.01, 120.23,100.00, 50.00, 130.00, 160.00, 100.00, 70.00, 90.00, 145.00, 125.50, 100.01, 120.23]
            data:amounts
          },{
            type: 'column',
            name: '成本',
            data: oilCost
          },{
            type: 'spline',
            name: '利润',
            data: profit
          }, {
            type: 'spline',
            yAxis: 1,
            name: '趟次',
            data: times
          }]
          //    });
        };

      }, function(reason) {
        Notification.error("获取数据失败");
       // vm.deviceInfoList = null;
      });





    };

    vm.selectQuery=function(fleetRecord){
      vm.queryRevenue(fleetRecord);
      vm.query(0,10,null,fleetRecord);
    }


    vm.selectQuery(null);



  }
})();
