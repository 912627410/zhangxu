(function () {
  'use strict';

  angular
  .module('GPSCloud')
  .controller('speedAlarmController', speedAlarmController);

  /** @ngInject */
  function speedAlarmController($rootScope, $scope ,$filter, $window, treeFactory, Notification, serviceResource, MACHINE_TRANSPORTINFO_URL) {

    var vm = this;
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    vm.startDate = startDate;
    vm.endDate = new Date();

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

    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    vm.machineTransportList = [
      {
        deviceNum:"AAAAAA",
        licenseId:"123",
        locateDateTime:"2017-05-01",
        recordTime:"2017-05-01",
        address:"济南",
        amaplongitudeNum:"11",
        amaplatitudeNum:"22",
        engineRotateToEcu:"123",
        mph:"11",
        accStatus:"01"
      },{
        deviceNum:"BBBBBB",
        licenseId:"123",
        locateDateTime:"2017-05-01",
        recordTime:"2017-05-01",
        address:"济南",
        amaplongitudeNum:"11",
        amaplatitudeNum:"22",
        engineRotateToEcu:"123",
        mph:"11",
        accStatus:"10"
      }
    ];

    vm.query = function (startDate,endDate,machinelicenseId) {

      var restCallURL = MACHINE_TRANSPORTINFO_URL;

      if (null != startDate) {
        restCallURL += "&startDate=" + $filter('date')(startDate, 'yyyy-MM-dd');
      }

      if (null != endDate ) {
        restCallURL += "&endDate=" + $filter('date')(endDate, 'yyyy-MM-dd');
      }

      if(null!=machinelicenseId){
        restCallURL += "&machinelicenseId=" + machinelicenseId;
      }
      console.log(restCallURL);


      // var rspData = serviceResource.restCallService(restCallURL, "GET");
      // rspData.then(function (data) {
      //
      // }, function (reason) {
      //   Notification.error(reason.data.message);
      // });


    }

    vm.reset = function () {
      vm.startDateDeviceData
    };

    vm.reload = function () {
      var ws = new WebSocket("ws://192.168.8.190:8085/webSocketServer/overSpeed");

      ws.onopen = function () {
        ws.send(vm.operatorInfo.authtoken);
      };

      ws.onmessage = function (evt) {
        console.log(evt.data);
        vm.data = evt.data;
        $scope.$apply();
      };

      ws.onclose = function (evt) {
         console.log("WebSocketClosed!");
      };

      ws.onerror = function (evt) {
         console.log("WebSocketError!");
      };
    };


    vm.echartsInit = function (id) {
      var item = echarts.init(document.getElementById(id));
      return item;
    }

    var lineOption1 = {
      title: {
        text: '车辆运行状态信息',
        padding: [10, 20]
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'center',
        right: 20,
        itemGap: 30,
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        backgroundColor: 'rgba(219,219,216,0.8)',
        textStyle: {
          color: '#333333'
        }
      },
      grid: {
        left: '3%',
        right: 80,
        bottom: '3%',
        borderColor: '#e6e6e6',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        },
        data: ['5月1日','5月2日','5月3日']
      },
      yAxis: {
        name: '时速(km/h)',
        type: 'value',
        minInterval: 1,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        }
      },
      series: [
        {
          type: 'line',
          data:[12,24,21]
        }
      ]
    };

    vm.drawLineChart1 = function(){
      var linechart1 = vm.echartsInit('overSpeedingChart');
      linechart1.setOption(lineOption1);
    }

    vm.drawLineChart2 = function () {
      var linechart1 = vm.echartsInit('neutralGlide');
      linechart1.setOption(lineOption1);
    }

  }
})();
