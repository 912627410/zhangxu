/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorController', machineMonitorController);

  /** @ngInject */
  function machineMonitorController($rootScope,$window,$scope,$http, $uibModalInstance,$location, $timeout, $filter) {
    var vm = this;
    vm.test="machineMonitorController";

    vm.toggle=function (url) {
      vm.position=url;
    }

    /*模态框自适应高度*/
    var monitorheight = $window.innerHeight/1.3;
    vm.monitorheight = {
      "height": monitorheight + "px",
      "overflow-y": "scroll"
    };
    /* 关闭模态框*/
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };



  }
})();
