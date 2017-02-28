/**
 * Created by mengwei on 17-2-21.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('batchMoveOrgController', batchMoveOrgController);

  function batchMoveOrgController($rootScope,$scope,serviceResource,Notification,$uibModalInstance,DEIVCIE_MOVE_ORG_URL,deviceNum,deviceOrgLabel,machineOrgLabel){
    var vm = this;

    vm.machineAndDeviceInfo = {
      machineOrg:machineOrgLabel,
      deviceNum:deviceNum,
      deviceOrg:deviceOrgLabel
    };


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();
