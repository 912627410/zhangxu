/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMachineMngController', rentalMachineMngController);

  /** @ngInject */
  function rentalMachineMngController($rootScope, $scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, languages,serviceResource,Notification, RENTAL_HOME_MAP_GPSDATA_URL) {
    var vm = this;
    vm.currentPage = 1;
    //定义页面导航
    $scope.navs = [{
      "title": "currentLocation", "icon": "fa-map"
    }, {
      "title": "currentStatus", "icon": "fa-signal"
    }, {
      "title": "machineAlarmInfo", "icon": "fa-exclamation-triangle"
    }];
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 7;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      var baseBoxMapContainerHeight = baseBoxContainerHeight - 45;//地图上方的header高度
      //地图的自适应高度
      vm.baseBoxMapContainer = {
        "min-height": baseBoxMapContainerHeight + "px"
      }

    }
    vm.adjustWindow($window.innerHeight);
    /**
     * 初始化地图
     */
    vm.loadHomeDeviceData = function () {
      var rspdata = serviceResource.restCallService(RENTAL_HOME_MAP_GPSDATA_URL, "GET");
      rspdata.then(function (data) {
        vm.drawPointAggregation("homeMap", data.content, 4);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }
    /**
     * 点聚合绘制
     * @param mapId 页面上地图的id
     * @param pointArray 点集合
     * @param zone 缩放级别
     */
    vm.drawPointAggregation = function (mapId, pointArray, zone) {

    };

    vm.loadHomeDeviceData();

    /**
     * 监听窗口大小改变后重新自适应高度
     */
    $scope.$watch('height', function (oldHeight, newHeight) {
      vm.adjustWindow(newHeight);
      barChart.resize({height: barChartHeight});
    })

    /**
     * 根据类型获取报警信息的数量
     * @param type
     */
    vm.getAlarmCountByType = function (alarmType) {

      return 0;
    }


    var barChartHeight = $window.innerHeight - 50 - 15 - 90 - 15 - 7 - 45 - 90 - 90 + 'px';

    var barChart = echarts.init(document.getElementById('machineBarChart'), '', {
      width: 'auto',
      height: barChartHeight
    });

    var option = {
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '直接访问',
          type: 'bar',
          barWidth: '60%',
          data: [10, 52, 200, 334, 390, 330, 220]
        }
      ]
    };

    barChart.setOption(option);


  }
})();
