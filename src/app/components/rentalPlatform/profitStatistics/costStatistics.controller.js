/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('costStatisticsController', costStatisticsController);

  /** @ngInject */
  function costStatisticsController($scope,$rootScope, $window, $location, $anchorScroll, NgTableParams, languages,ngTableDefaults,$filter, serviceResource,DEVCE_HIGHTTYPE,USER_MACHINE_TYPE_URL,DEVCE_MF,Notification,RENTAL_COST_PAGED_URL,DEFAULT_MINSIZE_PER_PAGE,MACHINE_DEVICETYPE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.queryCost = {};



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
      var baseBoxContainerHeight = windowHeight - 50 -5 - 25 - 52  - 60-50 ;//50 topBar的高,5间距,25面包屑导航,52msgBox高,60 search;line
      //baseBox自适应高度
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
       //topPie.resize({height: vm.baseBoxContainerHeight});
    })


    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    }

    //开始时间,结束时间
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
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
    /**
     * 得到机器类型集合
     */
    var machineTypeData = serviceResource.restCallService(MACHINE_DEVICETYPE_URL, "GET");
    machineTypeData.then(function (data) {
      vm.machineTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('rentalGetDataError'));
    })

    //查询高度类型
    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getHtFail'));
    })

    //查询厂商List
    var deviceMFUrl = DEVCE_MF + "?search_EQ_status=1";
    var deviceMFData = serviceResource.restCallService(deviceMFUrl, "GET");
    deviceMFData.then(function (data) {
      vm.machineMFList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getVendorFail'));
    })

    //重置搜索框
   vm.reset = function () {
     vm.machineType = null;
     vm.queryDeviceHeightType = null;
     vm.queryManufacture = null;
     vm.startDateDeviceData = null;
     vm.endDateDeviceData = null;
   }


    vm.queryCost = function (page, size, sort,startDate,endDate) {
      if(startDate==null||endDate==null){
        Notification.error(languages.findKey('selSEtime'));
      }
      if(null!=startDate&&null!=endDate){
        var restCallURL = RENTAL_COST_PAGED_URL;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
        var sortUrl = sort || 'id';
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        restCallURL += "&startDate=" + $filter('date')(startDate,'yyyy-MM-dd');
        restCallURL += "&endDate=" + $filter('date')(endDate,'yyyy-MM-dd');


        if (null != vm.queryDeviceHeightType&&vm.queryDeviceHeightType!="") {
          restCallURL += "&heightTypeId=" +vm.queryDeviceHeightType.id;
        }
        if (null != vm.queryManufacture&&vm.queryManufacture!="") {
          restCallURL += "&machineManufacture=" +vm.queryManufacture.id;
        }
        if (null != vm.machineType&&vm.machineType != ""){
          restCallURL += "&machineType=" + vm.machineType;
        }


        // var rspData = serviceResource.restCallService(restCallURL, "GET");
        // rspData.then(function (data) {
        //   vm.tableParams = new NgTableParams({
        //     // initial sort order
        //     // sorting: { name: "desc" }
        //   }, {
        //     dataset: data.content
        //   });
        //   vm.page = data.page;
        //   vm.pageNumber = data.page.number + 1;
        // },function (reason) {
        //   Notification.error("获取成本数据失败")
        // })


        //TVH Demo需要，先在js里面造假数据，后面需要去掉  by mengwei on 2017-10-16---start---
        var data = {content:[{artificialCost: 20,
          depreciationCost: 410.7,
          financialExpenses: null,
          heightTypeName: "0-8米",
          machineCost: 530.7,
          machineLicenseId: "H05024197",
          machineManufacture: "临工重机",
          machineTypeName: "剪叉",
          maintenanceCost: 100,
          managementCost: null,
          salesExpenses: null},{artificialCost: 20,
          depreciationCost: 410.7,
          financialExpenses: null,
          heightTypeName: "0-8米",
          machineCost: 460,
          machineLicenseId: "H05000536",
          machineManufacture: "临工重机",
          machineTypeName: "剪叉",
          maintenanceCost: 100,
          managementCost: null,
          salesExpenses: null},{artificialCost: 20,
          depreciationCost: 410.7,
          financialExpenses: null,
          heightTypeName: "0-8米",
          machineCost: 530.7,
          machineLicenseId: "H05010407",
          machineManufacture: "临工重机",
          machineTypeName: "剪叉",
          maintenanceCost: 100,
          managementCost: null,
          salesExpenses: null},{artificialCost: 20,
          depreciationCost: 410.7,
          financialExpenses: null,
          heightTypeName: "0-8米",
          machineCost: 350,
          machineLicenseId: "H05000601",
          machineManufacture: "临工重机",
          machineTypeName: "剪叉",
          maintenanceCost: 100,
          managementCost: null,
          salesExpenses: null},{artificialCost: 20,
          depreciationCost: 410.7,
          financialExpenses: null,
          heightTypeName: "0-8米",
          machineCost: 350,
          machineLicenseId: "H05000601",
          machineManufacture: "临工重机",
          machineTypeName: "剪叉",
          maintenanceCost: 100,
          managementCost: null,
          salesExpenses: null},{artificialCost: 20,
          depreciationCost: 410.7,
          financialExpenses: null,
          heightTypeName: "0-8米",
          machineCost: 642,
          machineLicenseId: "H05000608",
          machineManufacture: "临工重机",
          machineTypeName: "剪叉",
          maintenanceCost: 100,
          managementCost: null,
          salesExpenses: null},{artificialCost: 20,
          depreciationCost: 410.7,
          financialExpenses: null,
          heightTypeName: "0-8米",
          machineCost: 150,
          machineLicenseId: "H05000644",
          machineManufacture: "临工重机",
          machineTypeName: "剪叉",
          maintenanceCost: 100,
          managementCost: null,
          salesExpenses: null}],
          page:{number: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1}

        }
          vm.tableParams = new NgTableParams({
            // initial sort order
            // sorting: { name: "desc" }
          }, {
            dataset: data.content
          });
          vm.page = data.page;
          vm.pageNumber = data.page.number + 1;

        //TVH Demo需要，先在js里面造假数据，后面需要去掉  by mengwei on 2017-10-16---end---
      }

    }

    //默认查询最近一个月
    vm.queryCost(null,null,null,vm.startDate,vm.endDate);


    //cost
    var topPie =  echarts.init(document.getElementById('topPie'),'', {
      width: 'auto',
      height: vm.baseBoxContainerHeight - 20 + 'px'
    });
    //var topPie =  echarts.init(document.getElementById('topPie'));
    var topPieOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data:[languages.findKey('rentalMachineCost'),languages.findKey('rentalSaleCost'),languages.findKey('rentalManagementCost'),languages.findKey('rentalFinanceCost')]
      },
      series: [
        {
          name:'成本',
          type:'pie',
          selectedMode: 'single',
          radius: '60%',
          data:[
            {value:3013.4, name:languages.findKey('rentalMachineCost'), selected:true},
            {value:2850, name:languages.findKey('rentalSaleCost')},
            {value:2600, name:languages.findKey('rentalManagementCost')},
            {value:1500, name:languages.findKey('rentalFinanceCost')}
          ]
        }
      ]
    };
    topPie.setOption(topPieOption);




  }
})();
