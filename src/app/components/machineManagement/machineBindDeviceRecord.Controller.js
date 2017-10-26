/**
 * Created by mengwei on 17-9-12.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineBindDeviceRecordController', machineBindDeviceRecordController);

  /** @ngInject */
  function machineBindDeviceRecordController($rootScope, $scope,$uibModalInstance,machineId,recordlog) {
    var vm = this;
    vm.machineId = machineId;
    vm.recordlog = recordlog ;


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
