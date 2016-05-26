/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updatePriviligeController', updatePriviligeController);

  /** @ngInject */
  function updatePriviligeController($uibModalInstance,PRIVILAGE_OPER_URL,serviceResource, Notification,priviligeInfo) {
    var vm = this;
    vm.priviligeInfo=priviligeInfo;

    vm.ok = function (priviligeInfo) {
      var restPromise = serviceResource.restUpdateRequest(PRIVILAGE_OPER_URL,priviligeInfo);
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
