/**
 * Created by mengwei on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRentalUserController', updateRentalUserController);

  /** @ngInject */
  function updateRentalUserController($rootScope,$scope,$uibModal,$uibModalInstance,treeFactory,USERINFO_URL,serviceResource, Notification,usermnginfo) {
    var vm = this;
    vm.updatedUser = usermnginfo;
    vm.operatorInfo =$rootScope.userInfo;

    //默认不接收位置异常报警
    if (vm.updatedUser.locationAlarmReceiver == 1) {
      vm.locationAlarmReceiverChk = true;
    }
    else {
      vm.locationAlarmReceiverChk = false;
    }


    vm.ok = function (updatedUser) {
      if (vm.locationAlarmReceiverChk){
        vm.updatedUser.locationAlarmReceiver = 1;
      }
      else{
        vm.updatedUser.locationAlarmReceiver = 0;
      }
      var restPromise = serviceResource.restUpdateRequest(USERINFO_URL,updatedUser);
      restPromise.then(function (data){
        Notification.success("修改用户信息成功!");
        $uibModalInstance.close(data.content);
      },function(reason){
        Notification.error("修改用户信息出错!");
      });
    };
    //关闭更新页面
   vm.cancel=function () {
      $uibModalInstance.dismiss('cancel');
     console.log(vm.OriginalUserInfo)
   }

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.updatedUser.organizationDto=selectedItem;
      });
    }

  }
})();
