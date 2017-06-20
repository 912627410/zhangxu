/**
 * Created by xiaopeng on 17-4-19.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('workRecordController', workRecordController);

  /** @ngInject */
  function workRecordController($rootScope,languages,$timeout,$uibModal,WORK_RECORD_URL ,$filter,treeFactory,NgTableParams, ngTableDefaults,Notification,simService,serviceResource) {

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


    //工作记录图表
    vm.initChart = function(workRecords) {
        var recordDates=[];  // 时间
        var totalRecords=[];  // 总趟数
        var averageRecords=[]; // 平均趟数
        var recordArr=[];
        var mileageArr=[];
        var machineNum = []; // 活跃车数
        var totalMileage = []; // 总里程数
        //根据月份升序排列
        var result = workRecords.sort(function(a, b) { return a.recordDate > b.recordDate ? 1 : -1;} );//升序
        var resultLen = result.length;
        if(resultLen > 0) {
          for (var i = 1; i < resultLen; i++) {
            if (result[i].recordDate != result[i - 1].recordDate) {
              recordDates.push($filter('date')(result[i - 1].recordDate, 'yyyy-MM-dd'));
              recordArr.push(result[i - 1].records);
              mileageArr.push(result[i - 1].mileage);
              totalMileage.push(parseFloat(eval(mileageArr.join("+")).toFixed(2)));
              var sum = eval(recordArr.join("+"));
              totalRecords.push(sum);
              averageRecords.push(Math.round((sum / recordArr.length) * 100) / 100);
              machineNum.push(recordArr.length);
              recordArr = [];
              mileageArr = [];
              if (i == resultLen - 1) {
                recordDates.push($filter('date')(result[i].recordDate, 'yyyy-MM-dd'));
                totalRecords.push(result[i].records);
                averageRecords.push(result[i].records);
                totalMileage.push(parseFloat(eval(mileageArr.join("+")).toFixed(2)));
              }
            } else {
              recordArr.push(result[i - 1].records);
              mileageArr.push(result[i - 1].mileage);
              if (i == resultLen - 1) {
                recordDates.push($filter('date')(result[i].recordDate, 'yyyy-MM-dd'));
                recordArr.push(result[i].records);
                mileageArr.push(result[i].mileage);
                totalMileage.push(parseFloat(eval(mileageArr.join("+")).toFixed(2)));
                var sum = eval(recordArr.join("+"));
                totalRecords.push(sum);
                averageRecords.push(Math.round((sum / recordArr.length) * 100) / 100);
                machineNum.push(recordArr.length);
              }
            }
          }
        }


        vm.revenueLineChart = {
          options: {
            chart: {
              type: 'line',
              height: 300
            },
            plotOptions: {
              line: {
                enableMouseTracking: true
              },
              series: {
                cursor: 'pointer',
                events: {
                  click: function(e) {
                    vm.$apply();
                  }
                }
              }
            }
          },
          credits: {
            enabled:false
          },
          title: {
            text: '工作纪录'
          },
          subtitle: {
            text: ''
          },
          xAxis: {
            categories: recordDates
          },
          yAxis: [{
            title: {
              text: '总趟数',
              style: {
                color: 'rgb(124, 181, 236)',
                fontWeight: 'bold',
                fontSize: '14px'
              }
            }

          },{
            title: {
              text: '平均趟数',
              style: {
                color: 'rgb(194, 53, 49)',
                fontWeight: 'bold',
                fontSize: '14px'
              }
            },
            opposite: true,
            min: 0
          }],
          series: [{
            type: 'column',
            color: 'rgb(124, 181, 236)',
            name: '<b style="font-size: 14px;">总趟数</b>',
            data: totalRecords
          },{
            type: 'spline',
            color: 'rgb(194, 53, 49)',
            yAxis: 1,
            name: '<b style="font-size: 14px;">平均趟数</b>',
            data: averageRecords
          }]
        };


      vm.totalMachineChart = {
        options: {
          chart: {
            type: 'line',
            height: 300
          },
          plotOptions: {
            line: {
              enableMouseTracking: true
            },
            series: {
              cursor: 'pointer',
              events: {
                click: function(e) {
                  vm.$apply();
                }
              }
            }
          }
        },
        credits: {
          enabled:false
        },
        title: {
          text: ' '
        },
        subtitle: {
          text: ''
        },
        xAxis: {
          categories: recordDates
        },
        yAxis: [{
          tickInterval: 5,
          min: 0,
          title: {
            text: '活跃车数(辆)',
            style: {
              color: 'rgb(124, 181, 236)',
              fontWeight: 'bold',
              fontSize: '14px'
            }
          }

        },{
          title: {
            text: '总里程数(KM)',
            style: {
              color: 'rgb(194, 53, 49)',
              fontWeight: 'bold',
              fontSize: '14px'
            }
          },
          opposite: true,
          min: 0
        }],
        series: [{
          type: 'column',
          color: 'rgb(194, 53, 49)',
          yAxis: 1,
          name: '<b style="font-size: 14px;">总里程数</b>',
          data: totalMileage
        },{
          type: 'spline',
          color: 'rgb(124, 181, 236)',
          name: '<b style="font-size: 14px;">活跃车数</b>',
          data: machineNum
        }]
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
