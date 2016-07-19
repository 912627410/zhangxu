/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('machineService', machineService);

  /** @ngInject */
  function machineService($rootScope, $resource, MACHINE_SALARY_TYPE_URL, MACHINE_FUEL_TYPE_URL, MACHINE_UPKEETP_PRICE_TYPE_URL,DEFAULT_SIZE_PER_PAGE, serviceResource, Notification) {




    return {
      getSalaryTypeList: function () {
        return serviceResource.restCallService(MACHINE_SALARY_TYPE_URL, "QUERY");
      },

      getFuelTypeList: function () {
        return serviceResource.restCallService(MACHINE_FUEL_TYPE_URL, "QUERY");
      },
      getUpkeepPriceTypeList: function () {
        return serviceResource.restCallService(MACHINE_UPKEETP_PRICE_TYPE_URL, "QUERY");
      }
    };


  }
})();
