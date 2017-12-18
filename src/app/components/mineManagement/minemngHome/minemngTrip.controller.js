/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngTripController', minemngTripController);

  /** @ngInject */
  function minemngTripController($rootScope) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    console.log("tripController");

  }
})();
