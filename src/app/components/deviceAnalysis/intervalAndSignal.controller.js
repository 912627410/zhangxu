/**
 * Created by xiaopeng on 17-7-31.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('intervalAndSignalController', intervalAndSignalController);

  /** @ngInject */
  function intervalAndSignalController($rootScope, $scope,NgTableParams, $uibModal, languages, DEVCE_MONITOR_SINGL_QUERY, $filter,ngTableDefaults,serviceResource,Notification,INTERVAL_SIGNAL_URL) {

    var vm = this;
    ngTableDefaults.settings.counts = [];

    // 默认查询昨天日报
    // 今天
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    var oneDay = 1000 * 60 * 60 * 24;
    // 昨天
    var yesterdayBegin = new Date(today - oneDay);
    var yesterdayEnd = new Date(today - oneDay);
    yesterdayEnd.setHours(23);
    yesterdayEnd.setMinutes(59);
    yesterdayEnd.setSeconds(59);
    yesterdayEnd.setMilliseconds(0);


    vm.queryDate = {
      startDate: yesterdayBegin,
      endDate: yesterdayEnd
    };

    vm.reset = function () {
      vm.queryDate = {
        startDate: yesterdayBegin,
        endDate: yesterdayEnd
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


    vm.myChart = echarts.init(document.getElementById('analysisChart'));
    vm.option = {
      title: {
        text: '上传频率与信号质量分布',
        // textAlign: 'center'
        left: 'center'
      },
      tooltip : {
        trigger: 'item'
      },
      toolbox: {
        right:140,
        feature: {
          dataView: {show: true, readOnly: false},
          magicType: {show: false, type: ['line', 'bar']},
          restore: {show: true},
          saveAsImage: {show: true},
          brush:{
            type: ['rect', 'polygon','clear']
          }
        }
      },
      brush: {},

      xAxis: {
        name: '信号质量',
        nameLocation: 'middle',
        nameGap: 30,
        max: 31,
        min: 0,
        type: 'value',
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      yAxis: {
        name: '上传频率(分钟)',
        nameLocation: 'middle',
        nameGap: 30,
        max: 10,
        min: 0,
        type: 'value',
        splitLine: {
          lineStyle: {
            color: '#7D9EC0'
          }
        }
      },

      series: [
        {
          zlevel: 1,
          type: 'scatter',
          symbolSize: 4,
          itemStyle :{
            normal: {
              color: '#104E8B'
            }
          },
          data: [],
          animationThreshold: 5000,
          progressiveThreshold: 5000
        }
      ],
      animationEasingUpdate: 'cubicInOut',
      animationDurationUpdate: 2000
    };

    vm.myChart.setOption(vm.option);

    //矩形选中事件
    vm.myChart.on('brushselected', renderBrushed);

    function renderBrushed(params) {
      var mainSeries = params.batch[0].selected[0];
      vm.selectdataList=[];
      for (var i = 0; i < mainSeries.dataIndex.length; i++) {
        var dataItem = vm.dataList[mainSeries.dataIndex[i]];
        vm.selectdataList.push({deviceNum: dataItem[2], signals: dataItem[0], interval:dataItem[1]});
      }

      vm.tableParams = new NgTableParams({
        count: 10
      }, {
        dataset: vm.selectdataList
      });
      $scope.$apply();
    }


    vm.query = function () {

      var restCallURL = INTERVAL_SIGNAL_URL;

      restCallURL += "?startDate=" + $filter('date')(vm.queryDate.startDate , 'yyyy-MM-dd HH:mm:ss');
      restCallURL += "&endDate=" + $filter('date')(vm.queryDate.endDate , 'yyyy-MM-dd HH:mm:ss');

      var rspData = serviceResource.restCallService(restCallURL, "QUERY");
      rspData.then(function (data) {
        vm.dataList = [];
        angular.forEach(data, function (item) {
          vm.dataList.push([$filter('number')(item.signal,3), $filter('number')(item.interval,3), item.deviceNum])
        });

        vm.option.series[0].data = vm.dataList;
        vm.myChart.setOption(vm.option);


      }, function (reason) {
        Notification.error("获取数据失败");
      });

    }


    //点击车号的超链接
    vm.currentInfo = function (deviceNum, size) {

      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=1001" + "&deviceNum=" + deviceNum;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          $rootScope.currentOpenModal = $uibModal.open({
            backdrop: false,
            templateUrl: 'app/components/deviceMonitor/devicecurrentinfo.html',
            controller: 'DeviceCurrentInfoController as deviceCurrentInfoCtrl',
            size: size,
            resolve: { //用来向controller传数据
              deviceinfo: function () {
                return data.content;
              }
            }
          });

        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
    };

    //detail
    vm.detail = function (deviceNum) {

      $rootScope.currentOpenModal = $uibModal.open({
        templateUrl: 'app/components/deviceAnalysis/deviceIntervalDetail.html',
        controller: 'deviceIntervalDetailController as deviceIntervalDetailCtrl',
        size: 'lg',
        backdrop: false,
        resolve: {

          deviceNum:function () {
            return deviceNum;
          },
          beginDate: vm.queryDate.startDate,
          endDate: vm.queryDate.endDate
        }
      });


    }


    vm.query();

  }
})();

