/**
 * Created by luzhen on 12/25/17.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('mineMachineService', mineMachineService);

  /** @ngInject */
  function mineMachineService($rootScope, $resource, MACHINE_SALARY_TYPE_URL, MACHINE_UPKEETP_PRICE_TYPE_URL, serviceResource, FUEL_CONFIGT_LIST_URL, MINEMACHINE_STATE_LIST_URL) {


    return {

      getMineMachineStateList: function () {
        return serviceResource.restCallService(MINEMACHINE_STATE_LIST_URL,"QUERY");
      }
    };


  }
})();
