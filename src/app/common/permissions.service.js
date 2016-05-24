/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('permissions', permissions);

  /** @ngInject */
  function permissions($rootScope,$window) {



    var unPermissionsMode = unPermissionsMode || false;
    return {

      /*获取权限*/
      getPermissions: function(arg) {

        //var permissionList2=$rootScope.xxx ;
        //console.log("permissionList2=="+$rootScope.xxx.authtoken);

        console.log($rootScope);
        console.log($window.sessionStorage["permissionList"]);
        console.log($rootScope.permissionList)

   //     console.log("getPermissions.arg==="+arg);
      //  console.log($rootScope.permissionList.'devie:homegpsdata');

 //       console.log($rootScope.userInfo.userdto.ssn);

        var permissionList=$rootScope.permissionList;
        if (permissionList&&permissionList[arg]) return true;
        return false;
      },

    };
  }

})();
