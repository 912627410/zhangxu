/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngNewTerminalMngController', minemngNewTerminalMngController);

  /** @ngInject */
  function minemngNewTerminalMngController($rootScope) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

  }
})();
