/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('processAlarmInfoController', processAlarmInfoController);

  /** @ngInject */
  function processAlarmInfoController($rootScope, $scope, $window, $location,notification,$uibModalInstance, $anchorScroll, $uibModal, serviceResource, languages, commonFactory) {
    var vm = this;


    vm.cancel=function () {
      $uibModalInstance.dismiss('cancel');
    }
  }
})();
