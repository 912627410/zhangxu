/**
 * Created by riqian.ma on 16/5/22.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('permissions', permissions);

  /** @ngInject */
  function permissions($rootScope,$window) {
    return {

      /*获取权限*/
      getPermissions: function(arg) {
        var permissionList=$rootScope.permissionList;
        if (permissionList&&permissionList[arg]) return true;
        return false;
      },

    };
  }

})();
