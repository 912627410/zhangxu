/**
 * Created by xiaopeng on 17-8-1.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('deviceIntervalDetailController', deviceIntervalDetailController);

  /** @ngInject */

  function deviceIntervalDetailController($uibModalInstance,deviceNum, $filter, $timeout, serviceResource, Notification,DEVICE_ANALYSIS_URL,beginDate,endDate) {
    var vm = this;

    vm.deviceNum = deviceNum;

    vm.queryDate = {
      startDate: beginDate,
      endDate: endDate
    };

    vm.reset = function () {
      vm.queryDate = {
        startDate: beginDate,
        endDate: endDate
      };
    }


    //date picker
    vm.startDateOpenStatus = false;
    vm.endDateOpenStatus = false;

    vm.startDateOpen = function () {
      vm.startDateOpenStatus = true;
    };
    vm.endDateOpen = function () {
      vm.endDateOpenStatus = true;
    };

    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };


    vm.option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          crossStyle: {
            color: '#999'
          }
        }
      },
      toolbox: {
        feature: {
          dataView: {show: true, readOnly: false},
          magicType: {show: true, type: ['line', 'bar']},
          restore: {show: true},
          saveAsImage: {show: true}
        }
      },
      legend: {
        data:['上传频率','信号质量']
      },
      xAxis: {
        type: 'category',
        data: [],
        axisPointer: {
          type: 'shadow',
          label: {
            formatter :function (params) {
              // 假设此轴的 type 为 'time'。
              return 'some text' + echarts.format.formatTime(params.value);
            }
          }
        },
        axisLabel: {
          formatter : function (value, index) {
            var date = new Date(value);
            return $filter('date')(date, 'MM-dd HH');
          }
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '上传频率',
          min: 0,
          max: 15,
          axisLabel: {
            formatter: '{value} /分'
          }
        },
        {
          type: 'value',
          name: '信号质量',
          min: 0,
          max: 35,
          interval: 5,
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name:'上传频率',
          type:'bar',
          data:[]
        },
        {
          name:'信号质量',
          type:'line',
          yAxisIndex: 1,
          data:[]
        }
      ]
    };


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');

    }

    vm.query = function () {

      var restCallURL = DEVICE_ANALYSIS_URL  ;
      restCallURL += "?deviceNum=" + vm.deviceNum;
      restCallURL += "&startDate=" + $filter('date')(vm.queryDate.startDate , 'yyyy-MM-dd HH:mm:ss');
      restCallURL += "&endDate=" + $filter('date')(vm.queryDate.endDate , 'yyyy-MM-dd HH:mm:ss');

      var rspData = serviceResource.restCallService(restCallURL, "QUERY");
      rspData.then(function (datas) {


        angular.forEach(datas, function (data) {

          var signal = data.uploadTimes >0 ?  data.gsmSignals/data.uploadTimes : 0;
          var interval = data.uploadTimes >0 ?  data.totalDuration*3/data.uploadTimes : 0;

          vm.option.xAxis.data.push(new Date(data.recordTime));
          vm.option.series[0].data.push($filter('number')(interval,3));
          vm.option.series[1].data.push($filter('number')(signal,3));

          vm.myChart.setOption(vm.option);

        });


      }, function (reason) {
        Notification.error("获取数据失败");
      });
    }


    $timeout(function () {
      vm.myChart = echarts.init(document.getElementById('analysisDetailChart'));
      vm.myChart.setOption(vm.option);
      vm.query();

    },500);

  }
})();
