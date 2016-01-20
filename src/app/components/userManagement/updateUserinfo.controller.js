/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateUserinfoController', updateUserinfoController);

  /** @ngInject */
  function updateUserinfoController($rootScope,$scope,$uibModalInstance,UPDATE_USERINFO_URL,serviceResource, Notification,usermnginfo) {
    var vm = this;
    vm.updatedUser = usermnginfo;
    vm.operatorInfo =$rootScope.userInfo;
    vm.ok = function (updatedUser) {
      var restPromise = serviceResource.restUpdateRequest(UPDATE_USERINFO_URL,updatedUser);
      restPromise.then(function (data){
        Notification.success("修改用户信息成功!");
        $uibModalInstance.close();
      },function(reason){
        Notification.error("修改用户信息出错!");
      });
    };


    vm.dynamicPopover = {
      content: 'Hello, World!',
      templateUrl: 'myPopoverTemplate.html',
      title: '组织机构选择'
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
