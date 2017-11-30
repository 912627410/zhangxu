/**
 * Created by shuangshan on 16/1/1.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('HomeController', HomeController);

  /** @ngInject */
  function HomeController($rootScope,serviceResource, permissions, HOME_STATISTICS_DATA_URL, Notification) {
    var vm = this;
    vm.statisticInfo = {
      totalDevices: 0,
      notificationNumber: 0,
      totalAbnormalDevices: 0
    };

    /**
     * 直接访问首页时,如果用户为空转到login页面
     */
    if ($rootScope.userInfo == null) {
      $rootScope.$state.go("login");
      return;
    }

    /**
     * 四个图表的统计数据
     */
    if (permissions.getPermissions("device:homedata")) {
      var resPromise = serviceResource.restCallService(HOME_STATISTICS_DATA_URL, "GET");
      resPromise.then(function (data) {
        vm.statisticInfo.totalDevices = data.devicesNum;
        vm.statisticInfo.notificationNumber = data.messageNum;
      }, function (reason) {
        Notification.error('获取设备信息失败');
      })
    }

    /**
     * 验证用户是否有操作设备的权限
     * @returns {*} true/false
     */
    vm.validateDeviceOperPermission = function () {
      return permissions.getPermissions("device:page");
    }

  }
})();
