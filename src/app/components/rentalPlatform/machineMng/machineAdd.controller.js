/**
 * Created by xielongwang on 2017/8/17.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineAddController', machineAddController);

  /** @ngInject */
  function machineAddController($rootScope,$scope,$window, $uibModalInstance) {
    var vm =this;
    /**
     * 关闭模态框
     */
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
