/**
 * Created by shuangshan on 16/1/3.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('HomeMapController', HomeMapController);

  /** @ngInject */
  function HomeMapController($http,$rootScope,AMAP_URL,HOME_GPSDATA_URL,serviceResource,permissions) {
    var vm = this;
    if(permissions.getPermissions("device:homegpsdata")) {
      serviceResource.refreshMapWithDeviceInfo("homeMap", null, 5);
    }
  }
})();
