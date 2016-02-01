/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newMachineController', newMachineController);

  /** @ngInject */
  function newMachineController($scope, $uibModalInstance, MACHINE_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;

    vm.machine = {};
    vm.ok = function (machine) {
      var restPromise = serviceResource.restAddRequest(MACHINE_URL, machine);
      restPromise.then(function (data) {
        Notification.success("新建车辆信息成功!");
        $uibModalInstance.close();
      }, function (reason) {
        Notification.error("新建车辆信息出错!");
      });
    };

    //vm.showOrgTree = false;
    //
    //vm.openOrgTree = function(){
    //  vm.showOrgTree = !vm.showOrgTree;
    //}
    //
    //$scope.$on('OrgSelectedEvent',function(event,data){
    //  vm.selectedOrg = data;
    //  vm.newMachine.organizationDto = vm.selectedOrg;
    //  vm.showOrgTree = false;
    //})

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
