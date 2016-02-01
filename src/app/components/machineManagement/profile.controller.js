/**
 * Created by shuangshan on 16/1/18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('profileController', profileController);

  /** @ngInject */
  function profileController($rootScope,$uibModal,Notification,serviceResource,USERINFO_URL) {
    var vm = this;
    vm.currentUserInfo = $rootScope.userInfo;

//update userinfo
    vm.updateUserInfo = function () {
      var rspData = serviceResource.restUpdateRequest(USERINFO_URL,vm.currentUserInfo.userdto);
      rspData.then(function(data){
        Notification.success("修改用户信息成功");
      },function(reason){
        Notification.error("修改用户信息出错");
      });
    };

//change password
    vm.updatePassword = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/userManagement/updateSelfPassword.html',
        controller: 'updateSelfPasswordController as updatePasswordCtrl',
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
