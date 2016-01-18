/**
 * Created by shuangshan on 16/1/18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updatePasswordController', updatePasswordController);

  /** @ngInject */
  function updatePasswordController($rootScope,$window,$uibModalInstance,RESET_PASSWORD_URL,serviceResource, Notification,usermnginfo) {
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
        if (data.result == "SUCCESS" && userInfo.userdto.ssn === usermnginfo.userdto.ssn)
        {
          //刷新用户当前的登录token
          serviceResource.refreshUserAuthtoken(newpassword);
        }
        Notification.success("修改密码成功!");
        $uibModalInstance.close();
      },function(reason){
        Notification.error("修改密码出错,请确认原密码是否正确!");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
