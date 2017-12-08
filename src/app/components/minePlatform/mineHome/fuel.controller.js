/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('fuelController', fuelController);

  /** @ngInject */
  function fuelController($rootScope) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    vm.data = "油耗";

  }
})();
