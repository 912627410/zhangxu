/**
 * Created by weihua on 17/12/28.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngResetPasswordController', minemngResetPasswordController);

  /** @ngInject */
  function minemngResetPasswordController($rootScope,$uibModalInstance,$scope,MINEMNG_USERINFO_RESET_PASSWORD_URL,serviceResource, Notification,userinfoId) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;
    vm.checkPassword=false;
    vm.ok = function (newpassword) {

      var updatePasswordDto = {
        id: userinfoId,
        password: newpassword
      };
      var restPromise = serviceResource.restUpdateRequest(MINEMNG_USERINFO_RESET_PASSWORD_URL,updatePasswordDto);
      restPromise.then(function (data){

        if(data.code===0){
          Notification.success("修改密码成功!");
          $uibModalInstance.close("data");
        }else{
          Notification.error(data.message);
        }
      },function(reason){
        Notification.error(reason.data.message);
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
