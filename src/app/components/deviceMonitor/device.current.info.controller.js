/**
 * Created by shuangshan on 16/1/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceCurrentInfoController', DeviceCurrentInfoController);

  /** @ngInject */
  function DeviceCurrentInfoController($rootScope,$scope,$timeout,$filter,$uibModalInstance,serviceResource,Notification,
                                       DEVCE_DATA_PAGED_QUERY,DEVCE_WARNING_DATA_PAGED_QUERY,AMAP_QUERY_TIMEOUT_MS,
                                       AMAP_GEO_CODER_URL,deviceinfo) {
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
        data: [vm.deviceinfo.enginRotate],
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

    //这里的延时是因为从高德查询当前位置是异步返回的,如果不延时页面就无法加载正常的数据,延时时间根据网速调整
    vm.refreshDOM = function() {
      setTimeout(function(){
        vm.setDefaultAddress();
        $scope.$apply();
      }, AMAP_QUERY_TIMEOUT_MS);
    };

    vm.setDefaultAddress = function(){
      if (vm.deviceDataList != null){
        vm.deviceDataList.forEach(function (deviceData) {
          if (deviceData.address === '正在请求定位数据...'){
            deviceData.address = '--';
          }
        })
      }
    }

    vm.getDeviceData = function(page,size,sort,deviceNum,startDate,endDate){
      if (deviceNum){
        var filterTerm = "deviceNum=" + deviceNum;
      }
      if (startDate){
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
          vm.deviceDataPage = data.page;
          vm.deviceDataPageNumber = data.page.number + 1;
          vm.deviceDataBasePath = DEVCE_DATA_PAGED_QUERY;
          if (vm.deviceDataList.length == 0){
            Notification.warning('没有该设备此时间段内的历史数据信息,请重新选择');
          }
        }, function (reason) {
          Notification.error('获取该设备历史数据失败');
        }
      )
      vm.refreshDOM();
    }


    //报警数据tab
    vm.startDateDeviceWarningData = startDate;
    vm.endDateDeviceWarningData = new Date();

    //date picker
    vm.startDateOpenStatusDeviceWarningData = {
      opened: false
    };
    vm.endDateOpenStatusDeviceWarningData = {
      opened: false
    };

    vm.startDateOpenDeviceWarningData = function($event) {
      vm.startDateOpenStatusDeviceWarningData.opened = true;
    };
    vm.endDateOpenDeviceWarningData = function($event) {
      vm.endDateOpenStatusDeviceWarningData.opened = true;
    };

    vm.getDeviceWarningData = function(page,size,sort,deviceNum,startDate,endDate){
      if (deviceNum){
        var filterTerm = "deviceNum=" + $filter('uppercase')(deviceNum);
      }
      if (startDate){
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
      var deviceWarningDataPromis = serviceResource.queryDeviceWarningData(page, size, sort, filterTerm);
      deviceWarningDataPromis.then(function (data) {
          vm.deviceWarningDataList = data.content;
          vm.deviceWarningDataPage = data.page;
          vm.deviceWarningDataPageNumber = data.page.number + 1;
          vm.deviceWarningDataBasePath = DEVCE_WARNING_DATA_PAGED_QUERY;
          if (vm.deviceWarningDataList.length == 0){
            Notification.warning('没有该设备此时间段内的报警信息,请重新选择');
          }
          else{
            vm.deviceWarningDataList.forEach(function (deviceWarningData) {
              deviceWarningData.warningMsg = serviceResource.getWarningMsg(deviceWarningData);
            })
          }
        }, function (reason) {
          Notification.error('获取该设备报警信息失败');
        }
      )
    }



    //地图tab,请求该设备一段时间内的数据用于绘制轨迹

    //默认显示当前设备的最新地址
    vm.initMapTab = function(deviceInfo){
      $timeout(function(){
        var deviceInfoList = new Array();
        deviceInfoList.push(deviceInfo);
        var centerAddr = [deviceInfo.longitudeNum,deviceInfo.latitudeNum];
        serviceResource.refreshMapWithDeviceInfo("deviceDetailMap",deviceInfoList,8,centerAddr);
      })
    };

    vm.startDateMapData = startDate;
    vm.endDateMapData = new Date();

    //date picker
    vm.startDateOpenStatusMapData = {
      opened: false
    };
    vm.endDateOpenStatusMapData = {
      opened: false
    };

    vm.startDateOpenMapData = function($event) {
      vm.startDateOpenStatusMapData.opened = true;
    };
    vm.endDateOpenMapData = function($event) {
      vm.endDateOpenStatusMapData.opened = true;
    };

    //参数: 地图轨迹gps 数据
    vm.refreshMapTab = function(lineAttr){
      $timeout(function(){
        $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
          var marker, lineArr = [];
          if (lineAttr){
            lineArr = lineAttr;
          }
          var map = new AMap.Map("deviceDetailMap", {
            resizeEnable: true,
            //center: [116.397428, 39.90923],
            zoom: 17
          });
          map.on("complete", completeEventHandler);
          AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
            marker.moveAlong(lineArr, 500);
          }, false);
          AMap.event.addDomListener(document.getElementById('stop'), 'click', function () {
            marker.stopMove();
          }, false);
          var carPostion = [116.397428, 39.90923];   //默认地点
          if (lineArr.length > 0){
            carPostion = lineArr[0];
          }
          // 地图图块加载完毕后执行函数
          function completeEventHandler() {
            marker = new AMap.Marker({
              map: map,
              position: carPostion,
              //icon: "http://code.mapabc.com/images/car_03.png",
              icon: "assets/images/car_03.png",
              offset: new AMap.Pixel(-26, -13),
              autoRotation: true
            });
            // 绘制轨迹
            var polyline = new AMap.Polyline({
              map: map,
              path: lineArr,
              strokeColor: "#00A",  //线颜色
              strokeOpacity: 1,     //线透明度
              strokeWeight: 3,      //线宽
              strokeStyle: "solid"  //线样式
            });
            map.setFitView();
          }
        })
      })
    };


    vm.getDeviceMapData = function(page,size,sort,deviceNum,startDate,endDate){
      if (deviceNum){
        var filterTerm = "deviceNum=" + $filter('uppercase')(deviceNum);
      }
      if (startDate){
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
      var lineArr = [];
      var deviceDataPromis = serviceResource.queryDeviceSimpleData(page, size, sort, filterTerm);
      deviceDataPromis.then(function (data) {
          var deviceMapDataList = data.content;
          if (deviceMapDataList.length == 0){
            Notification.warning('没有该设备此时间段内的历史数据信息,请重新选择');
          }
          else{
            vm.deviceMapDataList = _.sortBy(deviceMapDataList,"locateDateTime");
            vm.deviceMapDataList.forEach(function (deviceData) {
              lineArr.push([deviceData.longitudeNum,deviceData.latitudeNum]);
            })
            vm.refreshMapTab(lineArr);
          }
        }, function (reason) {
          Notification.error('获取该设备历史数据失败');
        }
      )
    }

  }
})();
