/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorMapController', machineMonitorMapController);

  /** @ngInject */
  function machineMonitorMapController($rootScope,$window,$scope,$http, $location, $timeout, $filter) {
    var vm = this;
    vm.test="machineMonitorMapController";

  }
})();
