/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorPositionController', machineMonitorPositionController);

  /** @ngInject */
  function machineMonitorPositionController($rootScope,$window,$scope,$http, $location, $timeout, $filter,serviceResource,Notification,NgTableParams,ngTableDefaults,languages,sharedDeviceInfoFactory) {
    var vm = this;
    vm.deviceInfo = sharedDeviceInfoFactory.getSharedDeviceInfo();


  }
})();