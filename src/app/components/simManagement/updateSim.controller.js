/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateSimController', updateSimController);

  /** @ngInject */
  function updateSimController($rootScope,$scope,$uibModalInstance,SIM_URL,serviceResource, Notification,sim) {
    var vm = this;
    vm.sim = sim;
    vm.operatorInfo =$rootScope.userInfo;
    vm.ok = function (sim) {
      var restPromise = serviceResource.restUpdateRequest(SIM_URL,sim);
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
      vm.sim.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
