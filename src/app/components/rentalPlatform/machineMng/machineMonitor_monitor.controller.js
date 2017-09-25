/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorDataController', machineMonitorDataController);

  /** @ngInject */
  function machineMonitorDataController($rootScope,$window,$scope,$http, $location, $timeout, $filter) {
    var vm = this;
    vm.test="machineMonitorDataController";

  }
})();
