/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineCurrentStatusController', machineCurrentStatusController);

  /** @ngInject */
  function machineCurrentStatusController($rootScope, $scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, languages,serviceResource,Notification) {
    var vm=this;
    //表格中每页展示多少条数据
    ngTableDefaults.params.count = 12;
    //取消ng-table的默认分页
    ngTableDefaults.settings.counts = [];

    //定义页面导航
    $scope.navs = [{
      "title": "rental","alias":"当前位置", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus", "alias":"当前状态", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias":"报警信息", "icon": "fa-exclamation-triangle"
    }];
    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView=function (view) {
      $rootScope.$state.go(view);
    }

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
