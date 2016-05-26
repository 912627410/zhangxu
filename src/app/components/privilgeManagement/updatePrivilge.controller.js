/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updatePrivilgeController', updatePrivilgeController);

  /** @ngInject */
  function updatePrivilgeController($uibModalInstance,PRIVILAGE_OPER_URL,serviceResource, Notification,privilgeInfo) {
    var vm = this;
    vm.privilgeInfo=privilgeInfo;

    vm.ok = function (privilgeInfo) {
      var restPromise = serviceResource.restUpdateRequest(PRIVILAGE_OPER_URL,privilgeInfo);
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
