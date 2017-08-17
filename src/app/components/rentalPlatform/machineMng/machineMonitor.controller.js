/**
 * Created by xielongwang on 2017/8/17.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMonitorController', machineMonitorController);

  /** @ngInject */
  function machineMonitorController($uibModalInstance,deviceInfo) {
    var vm = this;

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
