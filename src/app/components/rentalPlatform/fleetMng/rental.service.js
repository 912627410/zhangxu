/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('rentalService', rentalService);

  /** @ngInject */
  function rentalService($rootScope, $resource, DEVCE_MF, DEVCE_HIGHTTYPE, serviceResource, FUEL_CONFIGT_LIST_URL, MACHINE_STATE_LIST_URL) {




    return {
      getDeviceManufactureList: function () {
        return serviceResource.restCallService(DEVCE_MF, "GET");
      },

      getDeviceHeightTypeList: function () {
        return serviceResource.restCallService(DEVCE_HIGHTTYPE, "GET");
      },
      getUpkeepPriceTypeList: function () {
        return serviceResource.restCallService(MACHINE_UPKEETP_PRICE_TYPE_URL, "QUERY");
      },
      getMachineStateList: function () {
        return serviceResource.restCallService(MACHINE_STATE_LIST_URL,"QUERY");
      }
    };


  }
})();
