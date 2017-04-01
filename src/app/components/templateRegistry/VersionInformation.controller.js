/**
 * Created by mengwei on 17-4-1.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('VersionInfoMngController', VersionInfoMngController);

  /** @ngInject */
  function VersionInfoMngController($rootScope,$scope,$window) {
    var vm = this;
    vm.setversionNumber = function (num) {
      $window.sessionStorage["versionNumber"] = num;
      console.log($window.sessionStorage["versionNumber"])
    }



  }
})();

