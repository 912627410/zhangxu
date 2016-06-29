/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('priviligeService', priviligeService);

  /** @ngInject */
  function priviligeService(PRIVILAGE_STATUS_URL, serviceResource) {


    return {
      queryStatusList: function () {
        var promise = serviceResource.restCallService(PRIVILAGE_STATUS_URL, "QUERY");
        return promise;
      }
    };
  }
})();
