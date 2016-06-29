/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRoleController', updateRoleController);

  /** @ngInject */
  function updateRoleController($uibModalInstance,ROLE_OPER_URL,serviceResource, Notification,roleInfo) {
    var vm = this;
    vm.roleInfo=roleInfo;

    vm.ok = function (roleInfo) {
      var restPromise = serviceResource.restUpdateRequest(ROLE_OPER_URL,roleInfo);
      restPromise.then(function (data){

        if(data.code===0){
          Notification.success("修改角色信息成功!");
          $uibModalInstance.close(data.content);
        }else{
          Notification.error(data.message);
        }
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
