/**
 * Created by riqina.ma on 16/5/24.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRoleController', newRoleController);

  /** @ngInject */
  function newRoleController($scope, $uibModalInstance,ROLE_OPER_URL, serviceResource, Notification) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;

    vm.roleInfo = {};


    vm.ok = function (roleInfo) {
     var restPromise = serviceResource.restAddRequest(ROLE_OPER_URL, roleInfo);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success("新建角色信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          vm.roleInfo = roleInfo;
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
