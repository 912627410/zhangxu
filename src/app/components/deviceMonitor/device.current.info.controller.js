/**
 * Created by shuangshan on 16/1/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceCurrentInfoController', DeviceCurrentInfoController);

  /** @ngInject */
  function DeviceCurrentInfoController($rootScope,$scope,$timeout,$confirm,$filter,$uibModalInstance,permissions,languages,serviceResource,Notification,
                                       DEVCE_MONITOR_SINGL_QUERY, DEVCE_DATA_PAGED_QUERY,DEVCE_WARNING_DATA_PAGED_QUERY,AMAP_QUERY_TIMEOUT_MS,
                                       AMAP_GEO_CODER_URL,DEIVCIE_UNLOCK_FACTOR_URL,VIEW_KEYBOARD_MSG_URL,VIEW_SMS_URL,SEND_SMS_URL,deviceinfo) {
    var vm = this;
    var userInfo = $rootScope.userInfo;

    //刷新当前页面
    vm.refreshCurrentDeviceInfo = function (id){
      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {

        vm.controllerInitialization(data.content);

        if(vm.highchartsAir !=null){

          vm.highchartsAir.series[0].data=[vm.deviceinfo.pressureMeter];
        }
        if(vm.highchartsWater !=null){

          vm.highchartsWater.series[0].data=[vm.deviceinfo.engineTemperature];
        }
        if(vm.highchartsRpm !=null){

          vm.highchartsRpm.series[0].data=[vm.deviceinfo.enginRotate];
        }
        if(vm.highchartsOil !=null){

          vm.highchartsOil.series[0].data=[vm.deviceinfo.oilLevel];
        }



        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
    }

    //初始化controller
    vm.controllerInitialization = function (deviceinfo){
      vm.deviceinfo = deviceinfo;
      vm.deviceinfo.produceDate = new Date(deviceinfo.produceDate);  //必须重新生成date object，否则页面报错
      //因无指示灯图标，alertStatus暂时显示为16进制，后续调整
      vm.deviceinfo.alertStatus = parseInt(vm.deviceinfo.alertStatus,2);
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
      vm.enginRotate= vm.deviceinfo.enginRotate;
      //充电指示灯
      vm.charge = vm.deviceinfo.ledStatus.substring(0,1);
      //中央报警
      vm.centerCode='0';
      //机油压力指示灯
      vm.engineOilPressure=vm.deviceinfo.ledStatus.substring(28,29);
      //制动指示灯
      vm.parkingBrake= vm.deviceinfo.ledStatus.substring(6,7);

      if(vm.enginRotate>500 && vm.charge =="1" && vm.engineOilPressure =="1"){
        vm.centerCode='1';
      }
      if(vm.enginRotate>1000 && vm.parkingBrake=="1"){
        vm.centerCode='1';
      }

      console.log( vm.centerCode);
      //根据中挖协议修改
      if(vm.deviceinfo.voltageHigthAlarmValue != 0){
        vm.deviceinfo.voltageHigthAlarmValue = vm.deviceinfo.voltageHigthAlarmValue*0.1 +10;
      }
      if(vm.deviceinfo.voltageLowAlarmValue != 0){
        vm.deviceinfo.voltageLowAlarmValue = vm.deviceinfo.voltageLowAlarmValue*0.1 +10;
      }
      //改为过滤器
      //vm.deviceinfo.totalDuration = serviceResource.convertToMins(vm.deviceinfo.totalDuration);
      //vm.deviceinfo.realtimeDuration = serviceResource.convertToMins(vm.deviceinfo.realtimeDuration);
      vm.deviceinfo.engineTemperature = parseInt(vm.deviceinfo.engineTemperature); //
      //TODO 原来根据车架号判断，由于增加了临沃的车，需要根据deviceNum来判断当前设备是否是小挖,装载机，矿车
      //如果车架号不为空就根据车架号来判断车辆类型,判断出来不为小挖返回null，再根据vserionNum判断
      if (deviceinfo.machine == null || null ==deviceinfo.machine.licenseId){
        vm.DeviceType=null;
      }else{
        vm.DeviceType = serviceResource.getDeviceType(deviceinfo.machine.licenseId);
      }
      //如果上面没有判断出来，versionNum也不为空，就根据deviceNum来判断车辆类型
      if (vm.DeviceType==null){
        if(deviceinfo.versionNum!=null){
          vm.DeviceType = serviceResource.getDeviceTypeForVersionNum(deviceinfo.versionNum);
        }else {
          vm.DeviceType = serviceResource.getDeviceType(null);
        }
      }

    }

    vm.controllerInitialization(deviceinfo);


    //气压图
    vm.highchartsAir = {
      options: {
        chart: {
          type: 'solidgauge'
        },

        title: languages.findKey('barometricPressure')+'',
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
            text: languages.findKey('barometricPressure')+''
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
      title: languages.findKey('barometricPressure')+'',
      series: [{
        name: languages.findKey('barometricPressure')+'',
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

    //水温图
    vm.highchartsWater = {
      options: {
        chart: {
          type: 'solidgauge'
        },

        title: languages.findKey('waterTemperature')+'',
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
            text: languages.findKey('waterTemperature')+''
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
      title: languages.findKey('waterTemperature')+'',
      series: [{
        name: languages.findKey('waterTemperature')+'',
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
            text: languages.findKey('rotatingSpeed')+'(r/min)'
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
        name: languages.findKey('rotatingSpeed')+'',
        data: [vm.deviceinfo.enginRotate],
        tooltip: {
          valueSuffix: languages.findKey('turn')+''
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
        title: languages.findKey('Oil')+'',

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
            text: languages.findKey('Oil')+''
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
      title: languages.findKey('Oil')+'',
      series: [{
        name: languages.findKey('Oil')+'',
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
    //现在废弃
    vm.refreshDOM = function() {
      setTimeout(function(){
        vm.setDefaultAddress();
        $scope.$apply();
      }, AMAP_QUERY_TIMEOUT_MS);
    };

    vm.setDefaultAddress = function(){
      if (vm.deviceDataList != null){
        vm.deviceDataList.forEach(function (deviceData) {
          if (deviceData.address === languages.findKey('requestingLocationData')+'...'){
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
          angular.forEach(vm.deviceDataList,function (data) {
            //因无指示灯图标，alertStatus暂时显示为16进制，后续调整
            data.alertStatus = parseInt(data.alertStatus,2);
            data.alertStatus = data.alertStatus.toString(16).toUpperCase();
            data.ecuLockStatusDesc='';
            if (data.ecuLockStatus.substr(7,1) == "0"){
              data.ecuLockStatusDesc += "未激活";
            }
            else{
              data.ecuLockStatusDesc += "已激活";
            }
            if(data.voltageHigthAlarmValue != 0){
              data.voltageHigthAlarmValue = data.voltageHigthAlarmValue*0.1 +10;
            }
            if(data.voltageLowAlarmValue != 0){
              data.voltageLowAlarmValue = data.voltageLowAlarmValue*0.1 +10;
            }
          });
          if (vm.deviceDataList.length == 0){
            Notification.warning(languages.findKey('deviceIsNotHistoricalDataForThisTimePeriodPleaseReselect'));
          }
        }, function (reason) {
          Notification.error(languages.findKey('historicalDataAcquisitionDeviceFailure'));
        }
      )
      //vm.refreshDOM();
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
            Notification.warning(languages.findKey('theDeviceDoesNotAlarmThisTimePeriodPleaseReselect'));
          }
          else{
            vm.deviceWarningDataList.forEach(function (deviceWarningData) {
              deviceWarningData.warningMsg = serviceResource.getWarningMsg(deviceWarningData,vm.DeviceType);
            })
          }
        }, function (reason) {
          Notification.error(languages.findKey('getTheEquipmentFailureAlarmInformation'));
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
        serviceResource.refreshMapWithDeviceInfo("deviceDetailMap",deviceInfoList,4,centerAddr);
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
/*****************     第一部分，动画暂停、继续的实现 通过自定义一个控件对象来控制位置变化    ********************/
    /**
     * Marker移动控件
     * @param {Map} map    地图对象
     * @param {Marker} marker Marker对象
     * @param {Array} path   移动的路径，以坐标数组表示
     */
    var MarkerMovingControl = function(map, marker, path) {
      this._map = map;
      this._marker = marker;
      this._path = path;
      this._currentIndex = 0;
      marker.setMap(map);
      marker.setPosition(path[0]);
    }

    /**
     * 移动marker，会从当前位置开始向前移动
     */
    MarkerMovingControl.prototype.move = function() {
      if (!this._listenToStepend) {
        this._listenToStepend = AMap.event.addListener(this, 'stepend', function() {
          this.step();
        }, this);
      }
      this.step();
    };

    /**
     * 向前移动一步
     */
    MarkerMovingControl.prototype.step = function(){
      var nextIndex = this._currentIndex + 1;
      if (nextIndex < this._path.length) {
        if (!this._listenToMoveend) {
          this._listenToMoveend = AMap.event.addListener(this._marker, 'moveend', function(){
            this._currentIndex++;
            AMap.event.trigger(this, 'stepend');
          }, this);
        }
        // console.log(nextIndex);
        this._marker.moveTo(this._path[nextIndex], 800);
      }
    };

/*******************                        结束                          **/

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
          /*AMap.event.addDomListener(document.getElementById('pause'), 'click', function () {
            console.log("暂停动画");
            vm.markerMovingControl._marker.stopMove();
          }, false);*/
          AMap.event.addDomListener(document.getElementById('move'), 'click', function () {
            /**继续动画"*/
            vm.markerMovingControl.move();
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
            /********     创建移动控件       */
            vm.markerMovingControl = new MarkerMovingControl(map, marker, lineArr);
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
            Notification.warning(languages.findKey('deviceIsNotHistoricalDataForThisTimePeriodPleaseReselect'));
          }
          else{
            vm.deviceMapDataList = _.sortBy(deviceMapDataList,"locateDateTime");
            vm.deviceMapDataList.forEach(function (deviceData) {
              lineArr.push([deviceData.amaplongitudeNum,deviceData.amaplatitudeNum]);
            })
            vm.refreshMapTab(lineArr);
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
    if (vm.workHours != null){
      vm.workHours = vm.workHours.replace(/,/g, '');  //去掉千位分隔符
    }


    //设置ECU 锁车状态 描述
    vm.ecuLockStatusDesc = "";
    if (vm.deviceinfo.ecuLockStatus != null){
      if (vm.deviceinfo.ecuLockStatus.length == 8){
        if (vm.deviceinfo.ecuLockStatus.substr(7,1) == "0"){
          vm.ecuLockStatusDesc += "未激活";
        }
        else{
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

    if(permissions.getPermissions("device:remoteControl")) {

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
    //检查短信参数
    vm.checkParam = function(type,devicenum,host,port,startTimes,workHours,secOutsidePower,secLocateInt,secInnerPower){
      if (type == null || devicenum == null){
        return false;
      }
      //type == 5表示设置回传地址
      if (type == 5 && (host == null || port==null)){
        return false;
      }
      //type == 6表示设置启动次数
      if (type == 6 && startTimes == null){
        return false;
      }
      //type == 7表示设置工作小时数
      if (type == 7 && workHours == null){
        return false;
      }
      //type == 8表示设置各间隔时间
      if (type == 8 && (secOutsidePower == null || secLocateInt==null || secInnerPower==null)){
        return false;
      }
      return true;
    }

    //将短信赋值给相应的变量
    vm.assginSMSContent = function(type, sms){
      if(type==1){
        vm.activeMsg = sms;
      }
      else if(type==2){
        vm.unActiveMsg = sms;
      }
      else if(type==3){
        vm.lockMsg = sms;
      }
      else if(type==4){
        vm.unLockMsg = sms;
      }
      else if(type==5){
        vm.setIpMsg = sms;
      }
      else if(type==6){
        vm.setStartTImesMsg = sms;
      }
      else if(type==7){
        vm.setWorkHoursMsg = sms;
      }
      else if(type==8){
        vm.setWorkIntMsg = sms;
      }
    }

    //得到短信内容
    vm.viewSMS = function(type,devicenum,host,port,startTimes,workHours,secOutsidePower,secLocateInt,secInnerPower){
      if (vm.checkParam(type,devicenum,host,port,startTimes,workHours,secOutsidePower,secLocateInt,secInnerPower) ==  false){
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = VIEW_SMS_URL + "?type=" + type + "&devicenum=" + vm.deviceinfo.deviceNum;
      if (type == 5){
        restURL += "&host=" + host + "&port=" + port;
      }
      else if (type == 6){
        restURL += "&startTimes=" + startTimes;
      }
      else if (type == 7){
        restURL += "&workHours=" + workHours;
      }
      else if (type == 8){
        restURL += "&secOutsidePower=" + secOutsidePower + "&secLocateInt=" + secLocateInt + "&secInnerPower=" + secInnerPower;
      }
      var rspData = serviceResource.restCallService(restURL, "GET");
      rspData.then(function (data) {
        vm.assginSMSContent(type,data.content);
      }, function (reason) {
        Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
      })
    }

    //发送短信
    vm.sendSMS = function(type,devicenum,host,port,startTimes,workHours,secOutsidePower,secLocateInt,secInnerPower) {
      if (vm.checkParam(type, devicenum, host, port, startTimes, workHours, secOutsidePower, secLocateInt, secInnerPower) == false) {
        Notification.error(languages.findKey('pleaseProvideTheParametersToBeSet'));
        return;
      }
      var restURL = SEND_SMS_URL + "?type=" + type + "&devicenum=" + vm.deviceinfo.deviceNum;
      if (type == 5) {
        restURL += "&host=" + host + "&port=" + port;
      }
      else if (type == 6) {
        restURL += "&startTimes=" + startTimes;
      }
      else if (type == 7) {
        restURL += "&workHours=" + workHours;
      }
      else if (type == 8) {
        restURL += "&secOutsidePower=" + secOutsidePower + "&secLocateInt=" + secLocateInt + "&secInnerPower=" + secInnerPower;
      }
      $confirm({text: languages.findKey('youSureYouWantToSendThisMessage')+'', title: languages.findKey('SMSConfirmation')+'', ok: languages.findKey('confirm')+'', cancel: languages.findKey('cancel')+''})
        .then(function () {
          var rspData = serviceResource.restCallService(restURL, "ADD", null);  //post请求
          rspData.then(function (data) {
            if (data.code == 0 && data.content.smsStatus == 0) {
              vm.assginSMSContent(type,data.content.smsContent);
              Notification.success(data.content.resultDescribe);
            }
            else {
              Notification.error(data.content.resultDescribe);
            }
          }, function (reason) {
            Notification.error(languages.findKey('messageSendFiled'));
          })
        });
    }

    //将键盘信息赋值给相应的变量
    vm.assginKeyboardContent = function(type, message){
      if(type==10){
        vm.bindKeyboardMsg = message;
        if (message) {
          vm.bindKeyboardMsgIdx = message.substr(17, 1) + message.substr(22, 1);
        }
      }
      else if(type==11){
        vm.unbindKeyboardMsg = message;
        //解绑从50往后倒数,因为GPS设备程序bug
        if (message) {
          var idxTmp = message.substr(5, 1) + message.substr(10, 1);
          vm.unbindKeyboardMsgIdx = 50 - idxTmp;
        }
      }
      else if(type==12){
        vm.lockKeyboardMsg = message;
        if (message) {
          vm.lockKeyboardMsgIdx = message.substr(5, 1) + message.substr(10, 1);
        }
      }
      else if(type==13){
        vm.unLockKeyboardMsg = message;
        if (message) {
          vm.unLockKeyboardMsgIdx = message.substr(5, 1) + message.substr(10, 1);
        }
      }
      else if(type==14){
        vm.cancelLockKeyboardMsg = message;
        if (message){
          vm.cancelLockTimes = message.substr(3,1) + message.substr(8,1);
        }
      }
    }


    vm.cancelLockTimes = "";
    //得到键盘输入内容
    vm.viewKeyboardMsg = function(type,devicenum){
      $confirm({text: languages.findKey('ConfirmMsgViewKeyInput')+'', title: languages.findKey('ViewKeyInputConfirmation')+'', ok: languages.findKey('confirm')+'', cancel: languages.findKey('cancel')+''})
        .then(function () {
          var restURL = VIEW_KEYBOARD_MSG_URL + "?type=" + type + "&devicenum=" + vm.deviceinfo.deviceNum;
          var rspData = serviceResource.restCallService(restURL, "GET");
          rspData.then(function (data) {
            vm.assginKeyboardContent(type, data.content);
          }, function (reason) {
            Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
          })
        })

    }

    vm.validateMonitorShowPermission=function(){
      return permissions.getPermissions("device:monitorShow");
    }

  }
})();
