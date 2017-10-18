/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('costStatisticsController', costStatisticsController);

  /** @ngInject */
  function costStatisticsController($scope,$rootScope, $window, $location, $anchorScroll, NgTableParams, languages,ngTableDefaults,$filter, serviceResource,DEVCE_HIGHTTYPE,MACHINE_DEVICETYPE_URL,DEVCE_MF,Notification,RENTAL_COST_PAGED_URL,DEFAULT_MINSIZE_PER_PAGE,RENTAL_TOTALCOST_URL) {
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

    vm.totalCost = 0;
    vm.rentalSaleCost =0;
    vm.rentalManagementCost = 0;
    vm.rentalFinanceCost = 0;
    vm.rentalMachineCost = 0;

    vm.queryCostTotal = function () {

      var costTotalURL = RENTAL_TOTALCOST_URL ;
      var queryDate = new Date();
      costTotalURL += "?queryDate=" + $filter('date')(queryDate,'yyyy-MM-dd');
      var costTotalData = serviceResource.restCallService(costTotalURL, "GET");
      costTotalData.then(function (data) {
        var costTotalData = data.content;
        if(null!=costTotalData.machineCost&&costTotalData.machineCost!=''){
          vm.rentalMachineCost = costTotalData.machineCost;
        }
        if(null!=costTotalData.salesExpenses&&costTotalData.salesExpenses!=''){
          vm.rentalSaleCost =costTotalData.salesExpenses;
        }
        if(null!=costTotalData.managementCost&&costTotalData.managementCost!=''){
          vm.rentalManagementCost = costTotalData.managementCost;
        }
        if(null!=costTotalData.financialExpenses&&costTotalData.financialExpenses!=''){
          vm.rentalFinanceCost = costTotalData.financialExpenses;
        }

        vm.totalIncome = vm.rentalSaleCost + vm.rentalManagementCost + vm.rentalFinanceCost +  vm.rentalMachineCost ;

      }, function (reason) {
        Notification.error('获取失败');
      })

    }
    vm.queryCostTotal();

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
      Notification.error('获取高度类型失败');
    })

    //查询厂商List
    var deviceMFUrl = DEVCE_MF + "?search_EQ_status=1";
    var deviceMFData = serviceResource.restCallService(deviceMFUrl, "GET");
    deviceMFData.then(function (data) {
      vm.machineMFList = data.content;
    }, function (reason) {
      Notification.error('获取厂商失败');
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
        Notification.error("请选择开始时间或者结束时间");
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


        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          vm.tableParams = new NgTableParams({
            // initial sort order
            // sorting: { name: "desc" }
          }, {
            dataset: data.content
          });
          vm.page = data.page;
          vm.pageNumber = data.page.number + 1;
        },function (reason) {
          Notification.error("获取成本数据失败")
        })
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
            {value:335, name:languages.findKey('rentalMachineCost'), selected:true},
            {value:679, name:languages.findKey('rentalSaleCost')},
            {value:1548, name:languages.findKey('rentalManagementCost')},
            {value:666, name:languages.findKey('rentalFinanceCost')}
          ]
        }
      ]
    };
    topPie.setOption(topPieOption);




  }
})();
