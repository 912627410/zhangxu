/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngFuelController', minemngFuelController);

  /** @ngInject */
  function minemngFuelController($rootScope) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

  }
})();
