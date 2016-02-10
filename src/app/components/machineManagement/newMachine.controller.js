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

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
