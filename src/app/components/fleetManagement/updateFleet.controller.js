/**
 * Created by develop on 7/25/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateFleetController', updateFleetController);

  /** @ngInject */
  function updateFleetController($rootScope,$scope,$http,$confirm,treeFactory,$uibModalInstance,DEIVCIE_FETCH_UNUSED_URL,FLEETINFO_URL,MACHINE_URL,ENGINE_TYPE_LIST_URL,serviceResource, Notification,fleet,type) {
    var vm = this;
    vm.fleet = fleet;
    vm.operatorInfo =$rootScope.userInfo;
    vm.type =type;
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.fleet.parentId = selectedItem.id;
        vm.fleet.parentLabel=selectedItem.label;
      });
    }


    vm.ok = function (fleet) {
      var rspdata = serviceResource.restUpdateRequest(FLEETINFO_URL,fleet);
      rspdata.then(function (data) {
        Notification.success("更新车队信息成功!");
        $uibModalInstance.close(data.content);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
