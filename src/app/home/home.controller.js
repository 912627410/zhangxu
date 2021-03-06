/**
 * Created by shuangshan on 16/1/1.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('HomeController', HomeController);

  /** @ngInject */
  function HomeController($rootScope, serviceResource,HOME_STATISTICS_DATA_URL,Notification) {
    var vm = this;
    var statisticInfo = {
      totalDevices: 0,
      totalWarningDevices: 0,
      totalAbnormalDevices: 0
    };

    if ($rootScope.userInfo) {
      var rspdata = serviceResource.restCallService(HOME_STATISTICS_DATA_URL, "GET");
      rspdata.then(function (data) {
        var deviceStatisticsList = data.deviceStatics;
        //累计设备总数量，后台传过来的是按照状态分开的
        deviceStatisticsList.forEach(function (deviceStatistics) {
          statisticInfo.totalDevices += deviceStatistics.deviceNumber
        })

        var deviceAlertStaticsList = data.deviceAlertStatics;
        //累计报警设备总数量，后台传过来的是按照报警代码分开的
        deviceAlertStaticsList.forEach(function (deviceAlertStatics) {
          statisticInfo.totalWarningDevices += deviceAlertStatics.deviceNumber
        })

        statisticInfo.totalAbnormalDevices = data.deviceAbnormalStatics.deviceNumber
      }, function (reason) {
        Notification.error('获取设备信息失败');
      })
    }
    vm.statisticInfo = statisticInfo;
  }
})();
