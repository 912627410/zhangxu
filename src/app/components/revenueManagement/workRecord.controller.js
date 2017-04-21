/**
 * Created by xiaopeng on 17-4-19.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('workRecordController', workRecordController);

  /** @ngInject */
  function workRecordController($rootScope,languages,$timeout,$uibModal,WORK_RECORD_URL ,$filter,treeFactory,NgTableParams, ngTableDefaults,Notification,simService,serviceResource,DEFAULT_SIZE_PER_PAGE,DRIVER_RECORD_URL,REVENUE_URL, FLEET_PAGE_URL) {

    var vm = this;
    ngTableDefaults.settings.counts = [];

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


    vm.initDate=function(){
      var date = new Date();
      date.setDate(date.getDate()-7);  //默认查询最近一个月的异常数据
      vm.startDate=date;
      vm.endDate=new Date();
    }

    vm.initDate();


    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.query = function(workRecord){
      var restCallURL = WORK_RECORD_URL + "?1=1";
      restCallURL += "&startDate="+$filter('date')(vm.startDate,'yyyy-MM-dd');
      restCallURL += "&endDate="+$filter('date')(vm.endDate,'yyyy-MM-dd');
      if(null!=workRecord){
        if(null!= workRecord.deviceNum){
          restCallURL += "&deviceNum=" +$filter('uppercase')(workRecord.deviceNum);
        }
        if(null!= workRecord.licenseId){
          restCallURL += "&licenseId=" +$filter('uppercase')(workRecord.licenseId);
        }
      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&fleetId=" + vm.org.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.workRecordList = data.content;
        vm.initChart(vm.workRecordList);
        vm.tableParams = new NgTableParams({
          count: 10
        }, {
          dataset: vm.workRecordList
        });

      }, function (reason) {
        Notification.error("获取车队记录数据失败");
      });
    };



    //重置查询框
    vm.reset = function () {
      vm.workRecord = null;
      vm.org=null;
      vm.initDate();

    }


    //得到收入
    vm.initChart = function(workRecords) {


        var recordDates=new Array();
        var records=new Array();

        var oilCost=new Array();
        var amounts=new Array();
        var profit=new Array();
        //根据月份升序排列
        var result = workRecords.sort(function(a, b) { return a.recordDate > b.recordDate ? 1 : -1;} );//升序

        for(var i=0;i<result.length;i++){

          recordDates[i]= $filter('date')(result[i].recordDate, 'yyyy-MM-dd');
          records[i]=result[i].records;

          // oilCost[i]=result[i].oilCost;
          // amounts[i]=result[i].amount;
          // profit[i]=result[i].profit;
        }


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
            text: '工作纪录'
          },
          subtitle: {
            text: ''
          },
          xAxis: {
            categories: recordDates,
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
            opposite: true,
            min: 0
          }],
          series: [{
            type: 'column',
            name: '收入',
            // data: []
            data:amounts
          },{
            type: 'column',
            name: '成本',
            data: oilCost
          },{
            type: 'spline',
            name: '利润',
            data: profit
          },{
            type: 'spline',
            yAxis: 1,
            name: '趟次',
            data: records
          }]
          //    });
        };


    };


    vm.info = function (workRecord) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/revenueManagement/workRecordDetail.html',
        controller: 'workRecordDetailController as workRecordDetailCtrl',
        size: 'super-lg',
        backdrop: false,
        resolve: {
          workRecord: workRecord
        }
      });


    }

    vm.query();


  }
})();
