/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineCurrentStatusController', machineCurrentStatusController);

  /** @ngInject */
  function machineCurrentStatusController($rootScope, $scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, languages, serviceResource, Notification, RENTAL_MACHINE_COUNT_URL) {
    var vm = this;
    //表格中每页展示多少条数据
    ngTableDefaults.params.count = 12;
    //取消ng-table的默认分页
    ngTableDefaults.settings.counts = [];
    //定义车辆状态数量 6:"在库维修"7:"在库待租"8:"途中"9:"出租中"10:"现场报停" (6~10租赁平台使用)
    vm.machineCount = 0;//总数
    vm.libraryMaintainCount = 0;//在库维修
    vm.libraryRentCount = 0;//在库待租
    vm.transportCount = 0;//途中
    vm.leaseingCount = 0;//出租中
    vm.sceneSuspensionCount = 0;//现场报停
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
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);
    //定义页面导航
    $scope.navs = [{
      "title": "rental", "alias": "当前位置", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus", "alias": "当前状态", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias": "报警信息", "icon": "fa-exclamation-triangle"
    }];
    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView = function (view) {
      $rootScope.$state.go(view);
    }

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
          vm.libraryMaintainCount=msgNum;
        }
        if (statusType == 7) {
          vm.libraryRentCount=msgNum;
        }
        if (statusType == 8) {
          vm.transportCount=msgNum;
        }
        if (statusType == 9) {
          vm.leaseingCount=msgNum;
        }
        if (statusType == 10) {
          vm.sceneSuspensionCount=msgNum;
        }
      }, function (reason) {
        Notification.error("获取信息失败");
      })
    }
    vm.getMachineCountByStatus();//车辆总数
    vm.getMachineCountByStatus(6);//在库维修
    vm.getMachineCountByStatus(7);//在库待租
    vm.getMachineCountByStatus(8);//途中
    vm.getMachineCountByStatus(9);//出租中
    vm.getMachineCountByStatus(10);//现场报停



    vm.simpleList = [{
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }
    ]

    vm.customConfigParams = new NgTableParams({}, {dataset: vm.simpleList});

  }
})();
