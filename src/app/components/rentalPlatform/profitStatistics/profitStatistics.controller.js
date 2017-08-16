/**
 * Created by mengwei on 17-7-31.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('profitStatisticsController', profitStatisticsController);

  /** @ngInject */
  function profitStatisticsController($scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, serviceResource, DEVCE_HIGHTTYPE, Notification,RENTAL_ASSET_STATISTICS_DATA_URL) {
    var vm = this;


    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    $scope.navs = [{
      "title": "income", "icon": "fa-map"
    }, {
      "title": "Cost", "icon": "fa-signal"
    }, {
      "title": "profit", "icon": "fa-exclamation-triangle"
    }];
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 -150- 10 - 25 - 5  - 15 - 20;//50 topBar的高,10间距,25面包屑导航,5间距90msgBox高,15间距,20 search;line
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      var baseBoxContainerHeight = baseBoxContainerHeight - 45;//地图上方的header高度
      //地图的自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      vm.baseBoxContainerHeight = baseBoxContainerHeight;
    }

    //初始化高度
    vm.adjustWindow($window.innerHeight);

    /**
     * 监听窗口大小改变后重新自适应高度
     */
    $scope.$watch('height', function (oldHeight, newHeight) {
      vm.adjustWindow(newHeight);
      profitBar.resize({height: vm.baseBoxContainerHeight});
    })

    window.onresize = function () {
      profitBar.resize();
    }


    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    }


    vm.type = 'all';
    vm.typeList = ['All', '剪叉', '直臂', '曲臂'];

    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error('获取高度类型失败');
    })

    vm.Brand = 'all'
    vm.BrandList = ['brand1', 'brand2', 'brand3'];

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
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


    vm.search = function () {

    }


    //profit
    var profitBar = echarts.init(document.getElementById('profitBar'));
    var profitBarOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['剪叉', '直臂', '曲臂']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      yAxis: {
        type: 'value'
      },
      xAxis: {
        type: 'category',
        data: ['周一周', '周二周', '周三周', '周四周', '周五周', '周六周']
      },
      series: [
        {
          name: '剪叉',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [320, 302, 301, 334, 390, 330]
        },
        {
          name: '直臂',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [120, 132, 101, 134, 90, 230]
        },
        {
          name: '曲臂',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [220, 182, 191, 234, 290, 330]
        }
      ]
    };
    profitBar.setOption(profitBarOption);


    var incomeStatisticInfo = {
      totalMachines: 0,
      totalOrders: 0,
    };

    var rspdata = serviceResource.restCallService(RENTAL_ASSET_STATISTICS_DATA_URL, "GET");
    rspdata.then(function (data) {

      var MachineStatisticsList = data.machineStatistics;
      MachineStatisticsList.forEach(function (machineStatistics) {
        incomeStatisticInfo.totalMachines += machineStatistics.machineNumber
      })
     //console.log(incomeStatisticInfo.totalMachines);
      var RentalOrderStatisticsList = data.rentalOrderStatistics;
      RentalOrderStatisticsList.forEach(function (rentalOrderStatistics) {
        incomeStatisticInfo.totalOrders += rentalOrderStatistics.rentalOrderNumber
      })
      //console.log(incomeStatisticInfo.totalOrders);
    }, function (reason) {
      Notification.error('获取收入统计信息失败');
    })

  vm.incomeStatisticInfo = incomeStatisticInfo;

}
})();
