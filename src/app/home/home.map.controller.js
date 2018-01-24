/**
 * Created by shuangshan on 16/1/3.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('HomeMapController', HomeMapController);

  /** @ngInject */
  function HomeMapController(serviceMapResource,$http,$rootScope,AMAP_URL,HOME_GPSDATA_URL,serviceResource,permissions,uiGmapGoogleMapApi) {
    var vm = this;
    // if(permissions.getPermissions("device:homegpsdata")) {
    //   serviceResource.refreshMapWithDeviceInfo("homeMap", null, 4);
    // }



    uiGmapGoogleMapApi.then(function(maps) {
      console.log("init google map success");
    });
    if ($rootScope.userInfo!=null&&$rootScope.userInfo.userdto.countryCode!= "ZH") {
      //判断是不是Haulotte用户
      if ($rootScope.userInfo.userdto.tenantType == '101') {
        vm.map = serviceMapResource.refreshHaulotteGoogleMapWithDeviceInfo();
      }else {
        vm.map = serviceResource.refreshGoogleMapWithDeviceInfo();
      }

    } else {
      serviceResource.refreshMapWithDeviceInfo("homeMap", null, 4);
    }
    //console.log(vm.map)
    vm.refreshMap = function () {
      if($rootScope.userInfo!=null&&$rootScope.userInfo.userdto.countryCode!= "ZH"){
        //判断是不是Haulotte用户
        if ($rootScope.userInfo.userdto.tenantType == '101') {
          vm.map = serviceMapResource.refreshHaulotteGoogleMapWithDeviceInfo();
        }else {
          vm.map = serviceResource.refreshGoogleMapWithDeviceInfo();
        }

      }else{
        serviceResource.refreshMapWithDeviceInfo("homeMap", null,4);
      }
    }
  }
})();
