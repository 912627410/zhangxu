/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorHistoryController', machineMonitorHistoryController);

  /** @ngInject */
  function machineMonitorHistoryController($rootScope,$window,$scope,$http, $location, $timeout, $filter) {
    var vm = this;
    vm.test="machineMonitorHistoryController";

  }
})();
