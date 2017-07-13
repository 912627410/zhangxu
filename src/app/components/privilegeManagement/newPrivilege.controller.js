/**
 * Created by riqina.ma on 16/5/24.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newPrivilegeController', newPrivilegeController);

  /** @ngInject */
  function newPrivilegeController($scope, $uibModalInstance,PRIVILEGE_URL, serviceResource, Notification,menu) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;
    vm.privilegeInfo = {};
    vm.privilegeInfo.menuInfo = menu;

    vm.ok = function (privilegeInfo) {
     var restPromise = serviceResource.restAddRequest(PRIVILEGE_URL, privilegeInfo);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建权限信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          vm.privilegeInfo = privilegeInfo;
          Notification.error(data.message);
        }
      }, function (reason) {
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
      }

      );
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
