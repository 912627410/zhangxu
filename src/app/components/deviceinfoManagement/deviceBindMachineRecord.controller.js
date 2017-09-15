/**
 * Created by mengwei on 17-9-13.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('deviceBindMachineRecordController', deviceBindMachineRecordController);

  /** @ngInject */
  function deviceBindMachineRecordController($rootScope, $scope,$uibModalInstance,deviceNum,recordlog) {
    var vm = this;
    vm.deviceNum = deviceNum;
    vm.recordlog = recordlog ;


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
