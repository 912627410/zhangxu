/**
 * Created by develop on 7/25/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateFleetController', updateFleetController);

  /** @ngInject */
  function updateFleetController($rootScope,$scope,$http,$confirm,$uibModalInstance,DEIVCIE_FETCH_UNUSED_URL,MACHINE_URL,ENGINE_TYPE_LIST_URL,serviceResource, Notification,fleet,type) {
    var vm = this;
    vm.fleet = fleet;
    vm.operatorInfo =$rootScope.userInfo;
    vm.type =type;

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


  }
})();
