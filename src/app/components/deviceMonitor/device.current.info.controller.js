/**
 * Created by shuangshan on 16/1/10.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceCurrentInfoController', DeviceCurrentInfoController);

  /** @ngInject */
  function DeviceCurrentInfoController($rootScope, $window, $scope, $timeout, $resource, $interval, $http, $uibModal, $confirm, $filter, $uibModalInstance, permissions, languages, serviceResource, Notification,
                                       DEVCE_MONITOR_SINGL_QUERY, DEVCE_DATA_PAGED_QUERY, DEVCE_WARNING_DATA_PAGED_QUERY, AMAP_QUERY_TIMEOUT_MS,
                                       AMAP_GEO_CODER_URL, DEIVCIE_UNLOCK_FACTOR_URL, GET_ACTIVE_SMS_URL, SEND_ACTIVE_SMS_URL, GET_UN_ACTIVE_LOCK_SMS_URL, SEND_UN_ACTIVE_LOCK_SMS_URL,
                                       GET_LOCK_SMS_URL, SEND_LOCK_SMS_URL, GET_UN_LOCK_SMS_URL, SEND_UN_LOCK_SMS_URL,
                                       GET_SET_IP_SMS_URL, SEND_SET_IP_SMS_URL,SMS_SEND_CUSTOMIZED_URL,SMS_SEND_SETALARMFUNC_URL,SMS_SEND_SETSERIALNUM_URL, GET_SET_START_TIMES_SMS_URL, SEND_SET_START_TIMES_SMS_URL,
                                       GET_SET_WORK_HOURS_SMS_URL, SEND_SET_WORK_HOURS_SMS_URL,DEVCE_LOCK_DATA_PAGED_QUERY,GET_SET_INTER_SMS_URL,SEND_SET_INTER_SMS_URL,ANALYSIS_POSTGRES, ANALYSIS_GREENPLUM,DEVCEDATA_EXCELEXPORT,
                                       PORTRAIT_ENGINEPERFORMS_URL,PORTRAIT_RECENTLYSPEED_URL,PORTRAIT_RECENTLYOIL_URL,PORTRAIT_WORKTIMELABEL_URL, PORTRAIT_MACHINEEVENT_URL,PORTRAIT_CUSTOMERINFO_URL,MACHINE_STORAGE_URL,deviceinfo, ngTableDefaults, NgTableParams) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    vm.sensorItem = {};
    $scope.myInterval = 5000;//轮播间隔
    $scope.noWrapSlides = false;// 是否轮播 默认false
    $scope.noTransition = false;// 是否有过场动画 默认false
    vm.realtimeOptModel = 3;
    vm.workTimeOptModel = 1;
    vm.startTimesOptModel = 1;
    $scope.notices = [];

    // 短信发送成功后的初始化button
    vm.initSmsSendBtn = function () {
      $window.sessionStorage["sendBtnStatus"] = true;
      $window.sessionStorage["sendBtnTime"] = 60000;
      $window.sessionStorage["sendDeviceNum"] = vm.deviceinfo.deviceNum;
      vm.sendBtnShow = true;
    }

    //刷新当前页面
    vm.refreshCurrentDeviceInfo = function (id) {
      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {

        vm.controllerInitialization(data.content);

          //气压表
          if (vm.highchartsAir != null) {

            vm.highchartsAir.series[0].data = [vm.deviceinfo.pressureMeter];
          }
          //冷却液温度（水温）
          if (vm.highchartsWater != null) {

            vm.highchartsWater.series[0].data = [vm.deviceinfo.engineTemperature];
          }
          //发动机转速
          if (vm.highchartsRpm != null) {

            vm.highchartsRpm.series[0].data = [vm.deviceinfo.enginRotate];
          }

        //发动机转速(装载机)
        if (vm.highchartsZZJRpm != null) {

          vm.highchartsZZJRpm.series[0].data = [vm.deviceinfo.enginRotate];
        }
          //燃油液位
          if (vm.highchartsOil != null) {

            vm.highchartsOil.series[0].data = [vm.deviceinfo.oilLevel];
          }
          //与装载机仪表对应显示，尿素液位（预留，国四用）
          if (vm.highchartsurealevel != null) {

            vm.highchartsurealevel.series[0].data = [0];
          }
          //传动油温度（油温）
          if (vm.highchartsATF != null) {
            var oilTemperature = parseInt(vm.deviceinfo.oilTemperature);

            vm.highchartsATF.series[0].data = [oilTemperature];
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
      vm.deviceinfo.engineTemperature = parseInt(vm.deviceinfo.engineTemperature); //
      //TODO 原来根据车架号判断，由于增加了临沃的车，需要根据versionNum来判断当前设备是否是小挖,装载机，矿车
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
          type: 'gauge',
          alignTicks: false,
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },

        title: languages.findKey('barometricPressure') + '',
        exporting: {enabled: false},

        pane: {
          center: ['50%', '75%'],
          size: '120%',
          startAngle: -80,
          endAngle: 80,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '20%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: true
        },

        // the value axis
        yAxis: {
          min: 0,
          max: 98,  //气压表最大98
          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          offset: -10,
          lineWidth: 2,
          labels: {
            distance: -20,
            rotation: 'auto'
          },
          tickLength: 5,
          mitickLength: 5,
          endOnTick: true,
          title: {
            y:15,
            text: languages.findKey('barometricPressure') + ''
          },
          plotBands: [{
            from: 80,
            to: 98,
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
      title: languages.findKey('barometricPressure') + '',
      series: [{
        name: languages.findKey('barometricPressure') + '',
        data: [vm.deviceinfo.pressureMeter],
        dataLabels: {
          format: '<div style="text-align:center;"><span style="line-height:12px;border:none;font-size:12px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span>' +
          '</div>',
          inside:false,
          borderWidth:0,
          x:0,
          y:50
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
          type: 'gauge',
          alignTicks: false,
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },

        title: languages.findKey('waterTemperature') + '',
        exporting: {enabled: false},

        pane: {
          center: ['50%', '75%'],
          size: '120%',
          startAngle: -80,
          endAngle: 80,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '20%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: false
        },

        // the value axis
        yAxis: {
          min: 0,
          max: 120,  //水温表最大120
          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          minorTickInterval: 'auto',
          offset: -10,
          lineWidth: 2,
          labels: {
            distance: -15,
            rotation: 'auto'
          },
          tickLength: 5,
          minorTickLength: 5,
          endOnTick: false,

          title: {
            y:15,
            text: languages.findKey('waterTemperature') + ''
          },
          plotBands: [{
            from: 105,
            to: 120,
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
      title: languages.findKey('waterTemperature') + '',
      series: [{
        name: languages.findKey('waterTemperature') + '',
        data: [vm.deviceinfo.engineTemperature],
        dataLabels: {
          format: '<div style="text-align:center"><span style="border:none;line-height:12px;font-size:12px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}℃</span>' + '</div>',
          inside:false,
          borderWidth:0,
          x:0,
          y:50
        },
        tooltip: {
          valueSuffix: '℃'
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
            text: languages.findKey('rotatingSpeed'),
            y:15
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

    //转速图
    vm.highchartsZZJRpm = {
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
          enabled: false
        },

        yAxis: {
          min: 0,
          max: 3000,

          minorTickInterval: 'auto',
          minorTickWidth: 1,
          minorTickLength: 5,
          minorTickPosition: 'inside',
          minorTickColor: '#666',

          tickPixelInterval: 50,
          tickWidth: 2,
          tickPosition: 'inside',
          tickLength: 10,
          tickColor: '#666',
          labels: {
            step: 2,
            rotation: 'auto'
          },
          title: {
            text: languages.findKey('rotatingSpeed'),
            y:15
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
        dataLabels: {
          format: '<div style="text-align:center"><span style="border:none;line-height:12px;font-size:12px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span>' + '</div>',
          inside:false,
          borderWidth:0,
          x:0,
          y:80
        },
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
          type: 'gauge',
          alignTicks: false,
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },
        exporting: {enabled: false},
        title: languages.findKey('Oil') + '',

        pane: {
          center: ['50%', '75%'],
          size: '120%',
          startAngle: -80,
          endAngle: 80,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '20%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: false
        },

        // the value axis
        yAxis: {
          min: 0,
          max: 100,
          title: {
            y:15,
            text: languages.findKey('Oil') + ''
          },
          plotBands: [{
            from: 0,
            to: 12.5,
            color: '#DF5353' // red
          }],
          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          offset: -10,
          lineWidth: 2,
          labels: {
          distance: -15,
            rotation: 'auto'
        },
        tickLength: 5,
          minorTickLength: 5,
          endOnTick: false,

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
          format: '<div style="text-align:center"><span style="font-size:12px;line-height:12px;border:none;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}%</span>' + '</div>',
          inside:false,
          borderWidth:0,
          x:0,
          y:50
        },
        tooltip: {
          valueSuffix: '%'
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

    //尿素液位
    vm.highchartsurealevel = {
      options: {
        chart: {
          type: 'gauge',
          alignTicks: false,
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },
        exporting: {enabled: false},
        title: languages.findKey('Oil') + '',

        pane: {
          center: ['50%', '75%'],
          size: '120%',
          startAngle: -80,
          endAngle: 80,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '20%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: true
        },

        // the value axis
        yAxis: {
          min: 0,
          max: 100,
          title: {
            y:15,
            text: languages.findKey('surealevel') + ''
          },

          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          offset: -10,
          lineWidth: 2,
          labels: {
            distance: -15,
            rotation: 'auto'
          },
          tickLength: 5,
          minorTickLength: 5,
          endOnTick: true,

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
      title: languages.findKey('surealevel') + '',
      series: [{
        name: languages.findKey('surealevel') + '',
        data: [vm.deviceinfo.surealevel],
        dataLabels: {
          format: '<div style="text-align:center"><span style="font-size:12px;line-height:12px;border:none;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}%</span>' + '</div>',
          inside:false,
          borderWidth:0,
          x:0,
          y:50
        },
        tooltip: {
          valueSuffix: '%'
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
    }


    var oilTemperature = parseInt(vm.deviceinfo.oilTemperature);
    //传动油温度（油温）
    vm.highchartsATF = {
      options: {
        chart: {
          type: 'gauge',
          alignTicks: false,
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },

        title: languages.findKey('OilTemperature') + '',
        exporting: {enabled: false},

        pane: {
          center: ['50%', '75%'],
          size: '120%',
          startAngle: -80,
          endAngle: 80,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '20%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: false
        },

        // the value axis
        yAxis: {
          min: 0,
          max: 140,  //最大140
          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          minorTickInterval: 'auto',
          offset: -10,
          lineWidth: 2,
          labels: {
            distance: -15,
            rotation: 'auto'
          },
          tickLength: 5,
          minorTickLength: 5,
          tickInterval:40,
          endOnTick: false,

          title: {
            y:15,
            text: languages.findKey('OilTemperature') + ''
          },
          plotBands: [{
            from: 120,
            to: 140,
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
      title: languages.findKey('OilTemperature') + '',
      series: [{
        name: languages.findKey('OilTemperature') + '',
        data: [oilTemperature],
        dataLabels: {
          format: '<div style="text-align:center"><span style="border:none;line-height:12px;font-size:12px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}℃</span>' + '</div>',
          inside:false,
          borderWidth:0,
          x:0,
          y:50
        },
        tooltip: {
          valueSuffix: '℃'
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
    }
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
              data.ecuLockStatusDesc += "未绑定";
            }
            else {
              data.ecuLockStatusDesc += "已绑定";
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

    vm.excelExport = function (deviceNum, startDate, endDate) {
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
      var restCallURL = DEVCEDATA_EXCELEXPORT;
      if (filterTerm){
        restCallURL += "?";
        restCallURL += filterTerm;
      }

      $http({
        url: restCallURL,
        method: "GET",
        responseType: 'arraybuffer'
      }).success(function (data, status, headers, config) {
          var blob = new Blob([data], { type: "application/vnd.ms-excel" });
          var objectUrl = window.URL.createObjectURL(blob);

          var anchor = angular.element('<a/>');

        //兼容多种浏览器
        if (window.navigator.msSaveBlob) { // IE
          window.navigator.msSaveOrOpenBlob(blob, deviceNum +'.xls')
        } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox

          anchor.css({display: 'none'});
          angular.element(document.body).append(anchor);


          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download: deviceNum +'.xls'
          })[0].click();

          anchor.remove();
        } else { // Chrome
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download: deviceNum +'.xls'
          })[0].click();
        }


        }).error(function (data, status, headers, config) {
          Notification.error("下载失败!");
      });

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
              deviceWarningData.warningMsg = serviceResource.getWarningMsg(deviceWarningData, deviceWarningData.deviceType);
            })
          }
        }, function (reason) {
          Notification.error(languages.findKey('getTheEquipmentFailureAlarmInformation'));
        }
      )
    }
    vm.getLockData=function (phoneNumber) {
      var restCallURL = DEVCE_LOCK_DATA_PAGED_QUERY;

      if (phoneNumber&&!angular.isUndefined(phoneNumber)) {
        var filterTerm = "phoneNumber=" + $filter('uppercase')(phoneNumber);
      }else {
        Notification.warning('设备未绑定sim卡！');
        return;
      }
      if(filterTerm) {
        restCallURL += "?" + filterTerm;
      }
      var deviceLockDataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      deviceLockDataPromis.then(function (data) {
          if (data.length == 0) {
            Notification.warning('无下发短信');
          } else {
            ngTableDefaults.settings.counts = [];
            vm.lockDataTable = new NgTableParams({
              count: 8,
              sorting: {sendTime: 'desc'}
            }, {
              dataset: data
            });
          }
        }, function (reason) {
          Notification.error('获取锁车短信内容失败！');
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
        serviceResource.refreshMapWithDeviceInfo("deviceDetailMap", deviceInfoList, 10, centerAddr);
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

      var carPostion = lineAttr[0];

      var map = new AMap.Map("deviceDetailMap", {
        resizeEnable: true,
        zooms: [4, 18]
      });
      vm.maps=map;
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
        var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate() + ' ' + startDate.getHours() + ':' + startDate.getMinutes() + ':' + startDate.getSeconds();
        if (filterTerm) {
          filterTerm += "&startDate=" + startDateFormated
        }
        else {
          filterTerm += "startDate=" + startDateFormated;
        }
      } else {
        Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }
      if (endDate) {
        var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
        var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate() + ' ' + endDate.getHours() + ':' + endDate.getMinutes() + ':' + endDate.getSeconds();
        if (filterTerm) {
          filterTerm += "&endDate=" + endDateFormated;
        }
        else {
          filterTerm += "endDate=" + endDateFormated;
        }
      } else {
        Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
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
              if(i == 0 || lineArr[i].lat != lineArr[i - 1].lat || lineArr[i].lng != lineArr[i - 1].lng) {
                lineArr2.push(lineArr[i]);
              }
            }
            vm.refreshMapTab(lineArr2);
          }
        }, function (reason) {
          Notification.error(languages.findKey('historicalDataAcquisitionDeviceFailure'));
        }
      )
    }

    vm.draw=function (ids) {
      var storageDataURL =MACHINE_STORAGE_URL+"?licenseId="+ids;
      var storageDataPromis = serviceResource.restCallService(storageDataURL,"GET");
      storageDataPromis.then(function (data) {
        var circle = new AMap.Circle({
          center: new AMap.LngLat(data.storagelongitudeNum, data.storageLatitudeNum),// 圆心位置
          radius: 1000, //半径
          strokeColor: "#F33", //线颜色
          strokeOpacity: 1, //线透明度
          strokeWeight: 3, //线粗细度
          fillColor: "#ee2200", //填充颜色
          fillOpacity: 0.35//填充透明度
        });
      circle.setMap(vm.maps);
      })
    }

    //******************远程控制tab**********************]

    vm.serverHost = "iotserver1.nvr-china.com";

    vm.serverPort = "09999";
    if(vm.deviceinfo.versionNum!=null && vm.deviceinfo.versionNum =='2001'){
      vm.serverPort = "09998";
    }
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
          vm.ecuLockStatusDesc += "未绑定";
        }
        else {
          vm.ecuLockStatusDesc += "已绑定";
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


    //查询绑定短信的短信内容
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


    //发送绑定短信
    vm.sendActiveLockSMS = function (devicenum) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_ACTIVE_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      // 如果是中挖，并且当前已经绑定（“已绑定”），则提示是否继续发送绑定短信
      if(vm.deviceinfo.versionNum == '40' &&  vm.ecuLockStatusDesc == "已绑定"){
        vm.confirmText = '当前设备已经绑定，继续绑定可能会产生异常，你确定继续发送绑定短信吗？';
      }else{
        vm.confirmText = languages.findKey('youSureYouWantToSendThisMessage') + '';
      }
      $confirm({
        text: vm.confirmText,
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
              vm.initSmsSendBtn();
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


    //查询解绑短信的短信内容
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


    //发送解绑短信
    vm.sendUnActiveLockSMS = function (devicenum) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_UN_ACTIVE_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      // 如果是中挖，并且当前未绑定（“未绑定”），则提示是否继续发送解绑短信
      if(vm.deviceinfo.versionNum == '40' &&  vm.ecuLockStatusDesc == "未绑定"){
        vm.confirmText = '当前设备未绑定，解绑短信无效，你确定继续发送解绑短信吗？';
      }else{
        vm.confirmText = languages.findKey('youSureYouWantToSendThisMessage') + '';
      }

      $confirm({
        text: vm.confirmText,
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
              vm.initSmsSendBtn();
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

      // 如果是中挖，并且当前已经锁车，则提示是否继续发送锁车短信
      if(vm.deviceinfo.versionNum == '40' &&  vm.deviceinfo.gprsSignal == "90"){
        vm.confirmText = '当前设备已经锁车，继续锁车可能会导致异常，你确定继续发送锁车短信吗？';
      }else{
        vm.confirmText = languages.findKey('youSureYouWantToSendThisMessage') + '';
      }

      $confirm({
        text: vm.confirmText,
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
              vm.initSmsSendBtn();
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


    //查询解锁短信的短信内容
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
    //格式化显示，使数字每4位以“-”连接
    vm.XReplace = function(str){
      var reg = new RegExp("(\\S{4})","g");
      return str.replace(reg,"$1-");
    }

    //发送解锁短信
    vm.sendUnLockSMS = function (devicenum) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_UN_LOCK_SMS_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

      // 如果是中挖，并且当前未锁车，则提示是否继续发送解锁短信
      if(vm.deviceinfo.versionNum == '40' &&  vm.deviceinfo.gprsSignal != "90"){
        vm.confirmText = '当前设备未锁车,解锁短信无效，你确定继续发送解锁短信吗？';
      }else{
        vm.confirmText = languages.findKey('youSureYouWantToSendThisMessage') + '';
      }

      $confirm({
        text: vm.confirmText,
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
              vm.initSmsSendBtn();
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
      vm.queryCode = 1;
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/ViewKeyInputConfirmation.html',
        controller: 'ViewKeyInputConfirmationController as ViewKeyInputConfirmationController',
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return vm.deviceinfo;
          },
          queryCode:function () {
            return vm.queryCode;
          }
        }
      });
      modalInstance.result.then(function (result) {
        vm.bindKeyboardMsg = result;
      }, function () {
        //取消
      });

    }

    vm.viewUnBindInputMsg = function (devicenum) {
      vm.queryCode = 2;
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/ViewKeyInputConfirmation.html',
        controller: 'ViewKeyInputConfirmationController as ViewKeyInputConfirmationController',
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return vm.deviceinfo;
          },
          queryCode:function () {
            return vm.queryCode;
          }
        }
      });
      modalInstance.result.then(function (result) {
        vm.unbindKeyboardMsg = result;
      }, function () {
        //取消
      });
    }

    vm.viewLockInputMsg = function (devicenum) {
      vm.queryCode = 3;
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/ViewKeyInputConfirmation.html',
        controller: 'ViewKeyInputConfirmationController as ViewKeyInputConfirmationController',
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return vm.deviceinfo;
          },
          queryCode:function () {
            return vm.queryCode;
          }
        }
      });
      modalInstance.result.then(function (result) {
        vm.lockKeyboardMsg = result;
      }, function () {
        //取消
      });

    }

    vm.viewUnLockInputMsg = function (devicenum) {
      vm.queryCode = 4;
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/ViewKeyInputConfirmation.html',
        controller: 'ViewKeyInputConfirmationController as ViewKeyInputConfirmationController',
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return vm.deviceinfo;
          },
          queryCode:function () {
            return vm.queryCode;
          }
        }
      });
      modalInstance.result.then(function (result) {
        vm.unLockKeyboardMsg = result;
      }, function () {
        //取消
      });
    }

    vm.viewCancelLockInputMsg = function (devicenum) {
      vm.queryCode = 5;
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/ViewKeyInputConfirmation.html',
        controller: 'ViewKeyInputConfirmationController as ViewKeyInputConfirmationController',
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return vm.deviceinfo;
          },
          queryCode:function () {
            return vm.queryCode;
          }
        }
      });
      modalInstance.result.then(function (result) {
        vm.cancelLockKeyboardMsg = result;
      }, function () {
        //取消
      });

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
              vm.initSmsSendBtn();
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

    //发送自定义短信
    vm.sendCustomizedSMS = function (devicenum, funcNum, customizedData) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SMS_SEND_CUSTOMIZED_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&funcNum=" + funcNum + "&customizedData=" + customizedData;

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
              vm.sendCustomizedMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
              vm.initSmsSendBtn();
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

    //发送关闭或打开部分报警功能
    vm.sendSetAlarmFuncSMS = function (devicenum,setCode) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SMS_SEND_SETALARMFUNC_URL + "?devicenum=" + vm.deviceinfo.deviceNum + "&setCode=" + setCode;

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
              vm.sendSetAlarmFuncMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
              vm.initSmsSendBtn();
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

    //发送初始化流水号
    vm.sendSetSericalNumSMS = function (devicenum) {
      if (devicenum == null) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SMS_SEND_SETSERIALNUM_URL + "?devicenum=" + vm.deviceinfo.deviceNum;

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
              vm.sendSetAlarmFuncMsg = data.content.smsContent;
              Notification.success(data.content.resultDescribe);
              vm.initSmsSendBtn();
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
              vm.initSmsSendBtn();
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
              vm.initSmsSendBtn();
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
      if(angular.isUndefined(secOutsidePower) ||angular.isUndefined(secLocateInt)||angular.isUndefined(secInnerPower) ){
        Notification.error("请检查时间设置，三个回传时间须全部设置！");
        return;
      }
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
      if(angular.isUndefined(secOutsidePower) ||angular.isUndefined(secLocateInt)||angular.isUndefined(secInnerPower) ){
        Notification.error("请检查时间设置，三个回传时间须全部设置！");
        return;
      }
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
              vm.initSmsSendBtn();
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

    /**************   数据分析bgein ***************/
    vm.checkedRad = 'DASHBOARD';
    /*初始化图表*/
    vm.initConfig = function (deviceNum) {
      vm.chartConfig = {
        title: {text: '设备工作分析'}
      }
      vm.workHoursChart={
        title: {text: '工作时长分析'},
       size: {
            width: 760,
           height: 270
       }
      }
      vm.startTimesChart = {
        title: {text: '启动次数分析'},
       size: {
           width: 760,
           height: 270
       }
      }
    }
    /*状态量选择*/
    vm.selectSensor = function (checkedRad) {
      if (vm.checkedRad == 'DASHBOARD') {
        return;
      }
      var currentOpenModal = $uibModal.open({
        animation: true,
        backdrop: false,
        size: 'sm',
        templateUrl: 'app/components/common/sensorlist.html',
        controller: 'sensorController as sensorCon',
        resolve: { //用来向controller传数据
          item: function () {
            return checkedRad;
          }
        }
      })
      currentOpenModal.result.then(function (selectedItem) {
        vm.sensorItem = selectedItem
      })
    }
    /*移除选中的状态量*/
    vm.removeItem = function (key) {
      delete vm.sensorItem[key];
    }
    /*数据分析*/
    vm.viewReport = function (versionNum, deviceNum, startDate, endDate) {
      if (vm.checkedRad == 'DASHBOARD') {
        loadWorkChart(deviceNum, vm.workTimeOptModel, dateFormat(startDate), dateFormat(endDate));
      } else {
        if (vm.checkedRad != 'DASHBOARD' && (vm.sensorItem == null || angular.equals({}, vm.sensorItem))) {
          Notification.error("请选择条目！");
          return;
        }
        var sensor = {
          deviceNum: deviceNum,
          startDate: startDate,
          endDate: endDate,
          sensors: Object.keys(vm.sensorItem)
        };
        loadDeviceMetadata(sensor);
      }
    }
    /*使用折线图展现设备的元数据*/
    var loadDeviceMetadata = function (sensor) {
      var rspPromise = $resource(ANALYSIS_POSTGRES, {}, {'analysisPostgres': {method: 'POST', isArray: true}});
      rspPromise.analysisPostgres(sensor, function (sensorData) {
        if (sensorData == null || sensorData.length == 0) {
          Notification.error("暂无数据！");
          return;
        }
        var categoriesdata = {};
        for (var i = sensorData.length - 1; i >= 0; i--) {
          if (sensorData[i].name == 'locateDate') {
            categoriesdata = (sensorData[i].data)
            break;
          }
        }
        vm.chartConfig = {
          options: {
            chart: {
              type: 'line',
              zoomType: 'xy'
            },
            tooltip: {
              formatter: function () {
                var time = $filter('date')(new Date(this.x), 'yyyy-MM-dd HH:mm:ss');
                return '<b>日期: </b>' + time + '<br><b>' + this.series.name + ': </b>' + this.y + '' + '<br>';
              }
            }
          },
          title: {text: '设备工作分析'},
          //x轴坐标显示
          xAxis: {
            title: {
              text: '日期'
            },
            categories: categoriesdata,
            labels: {
              formatter: function () {
                return $filter('date')(new Date(this.value), 'MM-dd HH:mm');
              }
            }
          },
          //y轴坐标显示
          yAxis: {title: {text: ''}},
          series: []
        }

        for (var i = 0; i < sensorData.length; i++) {
          if (sensorData[i].name != 'locateDate') {
            vm.chartConfig.series.push({
              name: vm.sensorItem[sensorData[i].name],
              data: sensorData[i].data
            })
          }
        }

      })
    }
    /*加载个工作时间的图表*/
    var loadWorkChart = function (deviceNum, workTimeOptModel, startDate, endDate) {
      var reqUrl=ANALYSIS_GREENPLUM+"/days?deviceNum=" + deviceNum + "&startDate=" + startDate + "&endDate=" + endDate;
      var workTimePromis = serviceResource.restCallService(reqUrl, "QUERY", null);
      workTimePromis.then(function (data) {
        var sensorData = data;
        if (sensorData == null || sensorData.length == 0) {
          Notification.error("暂无数据！");
          return;
        }

        var locateDateArray = [];
        var startTimesArray = [];
        var totalDurationArray = [];

        //根据月份升序排列
        var result = sensorData.sort(function (a, b) { return a.workDate > b.workDate ? 1 : -1; });
        for(var i = 0; i < sensorData.length;i++){
          locateDateArray.push($filter('date')(sensorData[i].workDate, 'yyyy-MM-dd'));
          startTimesArray.push(sensorData[i].startTimes);
          totalDurationArray.push(sensorData[i].workHours);
        }

        vm.startTimesChart = {
          options: {
            chart: {
              type: 'column',
              zoomType: 'xy'
            },
            credits: {
              enabled: false
            }
          },
          title: {text: '启动次数分析'},
          //x轴坐标显示
          xAxis: {
            categories: locateDateArray
          },
          //y轴坐标显示
          yAxis: {title: {text: '单位/次'}},
          series: [{
            name: '启动次数',
            color: 'rgb(144, 238, 126)',
            data: startTimesArray
          }],
          size: {
            width: 760,
            height: 270
          }
        };

        vm.workHoursChart = {
          options: {
            chart: {
              type: 'column',
              zoomType: 'xy'
            },
            credits: {
              enabled: false
            }
          },
          title: {text: '工作时长分析'},
          //x轴坐标显示
          xAxis: {
            categories: locateDateArray
          },
          //y轴坐标显示
          yAxis: {
            max: 24,
            tickAmount: 4,
            title: {text: '单位/H'}
          },
          series: [{
            name: '工作时长',
            color: 'rgb(124, 181, 236)',
            data: totalDurationArray
          }],
          size: {
            width: 760,
            height: 270
          }
        };

      })
    }
    /*加载启动次数的图表*/
    /*var loadStartTimesChart = function (deviceNum, startTimesOptModel, startDate, endDate) {
      var reqUrl=ANALYSIS_GREENPLUM+"getstarttimes?deviceNum=" + deviceNum + "&model=" + startTimesOptModel + "&startDate=" + startDate + "&endDate=" + endDate;
      var startTimesPromis = serviceResource.restCallService(reqUrl, "QUERY", null);
      startTimesPromis.then(function (data) {
        var sensorData = data;
        if (sensorData == null || sensorData.length == 0) {
          Notification.error("暂无数据！");
          return;
        }
        vm.startTimesChart = {
          options: {
            chart: {
              type: 'column',
              zoomType: 'xy'
            },
            credits: {
              enabled: false
            }
          },
          title: {text: '启动次数分析'},
          //x轴坐标显示
          xAxis: {
            title: {
              text: '日期'
            },
            tickInterval: 3600 * 1000 * 24 * startTimesOptModel,
            labels: {
              formatter: function () {
                return $filter('date')(new Date(this.value), 'yy-MM-dd');
              }
            }
          },
          //y轴坐标显示
          yAxis: {title: {text: '单位/次'}},
          series: [],
          size: {
            width: 402,
            height: 250
          }
        }
        for (var i = 0; i < sensorData.length; i++) {
          vm.startTimesChart.series.push({
            name: sensorData[i].name,
            data: sensorData[i].data,
            id: sensorData[i].name,
            tooltip: {
              headerFormat: '',
              shared: true,
              pointFormatter: function () {
                var time = $filter('date')(new Date(this.x), 'yyyy-MM-dd');
                return '<b>日期: </b>' + time + '<br><b>' + this.series.name + ': </b>' + this.y + '次' + '<br>';
              }
            }

          })
        }
      });
    }*/
    /*格式化时间函数*/
    var dateFormat = function (date) {
      var startMonth = date.getMonth() + 1;  //getMonth返回的是0-11
      return date.getFullYear() + '-' + startMonth + '-' + date.getDate();
    }
    /*图表样式切换*/
    vm.changeChartType =function (chart) {
      if (chart.options.chart.type === 'line') {
        chart.options.chart.type = 'column'
      } else {
        chart.options.chart.type = 'line'
        chart.options.chart.zoomType = 'x'
      }
    }
    /**************   数据分析end ***************/

    // 用户画像
    vm.initPortrait = function () {

      vm.itemList = [];
      var itemColorList = ['#63B8FF','#CD5B45','#7EC0EE','#EEB422','#66CDAA'];
      var itemLeftList = ['-15%','5%','10%','1%','-10%'];
      // 机器时间轴事件
      var eventUrl =  PORTRAIT_MACHINEEVENT_URL + '?deviceNum=' + deviceinfo.deviceNum;
      var eventPromis = serviceResource.restCallService(eventUrl, "QUERY");
      eventPromis.then(function (data) {
        var eventList = data;
        for(var i =0;i<eventList.length;i++){
          eventList[i].eventContent = eventList[i].eventContent.replace("[\\\"","");
          eventList[i].eventContent = eventList[i].eventContent.replace("\\\"]","");
          eventList[i].eventContent = eventList[i].eventContent.split("\\\",\\\"") ;
          switch (parseInt(eventList[i].eventType)){
            case 1 :
              eventList[i].style = '#1f9eba';//-机器下线日期
              break;
            case 2:
              eventList[i].style = '#5bc0de';//-运抵经销商处
              break;
            case 3:
              eventList[i].style = '#59ba1f';//-销售日期
              break;
            case 7:
              eventList[i].style = '#d1bd10';//-保养事件
              break;
            case 8:
              eventList[i].style = '#ba1f1f';//-维修事件
              break;
            default:
              eventList[i].style = '#1f9eba';//-维修事件
          }
        }
        vm.eventList = eventList;
      });

      // 发动机评分画像
      var engineScoreList = [];
      var url =  PORTRAIT_ENGINEPERFORMS_URL + '?deviceNum=' + deviceinfo.deviceNum;
      var restPromis = serviceResource.restCallService(url, "GET");
      restPromis.then(function (data) {
        vm.enginePerforms = data.content;
        var oil,tem,torque,power,displacement,mtbf = 0;
        vm.enginePerforms.avgOil >= 300 ? oil = 65 : oil = 88;
        vm.enginePerforms.avgTemperature >= 87 ? tem = 82 : tem = 92;
        vm.enginePerforms.maxTorque >= 680 ? torque = 92 : torque = 72;
        vm.enginePerforms.avgPower >= 180 ? power = 89 : power = 75;
        vm.enginePerforms.displacement >= 6.5 ? displacement = 95 : displacement = 85;
        vm.enginePerforms.mtbf >= 100000 ? mtbf = 92 : mtbf = 81;

        engineScoreList.push(oil);
        engineScoreList.push(tem);
        engineScoreList.push(torque);
        engineScoreList.push(power);
        engineScoreList.push(displacement);
        engineScoreList.push(mtbf);

        vm.engineScoreList = engineScoreList;
        vm.enginePerformsChart.series[0].data = vm.engineScoreList;

        var avg = 0;
        for(var i=0 ;i <engineScoreList.length;i++){
          avg += engineScoreList[i];
        }
        avg /= engineScoreList.length;

        vm.engineScoreChart.series[0].data = [Math.round(avg)];

      });

      // 客户信息 index=0
      var customerInfourl =  PORTRAIT_CUSTOMERINFO_URL + '?deviceNum=' + deviceinfo.deviceNum;
      var customerInfoPromis = serviceResource.restCallService(customerInfourl, "GET");
      customerInfoPromis.then(function (data) {
        vm.customerInfo = data.content;
        var customerAge = data.content.age.replace(/[^0-9]/ig,"");
        var currentDate = new Date();
        vm.customerAge =  (Math.floor((currentDate.getFullYear()-customerAge)%100/10) + "0后")||'90后';
        vm.customerInfo.address = vm.deviceinfo.city || data.content.address;

      });


      //用户画像>> 工作时长、启动次数  index=1,2
      var machineLabelUrl =  PORTRAIT_WORKTIMELABEL_URL + '?deviceNum=' + deviceinfo.deviceNum;
      var machineLabelPromis = serviceResource.restCallService(machineLabelUrl, "QUERY");
      machineLabelPromis.then(function (data) {
        var worktimeList = [];
        var startTimesList = [];
        vm.tickPositionsList = [];
        var machineLabelList = data;
        for(var i =0;i <machineLabelList.length; i++){

          var recordTime = moment(machineLabelList[i].recordTime, "YYYY-MM-DD").toDate();
          var worktime = {x: recordTime,y:machineLabelList[i].totalDuration*5/100}
          var startTimes = {x: recordTime,y:machineLabelList[i].startTimes }
          vm.tickPositionsList.push(recordTime.getTime());
          worktimeList.push(worktime);
          startTimesList.push(startTimes);
        }

        // 工作时间
        var avgWorkTime = 0;
        for(var i=0 ;i <worktimeList.length;i++){
          avgWorkTime += worktimeList[i].y*5/100;
        }
        avgWorkTime /= worktimeList.length;
        avgWorkTime > 8 ? vm.workTimeLabelTitle = '工作时间长' :vm.workTimeLabelTitle = '工作时间较短';

        // 启动次数
        var avgStartTimes = 0;
        for(var i=0 ;i <startTimesList.length;i++){
          avgStartTimes += startTimesList[i].y;
        }
        avgStartTimes /= startTimesList.length;
        avgStartTimes > 3 ? vm.startTimesLabelTitle = '使用频率高' : vm.startTimesLabelTitle = '使用频率低';

        vm.worktimeList = worktimeList;
        vm.startTimesList = startTimesList;

      });

      //用户画像>>驾驶习惯指数标签 index =3
      var speedUrl =  PORTRAIT_RECENTLYSPEED_URL + '?deviceNum=' + deviceinfo.deviceNum;
      var restPromis = serviceResource.restCallService(speedUrl, "QUERY");
      restPromis.then(function (data) {
        var speedList = [];
        var machineLabelList = data;
        var overSpeedList = [];
        for(var i =0;i <machineLabelList.length; i++){
          if(machineLabelList[i].speed>30){
            overSpeedList.push(machineLabelList[i].speed);
          }
          var recordTime = moment(machineLabelList[i].recordTime, "YYYY-MM-DD HH24:mm:SS").toDate();
          var speedPoint = {x: recordTime,y:100-machineLabelList[i].speed }
          speedList.push(speedPoint);
        }

        overSpeedList.length >3 ? vm.speedLabelTitle = '经常超速' : vm.speedLabelTitle = '驾驶习惯良好';

        vm.speedList = speedList;

      });

      //用户画像>> 油耗标签 index =4
      var machineLabelUrl =  PORTRAIT_RECENTLYOIL_URL + '?deviceNum=' + deviceinfo.deviceNum;
      var machineLabelPromis = serviceResource.restCallService(machineLabelUrl, "QUERY");
      machineLabelPromis.then(function (data) {
        var oilWearList = [];
        var machineLabelList = data;
        for(var i =0;i <machineLabelList.length; i++){

          var recordTime = moment(machineLabelList[i].recordTime, "YYYY-MM-DD HH").toDate();
          var oilWear = {x: recordTime,y:machineLabelList[i].oilWear }
          oilWearList.push(oilWear);
        }

        // 油耗
        vm.avgOilWear = 0;
        for(var i=0 ;i <oilWearList.length;i++){
          vm.avgOilWear += oilWearList[i].y;
        }
        vm.avgOilWear /= oilWearList.length;
        vm.avgOilWear > 5 ? vm.oilWearLabelTitle = '油耗较高' : vm.oilWearLabelTitle = '油耗较低';

        vm.oilWearList = oilWearList;

      });


      // 因各请求返回时间不确定，目前没有好的写法，采用固定时间push
      $timeout(function () {
        vm.itemList.push({
          title : vm.customerAge ,
          isSelected : false,
          backgroundColor: itemColorList[0],
          marginLeft: itemLeftList[0],
          chart: null
        });
      }, 200 );

      $timeout(function () {
        vm.itemList.push({
          title: vm.workTimeLabelTitle || '工作时间较短',
          isSelected:false,
          backgroundColor: itemColorList[1],
          marginLeft: itemLeftList[1],
          chart: {
            options: {
              chart: {
                type: 'line'
              },
              credits: {
                enabled: false
              },
              exporting: {
                enabled: false
              },
              legend: {
                enabled: false
              },
              title: {
                text: '工作时间'
              },
              tooltip: {
                formatter: function () {
                  return $filter('date')(this.x, 'yyyy-MM-dd') + '<br>' + this.y + ' 小时';
                }
              },
            },
            xAxis: {
              type: 'datetime',
              tickPositions: vm.tickPositionsList,
              labels: {
                formatter: function () {
                  return $filter('date')(new Date(this.value), 'MM-dd');
                }
              }
            },
            yAxis: {
              title: {
                text: '小时'
              },
              plotLines: [{ // mark the 90
                color: 'red',
                width: 2,
                value: 8,
                label: {
                  text: "8小时",
                  align: 'left'
                }
              }]
            },
            series: [{
              name: '工作时长',
              data: vm.worktimeList
            }]
          }
        });
      }, 2000 );

      $timeout(function () {
        vm.itemList.push({
          title : vm.startTimesLabelTitle || '使用频率低' ,
          isSelected:false,
          backgroundColor: itemColorList[2],
          marginLeft: itemLeftList[2],
          chart: {
            options:{
              chart: {
                type: 'column'
              },
              title: {
                text: '开机次数'
              },
              credits: {
                enabled: false
              },
              exporting: {
                enabled: false
              },
              legend: {
                enabled: false
              },
              tooltip: {
                formatter: function () {
                  return $filter('date')(this.x, 'yyyy-MM-dd') + '<br>' + this.y + ' 次';
                }
              },
            },
            xAxis: {
              type: 'datetime',
              tickPositions: vm.tickPositionsList,
              labels: {
                formatter: function () {
                  return $filter('date')(this.value, 'MM-dd');
                }
              }
            },
            yAxis: {
              title: {
                text: '开机次数'
              },
              plotLines: [{ // mark the 90
                color: 'red',
                width: 2,
                value: 3
              }]
            },
            series: [{
              name: '开机次数',
              data: vm.startTimesList
            }]
          }
        });
      }, 2200 );

      $timeout(function () {
        vm.itemList.push({
          title : vm.speedLabelTitle ||'驾驶习惯良好' ,
          isSelected:false,
          backgroundColor: itemColorList[3],
          marginLeft: itemLeftList[3],
          chart: {
            options: {
              chart: {
                zoomType: 'x'
              },
              credits: {
                enabled: false
              },
              exporting: {
                enabled: false
              },
              legend: {
                enabled: false
              },
              title: {
                text: '驾驶习惯指数'
              },
              tooltip: {
                formatter: function () {
                  return $filter('date')(this.x, 'MM-dd HH:mm:ss') + '<br>' + this.y.toFixed(2);
                }
              },
            },
            xAxis: {
              type: 'datetime',
              labels: {
                formatter: function () {
                  return $filter('date')(this.value, 'MM-dd') +'<br>' + $filter('date')(this.value, 'HH:mm:ss');
                }
              }
            },
            yAxis: {
              title: false,
              min:60
            },
            series: [{
              name: '驾驶习惯指数',
              data: vm.speedList
            }]
          }
        });
      }, 2500 );

      $timeout(function () {
        if(vm.avgOilWear>0){
          vm.itemList.push({
            title : vm.oilWearLabelTitle ,
            isSelected:false,
            backgroundColor: itemColorList[4],
            marginLeft: itemLeftList[4],
            chart: {
              options:{
                chart: {
                  type: 'line'
                },
                credits: {
                  enabled: false
                },
                exporting: {
                  enabled: false
                },
                legend: {
                  enabled: false
                },
                title: {
                  text: '平均油耗'
                },
                tooltip: {
                  formatter: function () {
                    return $filter('date')(this.x, 'MM-dd') + '<br>' + this.y.toFixed(2);
                  }
                },
              },
              xAxis: {
                type: 'datetime',
                labels: {
                  formatter: function () {
                    return $filter('date')(new Date(this.value), 'MM-dd');
                  }
                }
              },
              yAxis: {
                title: {
                  text: '油耗 (L/H)'
                },
                min: 0,
                max: 10,
                alternateGridColor: null,
                plotBands: [{ // Light
                  from: 0.5,
                  to: 2.5,
                  color: 'rgba(68, 170, 213, 0.1)',
                  label: {
                    text: '低油耗',
                    style: {
                      color: '#606060'
                    }
                  }
                },{ // Gentle breeze
                  from: 5,
                  to: 7.5,
                  color: 'rgba(68, 170, 213, 0.1)',
                  label: {
                    text: '高油耗',
                    style: {
                      color: '#606060'
                    }
                  }
                }]
              },
              series: [{
                name: '油耗',
                data: vm.oilWearList
              }]
            }
          });
        }
      }, 3000 );

    }

    vm.chargeChart = function (chart) {
      vm.portraitChart = chart;
    }

    vm.itemMousedown = function (item) {
      item.isSelected = true;
    }

    vm.itemMouseup = function (item) {
      item.isSelected = false;
    }

    //机器画像 发动机性能chart
    vm.enginePerformsChart = {
      options:{
        chart: {
          polar: true,
          type: 'line'
        },
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        legend: {
          enabled: false
        },
      },
      title: {
        text: '发动机性能',
        x: -80
      },
      pane: {
        size: '80%'
      },
      xAxis: {
        categories: ['油耗', '温度', '扭矩指数', '功率指数',
          '转速指数', '平均故障时间间隔'],
        tickmarkPlacement: 'on',
        lineWidth: 0
      },
      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 110
      },
      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
      },
      series: [{
        name: '评分',
        data: [80, 97, 83, 72, 67, 95],
        pointPlacement: 'on'
      }]
    }

    //机器画像 发动机评分chart
    vm.engineScoreChart = {
      options:{
        chart: {
          type: 'solidgauge',
          //backgroundColor: '#FCFFC5',
          width: 400,
          height: 200
        },
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        title: {
          text: '发动机评分'
        },
        pane: {
          center: ['50%', '85%'],
          size: '170%',
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },
        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: -50,
              borderWidth: 0,
              useHTML: true
            }
          }
        }
      },
      tooltip: {
        enabled: false
      },
      // the value axis
      yAxis: {
        min: 0,
        max: 100,
        stops: [
          [0.1, '#55BF3B'], // green
          [0.5, '#DDDF0D'], // yellow
          [0.9, '#DF5353'] // red
        ],
        lineWidth: 0,
        minorTickInterval: null,
        tickPixelInterval: 400,
        tickWidth: 0,
        // title: {
        //   text: '发动机评分',
        //   y: -70
        // },
        labels: {
          y: 16
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        name: '发动机评分',
        data: [80],
        dataLabels: {
          format: '<div style="text-align:center"><span style="font-size:25px;">{y}</span><br/>'
        }
      }]
    }


  }
})();
