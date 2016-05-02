/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateUserinfoController', updateUserinfoController);

  /** @ngInject */
  function updateUserinfoController($rootScope,$scope,$uibModalInstance,USERINFO_URL,serviceResource, Notification,usermnginfo) {
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
        $uibModalInstance.close();
      },function(reason){
        Notification.error("修改用户信息出错!");
      });
    };


    vm.showOrgTree = false;

    vm.openOrgTree = function(){
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent',function(event,data){
      vm.selectedOrg = data;
      vm.updatedUser.organizationDto = vm.selectedOrg;
      vm.showOrgTree = false;
    })
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
