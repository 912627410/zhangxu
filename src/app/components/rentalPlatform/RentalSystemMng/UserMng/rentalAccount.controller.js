/**
 * Created by mengwei on 17-12-13.
 */

(function(){
  'use strict'
  angular.module('GPSCloud').controller('rentalAccountController',rentalAccountController);

  function rentalAccountController($rootScope,Notification,USERINFO_URL,$uibModal,serviceResource) {
    var vm= this;
    vm.currentUserInfo = $rootScope.userInfo;

    /**
     * 修改个人信息
     */
    vm.updateUserInfo = function () {
      var rspData = serviceResource.restUpdateRequest(USERINFO_URL,vm.currentUserInfo.userdto);

      rspData.then(function(data){
        Notification.success("修改用户信息成功");
      },function(reason){
        Notification.error("修改用户信息出错");
      });
    };

    /**
     * 修改密码
     * @param usermnginfo usermnginfo
     * @param size 模态框大小
       */
    vm.updatePassword = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/rentalPlatform/RentalSystemMng/UserMng/rentalUpdateSelfPassword.html',
        controller: 'rentalUpdateSelfPasswordController as rentalUpdatePasswordCtrl',
        size: size,
        resolve: {
          usermnginfo: function () {
            return usermnginfo;
          }
        }
      });
    };

  }

})();

