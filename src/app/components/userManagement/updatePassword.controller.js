/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updatePasswordController', updatePasswordController);

  /** @ngInject */
  function updatePasswordController($rootScope,$uibModalInstance,SUPER_RESET_PASSWORD_URL,serviceResource, Notification,usermnginfo) {
    var vm = this;
    var operatorInfo =$rootScope.userInfo;
    vm.ok = function (newpassword) {
      var updatePasswordDto = {
        ssn: usermnginfo.ssn,
        password: newpassword
      };
      var restPromise = serviceResource.restUpdateRequest(SUPER_RESET_PASSWORD_URL,updatePasswordDto);
      restPromise.then(function (data){
        if (data.result == "SUCCESS" && operatorInfo.userdto.ssn === usermnginfo.ssn)
        {
          //刷新用户当前的登录token
          serviceResource.refreshUserAuthtoken(newpassword);
        }
        Notification.success("修改密码成功!");
        $uibModalInstance.close();
      },function(reason){
        Notification.error("修改密码出错!");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
