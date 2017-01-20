/**
 * Created by mengwei on 17-1-19.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineAllocationController', machineAllocationController);

  /** @ngInject */
  function machineAllocationController($rootScope, $scope,$uibModalInstance,allocationlog,machinelicenseId) {
    var vm = this;
    $scope.allocationlog = allocationlog;
    $scope.machinelicenseId = machinelicenseId;


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
