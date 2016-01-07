/**
 * Created by shuangshan on 16/1/6.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('DeviceMonitorController', DeviceMonitorController);

  /** @ngInject */
  function DeviceMonitorController($rootScope, $window,$http,serviceResource,TipService) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    vm.refreshMainMap = function(){
      serviceResource.refreshMapWithDeviceInfo("monitorMap");
    }

    vm.queryDeviceInfo = function(page,size,sort,queryCondition){
      var deviceDataPromis = serviceResource.queryDeviceInfo(page,size,sort,queryCondition);
      deviceDataPromis.then(function (data) {
        var deviceInfoList = data.content;
        deviceInfoList.forEach(function(deviceInfo){
          var lnglatXY = [parseFloat(deviceInfo.longitudeNum),parseFloat(deviceInfo.latitudeNum)];
          serviceResource.getAddressFromXY(lnglatXY,function(address){
            deviceInfo.address = address;
          })
        })
        vm.deviceInfoList = deviceInfoList;
      }, function (reason) {
        TipService.setMessage('获取设备信息失败', 'error');
      })
    }

    if (userInfo == null){
      $rootScope.$state.go('home.login');
    }
    else{
      vm.refreshMainMap();
      vm.queryDeviceInfo(0,null,null,null);
    }
  }
})();
