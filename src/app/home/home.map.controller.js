/**
 * Created by shuangshan on 16/1/3.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('HomeMapController', HomeMapController);

  /** @ngInject */
  function HomeMapController($http,$rootScope,AMAP_URL,HOME_GPSDATA_URL,serviceResource,permissions,uiGmapGoogleMapApi,$log,HOME_GOOGLEMAPGPSDATA_URL) {
    var vm = this;
    // if(permissions.getPermissions("device:homegpsdata")) {
    //   serviceResource.refreshMapWithDeviceInfo("homeMap", null, 4);
    // }



    uiGmapGoogleMapApi.then(function(maps) {
      console.log("init google map success");
    });
    if ($rootScope.userInfo!=null&&$rootScope.userInfo.userdto.countryCode!= "ZH"&&$rootScope.userInfo.orgTenantType ==1) {
      vm.map = serviceResource.refreshGoogleMapWithDeviceInfo();
    } else {
      serviceResource.refreshMapWithDeviceInfo("homeMap", null, 4);
    }
    //console.log(vm.map)
    vm.refreshMap = function () {
      if($rootScope.userInfo!=null&&$rootScope.userInfo.userdto.countryCode!= "ZH"&&$rootScope.userInfo.orgTenantType ==1){
        vm.map = serviceResource.refreshGoogleMapWithDeviceInfo();
      }else{
        serviceResource.refreshMapWithDeviceInfo("homeMap", null,4);
      }
    }
  }
})();
