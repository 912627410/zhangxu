/**
 * Created by shuangshan on 16/1/10.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceCurrentInfoController', DeviceCurrentInfoController);

  /** @ngInject */
  function DeviceCurrentInfoController($rootScope, $window, $scope, $timeout, $interval, $http, $uibModal, $confirm, $filter, $uibModalInstance, permissions, languages, serviceResource, Notification,
                                       DEVCE_MONITOR_SINGL_QUERY, DEVCE_DATA_PAGED_QUERY, DEVCE_WARNING_DATA_PAGED_QUERY, AMAP_QUERY_TIMEOUT_MS,
                                       AMAP_GEO_CODER_URL, DEIVCIE_UNLOCK_FACTOR_URL, GET_ACTIVE_SMS_URL, SEND_ACTIVE_SMS_URL,
                                       VIEW_BIND_INPUT_MSG_URL, VIEW_UN_BIND_INPUT_MSG_URL, VIEW_LOCK_INPUT_MSG_URL, VIEW_UN_LOCK_INPUT_MSG_URL,
                                       VIEW_CANCEL_LOCK_INPUT_MSG_URL, GET_UN_ACTIVE_LOCK_SMS_URL, SEND_UN_ACTIVE_LOCK_SMS_URL,
                                       GET_LOCK_SMS_URL, SEND_LOCK_SMS_URL, GET_UN_LOCK_SMS_URL, SEND_UN_LOCK_SMS_URL,
                                       GET_SET_IP_SMS_URL, SEND_SET_IP_SMS_URL, GET_SET_START_TIMES_SMS_URL, SEND_SET_START_TIMES_SMS_URL,
                                       GET_SET_WORK_HOURS_SMS_URL, SEND_SET_WORK_HOURS_SMS_URL, GET_SET_INTER_SMS_URL, SEND_SET_INTER_SMS_URL, INFLUXDB, deviceinfo) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    vm.sensorItem = {};
    $scope.myInterval = 5000;//轮播间隔
    $scope.noWrapSlides = false;// 是否轮播 默认false
    $scope.noTransition = false;// 是否有过场动画 默认false
    $scope.notices = [];


    //刷新当前页面
    vm.refreshCurrentDeviceInfo = function (id) {
      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {

          vm.controllerInitialization(data.content);

          if (vm.highchartsAir != null) {

            vm.highchartsAir.series[0].data = [vm.deviceinfo.pressureMeter];
          }
          if (vm.highchartsWater != null) {

            vm.highchartsWater.series[0].data = [vm.deviceinfo.engineTemperature];
          }
          if (vm.highchartsRpm != null) {

            vm.highchartsRpm.series[0].data = [vm.deviceinfo.enginRotate];
          }
          if (vm.highchartsOil != null) {

            vm.highchartsOil.series[0].data = [vm.deviceinfo.oilLevel];
          }


        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
    }

    //初始化controller
    vm.controllerInitialization = function (deviceinfo) {
      vm.deviceinfo = deviceinfo;

      // 页面打开后根据初始化查询的结果判断是否写入消息
      if (vm.deviceinfo.maintainNoticeNum != null && vm.deviceinfo.maintainNoticeNum > 0) {
        //存在保养提醒
        var maintainNotice = {
          title: '该设备需要保养',
          url: "app/components/deviceMonitor/maintainNotice.html",
          controller: "maintainNoticeController as maintainNoticeCtrl"

        }
        $scope.notices.push(maintainNotice);
      }

      // 查询系统参数中的设定值，deviceinfo中的时间减去当前时间大于设定值则生成提醒
      if ($rootScope.SYSCONFIG) {
        vm.sysconfig = $rootScope.SYSCONFIG;
        for (var i = 0; i < vm.sysconfig.length; i++) {
          if (vm.sysconfig[i].name == "LONG_TIME_NO_DATA") {
            vm.longTimeNoData = vm.sysconfig[i].value;
          }
        }
        var currentTime = new Date();
        if (vm.deviceinfo.lastDataUploadTime != null && (currentTime - vm.deviceinfo.lastDataUploadTime) > vm.longTimeNoData * 24 * 3600 * 1000) {

          var longTime = Math.floor((currentTime - vm.deviceinfo.lastDataUploadTime) / 24 / 3600 / 1000);
          //存在长时间未上传数据提醒
          var longTimeNoDataNotice = {
            title: "该设备超过" + longTime + "天未上传数据",
            url: null,
            controller: null
          }
          $scope.notices.push(longTimeNoDataNotice);
        }
      }

      vm.deviceinfo.produceDate = new Date(deviceinfo.produceDate);  //必须重新生成date object，否则页面报错
      //因无指示灯图标，alertStatus暂时显示为16进制，后续调整
      vm.deviceinfo.alertStatus = parseInt(vm.deviceinfo.alertStatus, 2);
      vm.deviceinfo.alertStatus = vm.deviceinfo.alertStatus.toString(16);
      vm.deviceinfo.alertStatus = vm.deviceinfo.alertStatus.toString(16).toUpperCase();
      /*
       中央报警灯   指的就是三角报警灯
       另：1、当转速小于500转时，充电指示灯和机油压力指示灯亮时，三角报警灯也不亮
       2、当转速大于500转时，充电指示灯和机油压力指示灯亮时，三角报警灯亮
       3、当转速小于1000转时，手制动指示灯亮时，三角报警灯也不亮
       4、当转速大于1000转时，手制动指示灯亮时，三角报警灯亮
       */
      //转速
      vm.enginRotate = vm.deviceinfo.enginRotate;
      //充电指示灯
      vm.charge = vm.deviceinfo.ledStatus.substring(0, 1);
      //中央报警
      vm.centerCode = '0';
      //机油压力指示灯
      vm.engineOilPressure = vm.deviceinfo.ledStatus.substring(28, 29);
      //制动指示灯
      vm.parkingBrake = vm.deviceinfo.ledStatus.substring(6, 7);

      if (vm.enginRotate > 500 && vm.charge == "1" && vm.engineOilPressure == "1") {
        vm.centerCode = '1';
      }
      if (vm.enginRotate > 1000 && vm.parkingBrake == "1") {
        vm.centerCode = '1';
      }

      //根据中挖协议修改
      if (vm.deviceinfo.voltageHigthAlarmValue != 0) {
        vm.deviceinfo.voltageHigthAlarmValue = vm.deviceinfo.voltageHigthAlarmValue * 0.1 + 10;
      }
      if (vm.deviceinfo.voltageLowAlarmValue != 0) {
        vm.deviceinfo.voltageLowAlarmValue = vm.deviceinfo.voltageLowAlarmValue * 0.1 + 10;
      }
      //改为过滤器
      //vm.deviceinfo.totalDuration = serviceResource.convertToMins(vm.deviceinfo.totalDuration);
      //vm.deviceinfo.realtimeDuration = serviceResource.convertToMins(vm.deviceinfo.realtimeDuration);
      vm.deviceinfo.engineTemperature = parseInt(vm.deviceinfo.engineTemperature); //
      //TODO 原来根据车架号判断，由于增加了临沃的车，需要根据deviceNum来判断当前设备是否是小挖,装载机，矿车
      //如果车架号不为空就根据车架号来判断车辆类型,判断出来不为小挖返回null，再根据vserionNum判断
      if (deviceinfo.machine == null || null == deviceinfo.machine.licenseId) {
        vm.DeviceType = null;
      } else {
        vm.DeviceType = serviceResource.getDeviceType(deviceinfo.machine.licenseId);
      }
      //如果上面没有判断出来，versionNum也不为空，就根据deviceNum来判断车辆类型
      if (vm.DeviceType == null) {
        if (deviceinfo.versionNum != null) {
          vm.DeviceType = serviceResource.getDeviceTypeForVersionNum(deviceinfo.versionNum, deviceinfo.deviceType);
        } else {
          vm.DeviceType = serviceResource.getDeviceType(null);
        }
      }

    }

    vm.controllerInitialization(deviceinfo);

    //保养提醒modal
    vm.openNotification = function (deviceinfo, notice, size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: notice.url,
        controller: notice.controller,
        size: size,
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return vm.deviceinfo;
          }
        }
      });
    }
    //气压图
    vm.highchartsAir = {
      options: {
        chart: {
          type: 'solidgauge'
        },

        title: languages.findKey('barometricPressure') + '',
        exporting: {enabled: false},

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
            text: languages.findKey('barometricPressure') + ''
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
      title: languages.findKey('barometricPressure') + '',
      series: [{
        name: languages.findKey('barometricPressure') + '',
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
      func: function (chart) {
        $timeout(function () {
          chart.reflow();
          //The below is an event that will trigger all instances of charts to reflow
          //$scope.$broadcast('highchartsng.reflow');
        }, 0);
      }
    };

    //水温图
    vm.highchartsWater = {
      options: {
        chart: {
          type: 'solidgauge'
        },

        title: languages.findKey('waterTemperature') + '',
        exporting: {enabled: false},

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
            [0.2, '#55BF3B'], // green
            [0.6, '#DDDF0D'], // yellow
            [0.8, '#DF5353'] // red
          ],
          lineWidth: 0,
          minorTickInterval: null,
          tickPixelInterval: 400,
          tickWidth: 0,
          title: {
            y: 0,
            text: languages.findKey('waterTemperature') + ''
          },
          labels: {
            y: 16
          },
          min: 40,
          max: 140,  //水温表最大140
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
      title: languages.findKey('waterTemperature') + '',
      series: [{
        name: languages.findKey('waterTemperature') + '',
        data: [vm.deviceinfo.engineTemperature],
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
      func: function (chart) {
        $timeout(function () {
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
        exporting: {enabled: false},
        pane: {
          startAngle: -150,
          endAngle: 150,
          background: [{
            backgroundColor: {
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, '#FFF'],
                [1, '#333']
              ]
            },
            borderWidth: 0,
            outerRadius: '109%'
          }, {
            backgroundColor: {
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
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
            text: languages.findKey('rotatingSpeed') + '(r/min)'
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
        name: languages.findKey('rotatingSpeed') + '',
        data: [vm.deviceinfo.enginRotate],
        tooltip: {
          valueSuffix: languages.findKey('turn') + ''
        }
      }],

      loading: false,
      func: function (chart) {
        $timeout(function () {
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
        exporting: {enabled: false},
        title: languages.findKey('Oil') + '',

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
            text: languages.findKey('Oil') + ''
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
      title: languages.findKey('Oil') + '',
      series: [{
        name: languages.findKey('Oil') + '',
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
      func: function (chart) {
        $timeout(function () {
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
    startDate.setDate(startDate.getDate() - 5);
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

    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.endDateOpenDeviceData = function ($event) {
      vm.endDateOpenStatusDeviceData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    //这里的延时是因为从高德查询当前位置是异步返回的,如果不延时页面就无法加载正常的数据,延时时间根据网速调整
    //现在废弃
    vm.refreshDOM = function () {
      setTimeout(function () {
        vm.setDefaultAddress();
        $scope.$apply();
      }, AMAP_QUERY_TIMEOUT_MS);
    };

    vm.setDefaultAddress = function () {
      if (vm.deviceDataList != null) {
        vm.deviceDataList.forEach(function (deviceData) {
          if (deviceData.address === languages.findKey('requestingLocationData') + '...') {
            deviceData.address = '--';
          }
        })
      }
    }

    vm.getDeviceData = function (page, size, sort, deviceNum, startDate, endDate) {
      if (deviceNum) {
        var filterTerm = "deviceNum=" + deviceNum;
      }
      if (startDate) {
        var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
        var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
        if (filterTerm) {
          filterTerm += "&startDate=" + startDateFormated
        }
        else {
          filterTerm += "startDate=" + startDateFormated;
        }
      }
      if (endDate) {
        var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
        var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
        if (filterTerm) {
          filterTerm += "&endDate=" + endDateFormated;
        }
        else {
          filterTerm += "endDate=" + endDateFormated;
        }
      }
      var deviceDataPromis = serviceResource.queryDeviceData(page, size, sort, filterTerm);
      deviceDataPromis.then(function (data) {
          vm.deviceDataList = data.content;
          vm.deviceDataPage = data.page;
          vm.deviceDataPageNumber = data.page.number + 1;
          vm.deviceDataBasePath = DEVCE_DATA_PAGED_QUERY;
          angular.forEach(vm.deviceDataList, function (data) {
            //因无指示灯图标，alertStatus暂时显示为16进制，后续调整
            data.alertStatus = parseInt(data.alertStatus, 2);
            data.alertStatus = data.alertStatus.toString(16).toUpperCase();
            data.ecuLockStatusDesc = '';
            if (data.ecuLockStatus.substr(7, 1) == "0") {
              data.ecuLockStatusDesc += "未激活";
            }
            else {
              data.ecuLockStatusDesc += "已激活";
            }
            if (data.voltageHigthAlarmValue != 0) {
              data.voltageHigthAlarmValue = data.voltageHigthAlarmValue * 0.1 + 10;
            }
            if (data.voltageLowAlarmValue != 0) {
              data.voltageLowAlarmValue = data.voltageLowAlarmValue * 0.1 + 10;
            }
          });
          if (vm.deviceDataList.length == 0) {
            Notification.warning(languages.findKey('deviceIsNotHistoricalDataForThisTimePeriodPleaseReselect'));
          }
        }, function (reason) {
          Notification.error(languages.findKey('historicalDataAcquisitionDeviceFailure'));
        }
      )
      //vm.refreshDOM();
    }


    //监控
    vm.currentInfo = function (data, size) {
      vm.deviceinfoMonitor = data;
      $rootScope.currentOpenModal = $uibModal.open({
        animation: vm.animationsEnabled,
        backdrop: false,
        templateUrl: 'app/components/deviceMonitor/devicecurrentinfodetails.html',
        controller: 'DeviceCurrentInfoDetailsController as deviceCurrentInfoDetailsCtrl',
        size: size,
        resolve: { //用来向controller传数据
          deviceinfo: function () {
            return vm.deviceinfoMonitor;
          }
        }
      });
    };


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

    vm.startDateOpenDeviceWarningData = function ($event) {
      vm.startDateOpenStatusDeviceWarningData.opened = true;
    };
    vm.endDateOpenDeviceWarningData = function ($event) {
      vm.endDateOpenStatusDeviceWarningData.opened = true;
    };


    vm.getDeviceWarningData = function (page, size, sort, deviceNum, startDate, endDate) {
      if (deviceNum) {
        var filterTerm = "deviceNum=" + $filter('uppercase')(deviceNum);
      }
      if (startDate) {
        var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
        var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
        if (filterTerm) {
          filterTerm += "&startDate=" + startDateFormated
        }
        else {
          filterTerm += "startDate=" + startDateFormated;
        }
      }
      if (endDate) {
        var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
        var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
        if (filterTerm) {
          filterTerm += "&endDate=" + endDateFormated;
        }
        else {
          filterTerm += "endDate=" + endDateFormated;
        }
      }
      var deviceWarningDataPromis = serviceResource.queryDeviceWarningData(page, size, sort, filterTerm);
      deviceWarningDataPromis.then(function (data) {
          vm.deviceWarningDataList = data.content;
          vm.deviceWarningDataPage = data.page;
          vm.deviceWarningDataPageNumber = data.page.number + 1;
          vm.deviceWarningDataBasePath = DEVCE_WARNING_DATA_PAGED_QUERY;
          if (vm.deviceWarningDataList.length == 0) {
            Notification.warning(languages.findKey('theDeviceDoesNotAlarmThisTimePeriodPleaseReselect'));
          }
          else {
            vm.deviceWarningDataList.forEach(function (deviceWarningData) {
              deviceWarningData.warningMsg = serviceResource.getWarningMsg(deviceWarningData, vm.DeviceType);
            })
          }
        }, function (reason) {
          Notification.error(languages.findKey('getTheEquipmentFailureAlarmInformation'));
        }
      )
    }


    //地图tab,请求该设备一段时间内的数据用于绘制轨迹

    //默认显示当前设备的最新地址
    vm.initMapTab = function (deviceInfo) {
      $timeout(function () {
        var deviceInfoList = new Array();
        deviceInfoList.push(deviceInfo);
        var centerAddr = [deviceInfo.longitudeNum, deviceInfo.latitudeNum];
        serviceResource.refreshMapWithDeviceInfo("deviceDetailMap", deviceInfoList, 4, centerAddr);
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

    vm.startDateOpenMapData = function ($event) {
      vm.startDateOpenStatusMapData.opened = true;
    };
    vm.endDateOpenMapData = function ($event) {
      vm.endDateOpenStatusMapData.opened = true;
    };


    //参数: 地图轨迹gps 数据
    vm.refreshMapTab = function (lineAttr) {
      /*****************     第一部分，动画暂停、继续的实现 通过自定义一个控件对象来控制位置变化    ********************/
      /**
       * Marker移动控件
       * @param {Map} map    地图对象
       * @param {Marker} marker Marker对象
       * @param {Array} path   移动的路径，以坐标数组表示
       */
      var MarkerMovingControl = function (map, marker, path) {
        this._map = map;
        this._marker = marker;
        this._path = path;
        this._currentIndex = 0;
        marker.setMap(map);
        marker.setPosition(path[0]);
      }
      /**************************************结束 ***********************************************************/
      var marker;
      var carPostion = [116.397428, 39.90923];   //默认地点
      if (lineAttr.length > 0) {
        carPostion = lineAttr[0];
      }

      var map = new AMap.Map("deviceDetailMap", {
        resizeEnable: true,
        zoom: 17
      });

      /*工具条，比例尺，预览插件*/
      AMap.plugin(['AMap.Scale', 'AMap.OverView'],
        function () {
          map.addControl(new AMap.ToolBar());
          map.addControl(new AMap.Scale());
          map.addControl(new AMap.OverView({isOpen: true}));
        });

      AMap.plugin(["AMap.RangingTool"], function () {
      });
      //小车
      marker = new AMap.Marker({
        map: map,
        position: carPostion,
        icon: "assets/images/car_03.png",
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true
      });
      marker.setLabel({
        offset: new AMap.Pixel(-10, -25),//修改label相对于maker的位置
        content: "行使了 0 米"
      });
      // 绘制轨迹
      var polyline = new AMap.Polyline({
        map: map,
        path: lineAttr,
        strokeColor: "#00A",  //线颜色
        strokeOpacity: 1,     //线透明度
        strokeWeight: 3,      //线宽
        strokeStyle: "solid"  //线样式
      });

      map.setFitView();

      var markerMovingControl = new MarkerMovingControl(map, marker, lineAttr);
      var startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
      var lastDistabce = 0;
      /*移动完成触发事件*/
      AMap.event.addListener(marker, "movealong", function () {
        markerMovingControl._currentIndex = 0;
      })
      /*每一步移动完成触发事件*/
      AMap.event.addListener(marker, "moveend", function () {
        markerMovingControl._currentIndex++;
        var distances = parseInt(startLat.distance(marker.getPosition()).toString().split('.')[0]);
        lastDistabce += distances;
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + lastDistabce + "&nbsp&nbsp" + "米"
        });
        startLat = new AMap.LngLat(marker.getPosition().lng, marker.getPosition().lat);
      })
      /*小车每一移动一部就会触发事件*/
      AMap.event.addListener(marker, "moving", function () {

      })
      /*开始事件*/
      AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
        lastDistabce = 0;
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + lastDistabce + "&nbsp&nbsp" + "米"
        });
        startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
        markerMovingControl._currentIndex = 0;
        markerMovingControl._marker.moveAlong(lineAttr, 500);
      }, false);
      /*暂停事件*/
      AMap.event.addDomListener(document.getElementById('stop'), 'click', function () {
        markerMovingControl._marker.stopMove();
        var distabcess2 = lastDistabce;
        var distances = parseInt(startLat.distance(markerMovingControl._marker.getPosition()).toString().split('.')[0]);
        distabcess2 += distances;
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + distabcess2 + "&nbsp&nbsp" + "米"
        });
      }, false);
      /*继续移动事件*/
      AMap.event.addDomListener(document.getElementById('move'), 'click', function () {
        var lineArr2 = lineAttr.slice(markerMovingControl._currentIndex + 1)
        lineArr2.unshift(marker.getPosition());
        markerMovingControl._marker.moveAlong(lineArr2, 500);
      }, false);
    };


    vm.getDeviceMapData = function (page, size, sort, deviceNum, startDate, endDate) {
      if (deviceNum) {
        var filterTerm = "deviceNum=" + $filter('uppercase')(deviceNum);
      }
      if (startDate) {
        var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
        var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
        if (filterTerm) {
          filterTerm += "&startDate=" + startDateFormated
        }
        else {
          filterTerm += "startDate=" + startDateFormated;
        }
      }
      if (endDate) {
        var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
        var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
        if (filterTerm) {
          filterTerm += "&endDate=" + endDateFormated;
        }
        else {
          filterTerm += "endDate=" + endDateFormated;
        }
      }
      var lineArr = [];
      var lineArr2 = [];
      var deviceDataPromis = serviceResource.queryDeviceSimpleData(page, size, sort, filterTerm);
      deviceDataPromis.then(function (data) {
          var deviceMapDataList = data.content;
          if (deviceMapDataList.length == 0) {
            Notification.warning(languages.findKey('deviceIsNotHistoricalDataForThisTimePeriodPleaseReselect'));
          }
          else {
            vm.deviceMapDataList = _.sortBy(deviceMapDataList, "locateDateTime");
            vm.deviceMapDataList.forEach(function (deviceData) {
              lineArr.push(new AMap.LngLat(deviceData.amaplongitudeNum, deviceData.amaplatitudeNum));
            })
            for (var i = 0; i < lineArr.length; i++) {
              if (i == lineArr.length - 1) {
                break;
              }
              if (lineArr[i].lat == lineArr[i + 1].lat && lineArr[i].lng == lineArr[i + 1].lng) {
              } else {
                lineArr2.push(lineArr[i])
              }
            }
            vm.refreshMapTab(lineArr2);
          }
        }, function (reason) {
          Notification.error(languages.findKey('historicalDataAcquisitionDeviceFailure'));
        }
      )
    }


    //******************远程控制tab**********************]

    vm.serverHost = "iotserver1.nvr-china.com";

    vm.serverPort = "09999";
    vm.startTimes = vm.deviceinfo.startTimes;
    vm.workHours = $filter('number')(vm.deviceinfo.totalDuration, 1);
    if (vm.workHours != null) {
      vm.workHours = vm.workHours.replace(/,/g, '');  //去掉千位分隔符
    }


    //设置ECU 锁车状态 描述
    vm.ecuLockStatusDesc = "";
    if (vm.deviceinfo.ecuLockStatus != null) {
      if (vm.deviceinfo.ecuLockStatus.length == 8) {
        if (vm.deviceinfo.ecuLockStatus.substr(7, 1) == "0") {
          vm.ecuLockStatusDesc += "未激活";
        }
        else {
          vm.ecuLockStatusDesc += "已激活";
        }
        /* if (vm.deviceinfo.ecuLockStatus.substr(5,1) == "0"){
         vm.ecuLockStatusDesc += ".";
         }
         else{
         vm.ecuLockStatusDesc += ".";
         }*/
      }
    }

    //vm.secOutPower =
    //secLocateInt
    //secInnerPower

    if (permissions.getPermissions("device:remoteControl")) {

      ////读取初始化设备时需要的信息
      var restURL = DEIVCIE_UNLOCK_FACTOR_URL + "?deviceNum=" + vm.deviceinfo.deviceNum;
      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        vm.deviceUnLockFactor = data.content;
        var licenseId = vm.deviceUnLockFactor.licenseId;
        //具体格式请参考短信激活文档
      }, function (reason) {
        Notification.error(languages.findKey('getInformationFailed'));
      })
    }


    vm.cancelLockTimes = "";


    //查询锁车的短信内容
    vm.getActiveLockSMS = function (devicenum) {

      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = GET_ACTIVE_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        if (data.code === 0) {
          vm.activeMsg = data.content;
        } else {
          Notification.error(data.message);
        }

      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }


    //发送锁车短信
    vm.sendActiveLockSMS = function (devicenum) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_ACTIVE_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      $confirm({
        text: languages.findKey('youSureYouWantToSendThisMessage') + '',
        title: languages.findKey('SMSConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.activeMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
            }
            else {

              if (data.code == 0) {
                Notification.error(data.content.resultDescribe);
              } else {
                Notification.error(data.content.message);
              }

            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
          })
        });
    }


    vm.validateMonitorShowPermission = function () {
      return permissions.getPermissions("device:monitorShow");
    }


    //查询锁车的短信内容
    vm.getUnActiveLockSMS = function (devicenum) {

      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = GET_UN_ACTIVE_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        if (data.code === 0) {
          vm.unActiveMsg = data.content;
        } else {
          Notification.error(data.message);
        }

      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }


    //发送锁车短信
    vm.sendUnActiveLockSMS = function (devicenum) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_UN_ACTIVE_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      $confirm({
        text: languages.findKey('youSureYouWantToSendThisMessage') + '',
        title: languages.findKey('SMSConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.unActiveMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
            }
            else {

              if (data.code == 0) {
                Notification.error(data.content.resultDescribe);
              } else {
                Notification.error(data.content.message);
              }

            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
          })
        });
    }

    //查询锁车的短信内容
    vm.getLockSMS = function (devicenum) {

      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = GET_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        if (data.code === 0) {
          vm.lockMsg = data.content;
        } else {
          Notification.error(data.message);
        }

      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }


    //发送锁车短信
    vm.sendLockSMS = function (devicenum) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      $confirm({
        text: languages.findKey('youSureYouWantToSendThisMessage') + '',
        title: languages.findKey('SMSConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.lockMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
            }
            else {

              if (data.code == 0) {
                Notification.error(data.content.resultDescribe);
              } else {
                Notification.error(data.content.message);
              }

            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
          })
        });
    }


    //查询锁车的短信内容
    vm.getUnLockSMS = function (devicenum) {

      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = GET_UN_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        if (data.code === 0) {
          vm.unLockMsg = data.content;
        } else {
          Notification.error(data.message);
        }

      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }


    //发送锁车短信
    vm.sendUnLockSMS = function (devicenum) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_UN_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      $confirm({
        text: languages.findKey('youSureYouWantToSendThisMessage') + '',
        title: languages.findKey('SMSConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.unLockMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
            }
            else {

              if (data.code == 0) {
                Notification.error(data.content.resultDescribe);
              } else {
                Notification.error(data.content.message);
              }

            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
          })
        });
    }

    vm.viewBindInputMsg = function (devicenum) {
      $confirm({
        text: languages.findKey('ConfirmMsgViewKeyInput') + '',
        title: languages.findKey('ViewKeyInputConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var restURL = VIEW_BIND_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
          var rspData = serviceResource.restCallService(restURL, "GET");
          rspData.then(function (data) {

            vm.bindKeyboardMsg = data.content;
            if (data.content) {
              vm.bindKeyboardMsgIdx = data.content.substr(17, 1) + data.content.substr(22, 1);
            }
          }, function (reason) {
            Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
          })
        })

    }

    vm.viewUnBindInputMsg = function (devicenum) {
      $confirm({
        text: languages.findKey('ConfirmMsgViewKeyInput') + '',
        title: languages.findKey('ViewKeyInputConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var restURL = VIEW_UN_BIND_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
          var rspData = serviceResource.restCallService(restURL, "GET");
          rspData.then(function (data) {

            vm.unbindKeyboardMsg = data.content;
            if (data.content) {
              var idxTmp = data.content.substr(5, 1) + data.content.substr(10, 1);
              vm.unbindKeyboardMsgIdx = 50 - idxTmp;
            }
          }, function (reason) {
            Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
          })
        })

    }

    vm.viewLockInputMsg = function (devicenum) {
      $confirm({
        text: languages.findKey('ConfirmMsgViewKeyInput') + '',
        title: languages.findKey('ViewKeyInputConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var restURL = VIEW_LOCK_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
          var rspData = serviceResource.restCallService(restURL, "GET");
          rspData.then(function (data) {

            vm.lockKeyboardMsg = data.content;
            if (data.content) {
              vm.lockKeyboardMsgIdx = data.content.substr(5, 1) + data.content.substr(10, 1);
            }
          }, function (reason) {
            Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
          })
        })

    }

    vm.viewUnLockInputMsg = function (devicenum) {
      $confirm({
        text: languages.findKey('ConfirmMsgViewKeyInput') + '',
        title: languages.findKey('ViewKeyInputConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var restURL = VIEW_UN_LOCK_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
          var rspData = serviceResource.restCallService(restURL, "GET");
          rspData.then(function (data) {

            vm.unLockKeyboardMsg = data.content;
            if (data.content) {
              vm.unLockKeyboardMsgIdx = data.content.substr(5, 1) + data.content.substr(10, 1);
            }
          }, function (reason) {
            Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
          })
        })

    }

    vm.viewCancelLockInputMsg = function (devicenum) {
      $confirm({
        text: languages.findKey('ConfirmMsgViewKeyInput') + '',
        title: languages.findKey('ViewKeyInputConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var restURL = VIEW_CANCEL_LOCK_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
          var rspData = serviceResource.restCallService(restURL, "GET");
          rspData.then(function (data) {

            vm.cancelLockKeyboardMsg = data.content;
            if (data.content) {

              vm.cancelLockTimes = data.content.substr(3, 1) + data.content.substr(8, 1);
            }
          }, function (reason) {
            Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
          })
        })

    }


    //查询回传地址
    vm.getSetIpSMS = function (devicenum, host, port) {

      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = GET_SET_IP_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&host=" + host + "&port=" + port;
      ;

      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        if (data.code === 0) {
          vm.setIpMsg = data.content;
        } else {
          Notification.error(data.message);
        }

      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }


    //发送回传地址信息
    vm.sendSetIpSMS = function (devicenum, host, port) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_SET_IP_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&host=" + host + "&port=" + port;
      ;

      $confirm({
        text: languages.findKey('youSureYouWantToSendThisMessage') + '',
        title: languages.findKey('SMSConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.setIpMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
            }
            else {

              if (data.code == 0) {
                Notification.error(data.content.resultDescribe);
              } else {
                Notification.error(data.content.message);
              }

            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
          })
        });
    }

    //查询启动次数信息
    vm.getSetStartTimesSMS = function (devicenum, startTimes) {

      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = GET_SET_START_TIMES_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&startTimes=" + startTimes;

      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        if (data.code === 0) {
          vm.setStartTImesMsg = data.content;
        } else {
          Notification.error(data.message);
        }

      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }


    //发送启动次数信息
    vm.sendSetStartTimesSMS = function (devicenum, startTimes) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_SET_START_TIMES_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&startTimes=" + startTimes;

      $confirm({
        text: languages.findKey('youSureYouWantToSendThisMessage') + '',
        title: languages.findKey('SMSConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.setStartTImesMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
            }
            else {

              if (data.code == 0) {
                Notification.error(data.content.resultDescribe);
              } else {
                Notification.error(data.content.message);
              }

            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
          })
        });
    }


    //查询工作小时信息
    vm.getSetWorkHoursSMS = function (devicenum, workHours) {

      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = GET_SET_WORK_HOURS_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&workHours=" + workHours;

      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        if (data.code === 0) {
          vm.setWorkHoursMsg = data.content;
        } else {
          Notification.error(data.message);
        }

      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }


    //发送回传地址信息
    vm.sendSetWorkHoursSMS = function (devicenum, workHours) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_SET_WORK_HOURS_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&workHours=" + workHours;

      $confirm({
        text: languages.findKey('youSureYouWantToSendThisMessage') + '',
        title: languages.findKey('SMSConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.setWorkHoursMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
            }
            else {

              if (data.code == 0) {
                Notification.error(data.content.resultDescribe);
              } else {
                Notification.error(data.content.message);
              }

            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
          })
        });
    }

    //查询间隔信息
    vm.getSetInterSMS = function (devicenum, secOutsidePower, secLocateInt, secInnerPower) {

      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = GET_SET_INTER_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&secOutsidePower="
        + secOutsidePower + "&secLocateInt=" + secLocateInt + "&secInnerPower=" + secInnerPower;

      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        if (data.code === 0) {
          vm.setWorkIntMsg = data.content;
        } else {
          Notification.error(data.message);
        }

      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }


    //发送间隔信息
    vm.sendSetInterSMS = function (devicenum, secOutsidePower, secLocateInt, secInnerPower) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_SET_INTER_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&secOutsidePower="
        + secOutsidePower + "&secLocateInt=" + secLocateInt + "&secInnerPower=" + secInnerPower;

      $confirm({
        text: languages.findKey('youSureYouWantToSendThisMessage') + '',
        title: languages.findKey('SMSConfirmation') + '',
        ok: languages.findKey('confirm') + '',
        cancel: languages.findKey('cancel') + ''
      })
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.setWorkIntMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
            }
            else {

              if (data.code == 0) {
                Notification.error(data.content.resultDescribe);
              } else {
                Notification.error(data.content.message);
              }

            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled') + ": " + reason.data.message);
          })
        });
    }
    /*slectItem*/
    vm.selectSensor = function (deviceNum) {
      var currentOpenModal = $uibModal.open({
        animation: true,
        backdrop: false,
        size: 'sm',
        templateUrl: 'app/components/common/sensorlist.html',
        controller: 'sensorController as sensorCon',
        resolve: { //用来向controller传数据
          item: function () {
            return deviceNum;
          }
        }
      })
      currentOpenModal.result.then(function (selectedItem) {
        vm.sensorItem = selectedItem
      }, function () {
        //没有选中任何传感器
      })
    }
    vm.removeItem = function (key) {
      delete vm.sensorItem[key];
    }
    <!--数据分析-->
    vm.viewReport = function (versionNum, deviceNum, startDate, endDate) {
      if (vm.sensorItem == null || angular.equals({}, vm.sensorItem)) {
        Notification.error("请选择传感器！");
        return;
      }
      var sensor = {
        deviceNum: deviceNum,
        versionNum: versionNum,
        startDate: startDate,
        endDate: endDate,
        sensors: Object.keys(vm.sensorItem)
      };
      var rspPromise = $http.post(INFLUXDB,sensor);
      rspPromise.then(function (data) {
        var sensorData=data.data;
        if(sensorData==null||sensorData.length==0){
          Notification.error("暂无数据！");
          return;
        }
        vm.chartConfig={
          options: {
            chart: {
              type: 'line',
              zoomType: 'xy'
            }
          },
          title: {text: '设备运作状态'},
          //x轴坐标显示
          xAxis: {
            title: {
              text: '日期'
            },
            labels: {
              formatter: function () {
                return $filter('date')(new Date(this.value),'MM-dd HH:mm');
              }
            }
          },
          //y轴坐标显示
          yAxis: {title: {text: ''}},
          series:[]
        }
        for(var i=0;i<sensorData.length;i++){
          vm.chartConfig.series.push({
            name: vm.sensorItem[sensorData[i].name],
            data: sensorData[i].data,
            id: sensorData[i].name,
            tooltip: {
              headerFormat: '',
              shared: true,
              pointFormatter:function () {
                var time =$filter('date')(new Date(this.x),'yyyy-MM-dd HH:mm:ss');
                return '<b>日期: </b>'+time+'<br><b>'+this.series.name+': </b>'+this.y+''+'<br>';
              }
            }

          })
        }


      });
    }

    vm.swapChartType=function () {
      if (vm.chartConfig.options.chart.type === 'line') {
        vm.chartConfig.options.chart.type = 'bar'
      } else {
        vm.chartConfig.options.chart.type = 'line'
        vm.chartConfig.options.chart.zoomType = 'xy'
      }
    }

  }
})();
