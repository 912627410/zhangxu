/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('fuelConfigService', fuelConfigService);

  /** @ngInject */
  function fuelConfigService(FUEL_TYPE_URL,serviceResource) {

    return {

      getFuelTypeList: function () {
        return serviceResource.restCallService(FUEL_TYPE_URL, "QUERY");
      },

    };

  }
})();
