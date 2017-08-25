/**
 * Created by xielongwang on 2017/8/17.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMngControllerRental', machineMngControllerRental);

  /** @ngInject */
  function machineMngControllerRental($uibModalInstance,machine) {
    var vm = this;
    /**
     * 关闭模态框
     */
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    /**
     * 更新车辆
     */
    vm.updateMachine=function () {
      console.log("updateMachine")
    }
  }
})();
