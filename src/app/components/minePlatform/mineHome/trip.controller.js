/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('tripController', tripController);

  /** @ngInject */
  function tripController($rootScope) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    console.log("tripController");

  }
})();
