/**
 * Created by mengwei on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalUpdatePasswordController', rentalUpdatePasswordController);

  /** @ngInject */
  function rentalUpdatePasswordController($rootScope,$uibModalInstance,SUPER_RESET_PASSWORD_URL,serviceResource, Notification,usermnginfo) {
    var vm = this;
    var operatorInfo =$rootScope.userInfo;
    vm.checkPassword=false;
    vm.ok = function (newpassword) {

      // if(vm.updatePassword.confirmPassword!=vm.updatePassword.password){
      //   vm.checkPassword=true;
      //   return;
      // }

      var updatePasswordDto = {
        ssn: usermnginfo.ssn,
        password: newpassword
      };
      var restPromise = serviceResource.restUpdateRequest(SUPER_RESET_PASSWORD_URL,updatePasswordDto);
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

    // // Don't need include $validationProvider.validate() anymore
    vm.form = {
      abc: function () {
       success:123
      }
    };
  }
})();
