/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('roleService', roleService);

  /** @ngInject */
  function roleService( ORG_TYPE_URL, serviceResource) {


    return {
      queryOrgTypeList: function () {
        return serviceResource.restCallService(ORG_TYPE_URL, "QUERY");
      }
    };
  }
})();
