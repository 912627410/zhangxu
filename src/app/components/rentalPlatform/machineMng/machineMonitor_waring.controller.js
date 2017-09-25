/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorWaringController', machineMonitorWaringController);

  /** @ngInject */
  function machineMonitorWaringController($rootScope,$window,$scope,$http, $location, $timeout, $filter,sharedDeviceInfoFactory) {
    var vm = this;
    vm.deviceInfo = sharedDeviceInfoFactory.getSharedDeviceInfo();

  }
})();
