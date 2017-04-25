/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('machineService', machineService);

  /** @ngInject */
  function machineService($rootScope, $resource, MACHINE_SALARY_TYPE_URL, MACHINE_UPKEETP_PRICE_TYPE_URL,MACHINE_STATE_LIST_URL, serviceResource, FUEL_CONFIGT_LIST_URL) {




    return {
      getSalaryTypeList: function () {
        return serviceResource.restCallService(MACHINE_SALARY_TYPE_URL, "QUERY");
      },

      getFuelTypeList: function () {
        return serviceResource.restCallService(FUEL_CONFIGT_LIST_URL, "GET");
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
