/**
 * Created by shuangshan on 16/1/21.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('AddUserController', AddUserController);

  /** @ngInject */
  function AddUserController($scope,$uibModalInstance,USERINFO_URL,serviceResource, Notification,operatorInfo) {
    var vm = this;
    vm.operatorInfo =operatorInfo;
    //default user role for new added user
    vm.newUser = {};
    vm.ok = function (newUserinfo) {
      var restPromise = serviceResource.restAddRequest(USERINFO_URL,newUserinfo);
      restPromise.then(function (data){
        Notification.success("新建用户信息成功!");
        $uibModalInstance.close();
      },function(reason){
        Notification.error("新建用户信息出错!");
      });
    };

    vm.showOrgTree = false;

    vm.openOrgTree = function(){
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent',function(event,data){
      vm.selectedOrg = data;
      vm.newUser.organizationDto = vm.selectedOrg;
      vm.showOrgTree = false;
    })

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
