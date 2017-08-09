/**
 * Created by shuangshan on 16/1/1.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('HomeController', HomeController);

  /** @ngInject */
  function HomeController($rootScope,$filter, serviceResource,permissions,HOME_STATISTICS_DATA_URL,Notification) {
    var vm = this;
    var statisticInfo = {
      totalDevices: 0,
      notificationNumber: 0,
      totalAbnormalDevices: 0
    };
    vm.statisticInfo = statisticInfo;
   // console.log("$rootScope.permissionList =="+$rootScope.permissionList );
  //  console.log("$rootScope.userInfo =="+$rootScope.userInfo );
    if ($rootScope.userInfo==null) {
      $rootScope.$state.go( "home.login" );
      return;
    }

    if(permissions.getPermissions("device:homedata")){


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

        statisticInfo.totalAbnormalDevices = data.deviceAbnormalStatics.deviceNumber;
        //statisticInfo.notificationNumber = $rootScope.notificationNumber;
        //读取未处理的提醒消息
        var notificationPromis = serviceResource.queryNotification(0, null, null, "processStatus=0");
        notificationPromis.then(function (data) {
          statisticInfo.notificationNumber = data.page.totalElements;
          }, function (reason) {
            Notification.error(languages.findKey('failedToGetRemindInformation'));
          }
        );
      }, function (reason) {
        Notification.error('获取设备信息失败');
      })
    }
    vm.statisticInfo = statisticInfo;


    vm.validateDeviceOperPermission=function(){
      return permissions.getPermissions("device:page");
    }



  }
})();
