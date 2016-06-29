/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('userService', userService);

  /** @ngInject */
  function userService($rootScope, $resource, USER_STATUS_URL, serviceResource, Notification) {


    //return {"name":"abc"};
    return {
      queryStatusList: function () {
        var promise = serviceResource.restCallService(USER_STATUS_URL, "QUERY");
        return promise;


      }
    };
  }
})();
