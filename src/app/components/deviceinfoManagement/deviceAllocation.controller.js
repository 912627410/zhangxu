/**
 * Created by mengwei on 17-1-20.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('deviceAllocationController', deviceAllocationController);

  /** @ngInject */
  function deviceAllocationController($rootScope, $scope,$uibModalInstance,allocationlog,deviceinfodeviceNum) {
    var vm = this;
    $scope.allocationlog = allocationlog;
    $scope.deviceinfodeviceNum = deviceinfodeviceNum;


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
