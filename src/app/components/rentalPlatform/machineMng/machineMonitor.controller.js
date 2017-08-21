/**
 * Created by xielongwang on 2017/8/17.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMonitorController', machineMonitorController);

  /** @ngInject */
  function machineMonitorController($uibModalInstance,$window,deviceInfo) {
    var vm = this;
    /*模态框自适应高度*/
    var monitorheight = $window.innerHeight/1.3;
    vm.monitorheight = {
      "min-height": monitorheight + "px"
    }
    /**
     * 关闭模态框
     */
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
    /*******************************************数据相关begin********************************************/

    /*******************************************数据相关end*********************************************/
  }
})();
