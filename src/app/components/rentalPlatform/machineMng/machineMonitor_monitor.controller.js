/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorDataController', machineMonitorDataController);

  /** @ngInject */
  function machineMonitorDataController($rootScope,$window,$scope,$http, $location, $timeout, $filter,sharedDeviceInfoFactory) {
    var vm = this;
    //获取共享数据deviceinfo
    vm.deviceInfo = sharedDeviceInfoFactory.getSharedDeviceInfo();

    /**
     * 获取广播事件,用于更新deviceinfo
     */
    $scope.$on("ShareObjectEvent", function(event, args) {
      console.log(args);
    });

    console.log(vm.deviceInfo);

  }
})();
