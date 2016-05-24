/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('permissions', permissions);

  /** @ngInject */
  function permissions($rootScope) {

    var permissionList = {};
    //var rspData = serviceResource.getPermission();
    //rspData.then(function (data) {
    // console.log(data.content);
    //  permissionList=data.content;
    //}, function (reason) {
    // console.log("1111");
    //});


    var unPermissionsMode = unPermissionsMode || false;
    return {
      /*设置权限*/
      setPermissions: function(permissions) {
        permissionList = permissions;
        // $rootScope.$broadcast('permissionsChanged')
        console.log("==11111=="+permissionList['device:homegpsdata']['permission']);

      },
      /*获取权限*/
      getPermissions: function(arg) {

        var permissions=$rootScope.permissions;

        for(var x in permissions){
          console.log("x==="+x);
          console.log(permissions[x]);
        }
          console.log("arg==="+arg);
          console.log("permissionList[arg]==="+permissionList['device:homegpsdata']);
        if (unPermissionsMode) return true;
        if (permissionList[arg]) return true;
        return false;
      },
      /*获取全部权限*/
      getAll: function() {
        return permissionList;
      }
    };
  }

})();
