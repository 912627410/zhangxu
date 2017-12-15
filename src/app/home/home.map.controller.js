/**
 * Created by shuangshan on 16/1/3.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('HomeMapController', HomeMapController);

  /** @ngInject */
  function HomeMapController(serviceResource, permissions, MACHINE_DISTRIBUTION) {
    var vm = this;

    /**
     * 刷新首页机器分布
     */
    vm.refreshMap = function () {
      var machineDistRefreshPromise = serviceResource.restCallService(MACHINE_DISTRIBUTION, "GET");
      machineDistRefreshPromise.then(function (data) {
        serviceResource.refreshMapWithDeviceInfo("homeMap", data.content, 4);
      }, function (reason) {

      })
    }

    /**
     * 初始化首页机器分布
     */
    if (permissions.getPermissions("device:homegpsdata")) {
      vm.refreshMap();
    }

  }
})();
