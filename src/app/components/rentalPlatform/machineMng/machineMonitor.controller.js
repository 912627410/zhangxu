/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorController', machineMonitorController);

  /** @ngInject */
  function machineMonitorController($rootScope, $window, $scope, $http, $uibModalInstance, deviceInfo,sharedDeviceInfoFactory, $location, $timeout, $filter) {
    var vm = this;
    vm.deviceInfo = deviceInfo;
    //设置共享数据deviceInfo
    sharedDeviceInfoFactory.setSharedDeviceInfo(deviceInfo);

    /**
     * 使用广播更新子controller的数据
     * @param obj
     */
    vm.refreshCurrentDeviceInfo = function (obj) {
      obj = obj || {};
      $rootScope.$broadcast("ShareObjectEvent", obj);
    };



    /*模态框自适应高度*/
    var monitorheight = $window.innerHeight / 1.3;
    vm.monitorheight = {
      "height": monitorheight + "px",
      "overflow-y": "scroll"
    };

    /**
     *  关闭模态框
     */
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


  }
})();
