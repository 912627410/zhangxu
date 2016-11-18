/**
 * Created by shuangshan on 16/1/18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateSelfPasswordController', updateSelfPasswordController);

  /** @ngInject */
  function updateSelfPasswordController($rootScope,$window,$uibModalInstance,RESET_PASSWORD_URL,serviceResource, Notification,usermnginfo) {
    var vm = this;
    var userInfo =$rootScope.userInfo;
    vm.ok = function (currentPassword,newpassword) {
      var updatePasswordDto = {
        ssn: usermnginfo.userdto.ssn,
        currentPassword: currentPassword,
        password: newpassword
      };
      var restPromise = serviceResource.restUpdateRequest(RESET_PASSWORD_URL,updatePasswordDto);
      restPromise.then(function (data){
        if(data.code===0){
          Notification.success("修改密码成功!");
        }else{
          Notification.error(data.message);
        }
        $uibModalInstance.close();
      },function(reason){
        Notification.error(reason.data.message);
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
