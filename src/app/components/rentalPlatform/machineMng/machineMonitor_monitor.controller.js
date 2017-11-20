/**
 * @author xielong.wang
 * @date 2017/8/17.
 * @description 车辆监控(最新数据)的controller
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorDataController', machineMonitorDataController);

  /** @ngInject */
  function machineMonitorDataController($rootScope, $window, $scope, $http, $location, $timeout, $filter, serviceResource, sharedDeviceInfoFactory, RENTAL_DEVCE_MONITOR_DATA) {
    var vm = this;
    //获取共享数据deviceinfo
    vm.deviceInfo = sharedDeviceInfoFactory.getSharedDeviceInfo();
    vm.deviceInfoMonitor = {};

    console.log(vm.deviceInfo);

    /**
     * 获取广播事件,用于更新deviceinfo
     */
    $scope.$on("ShareObjectEvent", function (event, args) {
      console.log(args);
    });

    /**
     * 加载监控数据
     * @param deviceNum 设备号
     */
    vm.loadDeviceMonitorData = function (deviceNum) {
      var restCallURL = RENTAL_DEVCE_MONITOR_DATA + "?deviceNum=" + deviceNum;
      var monitorPromise = serviceResource.restCallService(restCallURL, 'GET');
      monitorPromise.then(function (data) {
        console.log(data);
        vm.deviceInfoMonitor=data.content;
      }, function (reason) {

      })

    }

    vm.loadDeviceMonitorData(vm.deviceInfo.deviceNum);


  }
})();
