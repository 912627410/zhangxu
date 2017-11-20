/**
 * @author xielongwang
 * @date  2017/8/17.
 * @description 车辆生命周期controller
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorLiftCycleController', machineMonitorLiftCycleController);

  /** @ngInject */
  function machineMonitorLiftCycleController($rootScope,$window,$scope,$http, $location, $timeout, $filter,sharedDeviceInfoFactory) {
    var vm = this;
    vm.deviceInfo=sharedDeviceInfoFactory.getSharedDeviceInfo();

  }
})();
