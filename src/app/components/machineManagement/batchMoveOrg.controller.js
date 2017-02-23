/**
 * Created by mengwei on 17-2-21.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('batchMoveOrgController', batchMoveOrgController);

  function batchMoveOrgController($rootScope,$scope,serviceResource,Notification,$uibModalInstance,DEIVCIE_MOVE_ORG_URL,deviceInfo,machineInfo){
    var vm = this;
    vm.machineOrgId = machineInfo.org.id;

    vm.machineAndDeviceInfo = {
      machineLicenseId:machineInfo.licenseId,
      machineOrg:machineInfo.org.label,
      deviceNum:deviceInfo.deviceNum,
      deviceOrg:deviceInfo.org.label
    };
    vm.deviceId = [];
    vm.deviceId.push(deviceInfo.id);

    vm.notice = true;

    vm.cancel = function () {
      $uibModalInstance.close(vm.notice);
    }
  }

})();
