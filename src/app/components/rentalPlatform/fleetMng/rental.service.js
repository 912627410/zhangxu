/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('rentalService', rentalService);

  /** @ngInject */
  function rentalService($rootScope, $resource, DEVCE_MF, DEVCE_HIGHTTYPE, serviceResource, DEVCE_DEVICETYPE, DEVCE_POWERTYPE) {




    return {
      getDeviceManufactureList: function () {
        return serviceResource.restCallService(DEVCE_MF, "GET");
      },

      getDeviceHeightTypeList: function () {
        return serviceResource.restCallService(DEVCE_HIGHTTYPE, "GET");
      },
      getDeviceTypeList: function () {
        return serviceResource.restCallService(DEVCE_DEVICETYPE, "GET");
      },
      getDevicePowerTypeList: function () {
        return serviceResource.restCallService(DEVCE_POWERTYPE,"GET");
      }
    };


  }
})();
