/**
 * @author xielong.wang
 * @date 2017/7/21.
 * @description 车辆当前状态controller
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineCurrentStatusController', machineCurrentStatusController);

  /** @ngInject */
  function machineCurrentStatusController($rootScope, $scope, $window, $location, $anchorScroll,$uibModal, NgTableParams, ngTableDefaults, languages, serviceResource, commonFactory, Notification, RENTAL_MACHINE_COUNT_URL,
                                          RENTAL_MACHINE_DATA_URL,RENTAL_MACHINE_MONITOR_URL,RENTAL_MACHINE_URL,MACHINE_DEVICETYPE_URL) {
    var vm = this;
    ngTableDefaults.params.count = 40;//表格中每页展示多少条数据
    ngTableDefaults.settings.counts = [];//取消ng-table的默认分页
    //定义车辆状态数量 6:"在库维修"7:"在库待租"8:"途中"9:"出租中"10:"现场报停" (6~10租赁平台使用)
    vm.machineCount = 0;//总数
    vm.libraryMaintainCount = 0;//在库维修
    vm.libraryRentCount = 0;//在库待租
    vm.transportCount = 0;//途中
    vm.leaseingCount = 0;//出租中
    vm.sceneSuspensionCount = 0;//现场报停
    //搜索条件定义
    vm.searchConditions = {};
    //定义每页显示多少条数据
    vm.pageSize = 12;
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
    };

    var machineContent = document.getElementsByClassName('machine-content');
    machineContent[0].style.height = $window.innerHeight + 'px';

    //定义页面导航
    $scope.navs = [{
      "title": "rental", "alias": "rentalCurrentLocate", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus","alias": "currentState", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias": "alarmInformation", "icon": "fa-exclamation-triangle"
    }];
    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView = function (view) {
      $rootScope.$state.go(view);
    };
    /**
     * 根据车辆状态获取车辆数量
     * @param statusType
     */
    vm.getMachineCountByStatus = function (statusType) {
      var url = RENTAL_MACHINE_COUNT_URL;
      if (statusType) {
        url = url + "?status=" + statusType;
      }
      var respData = serviceResource.restCallService(url, "GET");
      respData.then(function (data) {
        var msgNum = data.content;
        if (statusType == undefined || statusType == null) {
          vm.machineCount = msgNum;
        }
        if (statusType == 6) {
          vm.libraryMaintainCount = msgNum;
        }
        if (statusType == 7) {
          vm.libraryRentCount = msgNum;
        }
        if (statusType == 8) {
          vm.transportCount = msgNum;
        }
        if (statusType == 9) {
          vm.leaseingCount = msgNum;
        }
        if (statusType == 10) {
          vm.sceneSuspensionCount = msgNum;
        }
      }, function (reason) {
        Notification.error("获取信息失败");
      })
    };
    vm.getMachineCountByStatus();//车辆总数
    vm.getMachineCountByStatus(6);//在库维修
    vm.getMachineCountByStatus(7);//在库待租
    vm.getMachineCountByStatus(8);//途中
    vm.getMachineCountByStatus(9);//出租中
    vm.getMachineCountByStatus(10);//现场报停
    /**
     * 获取车辆数据
     *
     * @param currentPage
     * @param pageSize
     */
    vm.loadMachineData = function (currentPage, pageSize, totalElements, searchConditions) {
      var restCallURL = RENTAL_MACHINE_DATA_URL;
      var pageUrl = currentPage || 0;
      var sizeUrl = pageSize || vm.pageSize;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl;
      if (totalElements != null && totalElements != undefined) {
        restCallURL += "&totalElements=" + totalElements;
      }
      if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
        restCallURL += "&orgId=" + vm.org.id;
      }

      if (searchConditions!=null){
        restCallURL = commonFactory.processSearchConditions(restCallURL, searchConditions);
      }
      var machineDataPromis = serviceResource.restCallService(restCallURL, "GET");
      machineDataPromis.then(function (data) {
        vm.machineDataList = data.content;
        vm.customConfigParams = new NgTableParams({}, {dataset: vm.machineDataList});
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    };


    /**
     * 得到机器类型集合
     */
    vm.getDeviceType = function () {
      var engineTypeData = serviceResource.restCallService(MACHINE_DEVICETYPE_URL, "GET");
      engineTypeData.then(function (data) {
        vm.deviceTypeList = data.content;
      }, function (reason) {
        Notification.error(languages.findKey('rentalGetDataError'));
      })
    };

    vm.getDeviceType();

    /*初始化加载数据,首先查看是不是从别的页面转过来的,如果是使用完这个值后置空这个值*/
    if ($rootScope.machinType) {
      vm.searchConditions.type = $rootScope.machinType;
      $rootScope.machinType=null;
      vm.loadMachineData(0, vm.pageSize, null,vm.searchConditions);
    } else {
      vm.loadMachineData(0, vm.pageSize, null,null);
    }

    /**
     * 页面上方的车辆状态筛选
     *
     * @param machineStatus
     */
    vm.machineStatusLoadData = function (machineStatus) {
      vm.searchConditions={};
      if (machineStatus==null || machineStatus==undefined){
        vm.loadMachineData(0, vm.pageSize, null, null);
      }else {
        vm.searchConditions.status = machineStatus;
        vm.loadMachineData(0, vm.pageSize, null, vm.searchConditions);
      }

    };

    vm.machineMonitors=function () {

    };

    /**
     * 车辆监控
     *
     * @param deviceNum
     */
    vm.machineMonitor=function (machineLicenseId) {
      var restCallUrl = RENTAL_MACHINE_MONITOR_URL + "?licenseId=" + machineLicenseId;
      var deviceDataPromis = serviceResource.restCallService(restCallUrl, "GET");
      deviceDataPromis.then(function (data) {
        //打开模态框
        $rootScope.currentOpenModal = $uibModal.open({
          animation: true,
          backdrop: false,
          templateUrl: 'app/components/rentalPlatform/machineMng/machineMonitor.html',
          controller: 'machineMonitorController',
          controllerAs:'vm',
          openedClass: 'hide-y',//class名 加载到整个页面的body 上面可以取消右边的滚动条
          windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
          size: 'super-lgs',
          resolve: { //用来向controller传数据
            deviceInfo: function () {
              return data.content;
            }
          }
        });
      },function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }

    /**
     * 管理车辆信息
     *
     * @param machineLicenseId
     */
     vm.machineMng=function (machineLicenseId) {
       var restCallUrl = RENTAL_MACHINE_URL + "?licenseId=" + machineLicenseId;
       var machineDataPromis = serviceResource.restCallService(restCallUrl, "GET");
       machineDataPromis.then(function (data) {
         $rootScope.currentOpenModal = $uibModal.open({
           animation: true,
           backdrop: false,
           templateUrl: 'app/components/rentalPlatform/machineMng/machineMng.html',
           controller: 'machineMngControllerRental',
           controllerAs:'vm',
           openedClass: 'hide-y',//class名 加载到整个页面的body 上面可以取消右边的滚动条
           windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
           windowTopClass:'test2',//加载到window-class指令
           size: 'md',
           resolve: { //用来向controller传数据
             machine: function () {
               return data.content;
             }
           }
         });
         $rootScope.currentOpenModal.result.then(function (result) {
           var tabList=vm.customConfigParams.data;
           //更新内容
           for(var i=0;i<tabList.length;i++){
             if(tabList[i].machineLicenseId==result.machineLicenseId){
               tabList[i]=result;
             }
           }
         }, function () {
           //取消
         });

       },function (reason) {
         Notification.error(languages.findKey('failedToGetDeviceInformation'));
       })
     };

    /**
     * 添加车辆
     */
    vm.addMachine=function () {
       $rootScope.currentOpenModal = $uibModal.open({
         animation: true,
         backdrop: false,
         templateUrl: 'app/components/rentalPlatform/machineMng/machineAdd.html',
         controller: 'machineAddController',
         controllerAs:'vm',
         openedClass: 'hide-y',//class名 加载到整个页面的body 上面可以取消右边的滚动条
         windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
         windowTopClass:'test2',//加载到window-class指令
         size: 'md'
       });
       $rootScope.currentOpenModal.result.then(function (newVal) {
         vm.machineCount += 1;
         vm.customConfigParams.data.splice(0, 0, newVal);
       }, function () {
         //取消
       });

     };

  }
})();
