/**
 * Created by mengwei on 17-7-31.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('profitStatisticsController', profitStatisticsController);

  /** @ngInject */
  function profitStatisticsController($scope,$rootScope, $window, $filter,$location, $anchorScroll, serviceResource, DEVCE_HIGHTTYPE, Notification,RENTAL_ASSET_STATISTICS_DATA_URL,USER_MACHINE_TYPE_URL,DEVCE_MF,RENTAL_PROFIT_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    var xAxisDate = [];
    var jcProfitDate = [];
    var zbProfitDate = [];
    var qbProfitDate = [];

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



    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error('获取高度类型失败');
    })


    var deviceMFUrl = DEVCE_MF + "?search_EQ_status=1";
    var deviceMFData = serviceResource.restCallService(deviceMFUrl, "GET");
    deviceMFData.then(function (data) {
      vm.machineMFList = data.content;
    }, function (reason) {
      Notification.error('获取厂商失败');
    })


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
        data: xAxisDate
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
          data: jcProfitDate
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
          data: zbProfitDate
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
          data: qbProfitDate
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


    vm.queryProfit = function (queryStartData,queryEndData) {

      var xAxisDate = [];
      var jcProfitDate = [];
      var zbProfitDate = [];
      var qbProfitDate = [];

      var restCallURL = RENTAL_PROFIT_URL;
      restCallURL += "?startDate=" + $filter('date')(queryStartData,'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(queryEndData,'yyyy-MM-dd');

      if (null != vm.queryDeviceHeightType&&vm.queryDeviceHeightType!="") {
        restCallURL += "&heightTypeId=" +vm.queryDeviceHeightType;
      }
      if (null != vm.queryManufacture&&vm.queryManufacture!="") {
        restCallURL += "&machineManufacture=" +vm.queryManufacture;
      }
      if (null != vm.machineType&&vm.machineType != ""){
        restCallURL += "&machineType=" + vm.machineType;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.profitData = data.content;
        for(var i = 0;i<vm.profitData.length;i++){
          xAxisDate.push($filter('date')(vm.profitData[i].statisticalCycle, 'yyyy-MM-dd'));
          jcProfitDate.push(vm.profitData[i].jcProfit);
          zbProfitDate.push(vm.profitData[i].zbProfit);
          qbProfitDate.push(vm.profitData[i].qbProfit);
        }
        console.log(profitBarOption.xAxis[0])
        profitBarOption.xAxis.data = xAxisDate;
        profitBarOption.series[0].data = jcProfitDate;
        profitBarOption.series[1].data = zbProfitDate;
        profitBarOption.series[2].data = qbProfitDate;
        profitBar.setOption(profitBarOption);
      },function (reason) {
        Notification.error("获取利润数据失败")
      })
    }

}
})();
