/**
 * Created by develop on 7/21/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateWorkplaneController', updateWorkplaneController);

  /** @ngInject */
  function updateWorkplaneController($rootScope,$scope,$http,$confirm,$uibModalInstance,DEIVCIE_FETCH_UNUSED_URL,MACHINE_URL,ENGINE_TYPE_LIST_URL,serviceResource, Notification,machine) {
    var vm = this;
    vm.machine = machine;
    vm.operatorInfo =$rootScope.userInfo;



  }
})();
