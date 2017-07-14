/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updatePrivilegeController', updatePrivilegeController);

  /** @ngInject */
  function updatePrivilegeController($uibModalInstance,PRIVILEGE_URL,serviceResource, Notification,privilegeInfo) {
    var vm = this;
    vm.privilegeInfo=privilegeInfo;

    vm.ok = function (privilegeInfo) {
      var restPromise = serviceResource.restUpdateRequest(PRIVILEGE_URL,privilegeInfo);
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
