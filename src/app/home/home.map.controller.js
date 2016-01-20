/**
 * Created by shuangshan on 16/1/3.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('HomeMapController', HomeMapController);

  /** @ngInject */
  function HomeMapController($http,$rootScope,AMAP_URL,HOME_GPSDATA_URL,serviceResource) {
    var vm = this;
    serviceResource.refreshMapWithDeviceInfo("homeMap");
  }
})();
