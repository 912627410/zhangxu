/**
 * Created by shuangshan on 16/1/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceCurrentInfoController', DeviceCurrentInfoController);

  /** @ngInject */
  function DeviceCurrentInfoController($rootScope,$timeout,$uibModalInstance,serviceResource,TipService,DEVCE_DATA_PAGED_QUERY,deviceinfo) {
    var vm = this;
    var userInfo = $rootScope.userInfo;

    deviceinfo.produceDate = new Date(deviceinfo.produceDate);  //必须重新生成date object，否则页面报错
    vm.deviceinfo = deviceinfo;

    //气压图
    vm.highchartsAir = {
      options: {
        chart: {
          type: 'solidgauge'
        },

        title: '气压',
        exporting: { enabled: false },

        pane: {
          center: ['50%', '75%'],
          size: '140%',
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: true
        },

        // the value axis
        yAxis: {
          stops: [
            [0.2, '#DF5353'], // red
            [0.5, '#DDDF0D'], // yellow
            [0.8, '#55BF3B'] // green
          ],
          lineWidth: 0,
          minorTickInterval: null,
          tickPixelInterval: 400,
          tickWidth: 0,
          title: {
            y: 0,
            text: '气压'
          },
          labels: {
            y: 16
          },
          min: 0,
          max: 98,  //气压表最大98
        },
        credits: {
          enabled: false
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        }
      },
      title: '气压',
      series: [{
        name: '气压',
        data: [vm.deviceinfo.pressureMeter],
        dataLabels: {
          format: '<div style="text-align:center"><span style="font-size:25px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
          '<span style="font-size:12px;color:silver"></span></div>'
        },
        tooltip: {
          valueSuffix: null
        }
      }],

      loading: false,
      func: function(chart) {
        $timeout(function() {
          chart.reflow();
          //The below is an event that will trigger all instances of charts to reflow
          //$scope.$broadcast('highchartsng.reflow');
        }, 0);
      }
    };

    //转速图
    vm.highchartsRpm = {
      options: {
        chart: {
          type: 'gauge',
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },
        exporting: { enabled: false },
        pane: {
          startAngle: -150,
          endAngle: 150,
          background: [{
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, '#FFF'],
                [1, '#333']
              ]
            },
            borderWidth: 0,
            outerRadius: '109%'
          }, {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, '#333'],
                [1, '#FFF']
              ]
            },
            borderWidth: 1,
            outerRadius: '107%'
          }, {
            // default background
          }, {
            backgroundColor: '#DDD',
            borderWidth: 0,
            outerRadius: '105%',
            innerRadius: '103%'
          }]
        },

        tooltip: {
          enabled: true
        },

        yAxis: {
          min: 0,
          max: 3000,

          minorTickInterval: 'auto',
          minorTickWidth: 1,
          minorTickLength: 10,
          minorTickPosition: 'inside',
          minorTickColor: '#666',

          tickPixelInterval: 30,
          tickWidth: 2,
          tickPosition: 'inside',
          tickLength: 10,
          tickColor: '#666',
          labels: {
            step: 2,
            rotation: 'auto'
          },
          title: {
            text: '转速(r/min)'
          },
          plotBands: [{
            from: 0,
            to: 600,
            color: '#55BF3B' // green
          }, {
            from: 600,
            to: 2400,
            color: '#DDDF0D' // yellow
          }, {
            from: 2400,
            to: 3000,
            color: '#DF5353' // red
          }]
        },

        credits: {
          enabled: false
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        }
      },
      title: {
        text: null
      },
      series: [{
        name: '转速',
        data: [vm.deviceinfo.enginRotate * 0.125],
        tooltip: {
          valueSuffix: ' 转'
        }
      }],

      loading: false,
      func: function(chart) {
        $timeout(function() {
          chart.reflow();
          //The below is an event that will trigger all instances of charts to reflow
          //$scope.$broadcast('highchartsng.reflow');
        }, 0);
      }
    };


    //油位图
    vm.highchartsOil = {
      options: {
        chart: {
          type: 'solidgauge'
        },
        exporting: { enabled: false },
        title: '油位',

        pane: {
          center: ['50%', '75%'],
          size: '140%',
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: true
        },

        // the value axis
        yAxis: {
          stops: [
            [0.2, '#DF5353'], // red
            [0.5, '#DDDF0D'], // yellow
            [0.8, '#55BF3B'] // green
          ],
          lineWidth: 0,
          minorTickInterval: null,
          tickPixelInterval: 400,
          tickWidth: 0,
          title: {
            y: 0,
            text: '油位'
          },
          labels: {
            y: 16
          },
          min: 0,
          max: 98,  //气压表最大98
        },
        credits: {
          enabled: false
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        }
      },
      title: '油位',
      series: [{
        name: '油位',
        data: [vm.deviceinfo.oilLevel],
        dataLabels: {
          format: '<div style="text-align:center"><span style="font-size:25px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
          '<span style="font-size:12px;color:silver"></span></div>'
        },
        tooltip: {
          valueSuffix: null
        }
      }],

      loading: false,
      func: function(chart) {
        $timeout(function() {
          chart.reflow();
          //The below is an event that will trigger all instances of charts to reflow
          //$scope.$broadcast('highchartsng.reflow');
        }, 0);
      }
    };

    vm.refreshMapTab = function(deviceInfo){
      $timeout(function(){
        var deviceInfoList = new Array();
        deviceInfoList.push(deviceInfo);
        serviceResource.refreshMapWithDeviceInfo("deviceDetailMap",deviceInfoList);
      })
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };



    //历史数据tab
    var startDate = new Date();
    startDate.setDate(startDate.getDate()-5);
    vm.startDate = startDate;
    vm.endDate = new Date();

    vm.startDateDeviceData = startDate;
    vm.endDateDeviceData = new Date();

    //date picker
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.endDateOpenStatusDeviceData = {
      opened: false
    };

    vm.startDateOpenDeviceData = function($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.endDateOpenDeviceData = function($event) {
      vm.endDateOpenStatusDeviceData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    vm.getDeviceData = function(page,size,sort,deviceNum,startData,endDate){
      if (deviceNum){
        var filterTerm = "deviceNum=" + deviceNum;
      }
      if (startData){
        var startMonth = startDate.getMonth() +1;  //getMonth返回的是0-11
        var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
        if (filterTerm){
          filterTerm += "&startDate=" + startDateFormated
        }
        else{
          filterTerm += "startDate=" + startDateFormated;
        }
      }
      if (endDate){
        var endMonth = endDate.getMonth() +1;  //getMonth返回的是0-11
        var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
        if (filterTerm){
          filterTerm += "&endDate=" + endDateFormated;
        }
        else{
          filterTerm += "endDate=" + endDateFormated;
        }
      }
      var deviceDataPromis = serviceResource.queryDeviceData(page, size, sort, filterTerm);
      deviceDataPromis.then(function (data) {
          vm.deviceDataList = data.content;
          vm.page = data.page;
          vm.deviceData_pagenumber = data.page.number + 1;
          vm.basePath = DEVCE_DATA_PAGED_QUERY;

          vm.deviceDataList.forEach(function (deviceData) {
            var lnglatXY = [parseFloat(deviceData.longitudeNum), parseFloat(deviceData.latitudeNum)];
            serviceResource.getAddressFromXY(lnglatXY, function (newaddress) {
              deviceData.address = newaddress;
            })
          })
        }, function (reason) {
          TipService.setMessage('获取设备信息失败', 'error');
        }
      )

    }

  }
})();
