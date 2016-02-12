/**
 * Created by shuangshan on 16/1/20.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateMachineController', updateMachineController);

  /** @ngInject */
  function updateMachineController($rootScope,$scope,$uibModalInstance,MACHINE_URL,serviceResource, Notification,machine) {
    var vm = this;
    vm.machine = machine;
    vm.operatorInfo =$rootScope.userInfo;


    //日期控件相关
    //date picker
    vm.installTimeOpenStatus = {
      opened: false
    };

    vm.installTimeOpen = function ($event) {
      vm.installTimeOpenStatus.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };


    vm.ok = function (machine) {
      var restPromise = serviceResource.restUpdateRequest(MACHINE_URL,machine);
      restPromise.then(function (data){
        Notification.success("修改车辆信息成功!");
        $uibModalInstance.close();
      },function(reason){
        Notification.error("修改车辆信息出错!");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
