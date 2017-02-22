/**
 * Created by mengwei on 17-2-21.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('batchMoveOrgController', batchMoveOrgController);

  function batchMoveOrgController($rootScope,$scope,serviceResource,Notification,$uibModalInstance,DEIVCIE_MOVE_ORG_URL,deviceOrgId,machineOrgId){
    var vm = this;
    vm.machineOrgId = machineOrgId;
    vm.deviceOrgId = deviceOrgId;
    vm.notice = true;

    vm.ok = function () {

      var moveOrg = {ids: vm.deviceOrgId, "orgId": vm.machineOrgId};

      var restPromise = serviceResource.restUpdateRequest(DEIVCIE_MOVE_ORG_URL, moveOrg);
      restPromise.then(function (data) {
        Notification.success("调拨设备成功!");


      }, function (reason) {
        Notification.error("调拨设备出错!");
      });
      $uibModalInstance.dismiss('cancel');
    }

    vm.cancel = function () {
      $uibModalInstance.close(vm.notice);
      //$uibModalInstance.dismiss('cancel');

    }
  }

})();
