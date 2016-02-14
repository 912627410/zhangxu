/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('permissions', permissions);

  /** @ngInject */
    function permissions() {
    var permissionList;
    var unPermissionsMode = unPermissionsMode || false;
    //alert(unPermissionsMode);
    return {
      setPermissions: function(permissions) {
        permissionList = permissions;
      },
      getPermissions: function(arg) {
        if (!permissionList) {
          //api("postPermission").then(function(data) {
          //  this.setPermissions($filter("array2obj")(data, "permission"));
          //});
          permissionList=[];
       //   permissionList=[{1:{"action":"/machine/machine","permission":"machine:oper"}}];
          permissionList["machine:oper"]="machine:oper";
        }

     //   alert("111="+permissionList[arg] ? true : false);
        return unPermissionsMode || permissionList[arg] ? true : false;
      },
      getAll: function() {
        return permissionList;
      }
    };
    }

})();
