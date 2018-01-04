/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngTerminalMngController', minemngTerminalMngController);

  /** @ngInject */
  function minemngTerminalMngController($rootScope) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    vm.data = "123";

    vm.query = function (data) {
      console.log(data);
    }
    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.terminalNumber = null;
      vm.simCardNumber = null;
      vm.carNumber = null;
    };


  }
})();
