/**
 * Created by develop on 7/21/16.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('versionContentController', versionContentController);

  /** @ngInject */
  function versionContentController(appVersion,$uibModalInstance) {
    var vm = this;
    vm.appVersion = angular.copy(appVersion) ;

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
