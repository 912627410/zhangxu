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
