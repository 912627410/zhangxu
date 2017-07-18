/**
 * Created by mengwei on 17-7-18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('roles', roles);

  /** @ngInject */
  function roles($rootScope,$window) {
    return {

      /*获取角色*/
      getRoles: function(arg) {
        var roleInfoList=$rootScope.roleInfoList;
        if (roleInfoList&&roleInfoList[arg]) return true;
        return false;
      },

    };
  }

})();
