/**
 * Created by develop on 7/25/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateFleetController', updateFleetController);

  /** @ngInject */
  function updateFleetController($rootScope,treeFactory,$uibModalInstance,FLEET_URL,serviceResource, Notification,fleet,type,parentOrg) {
    var vm = this;
    vm.fleet = angular.copy(fleet);
    vm.fleet.parentOrg = angular.copy(parentOrg);
    vm.operatorInfo =$rootScope.userInfo;
    vm.type =type;
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.fleet.parentOrg = selectedItem;
        vm.fleet.parentId = selectedItem.id;
      });
    }


    vm.ok = function (fleet) {
      var rspdata = serviceResource.restUpdateRequest(FLEET_URL,fleet);
      rspdata.then(function (data) {
        Notification.success("更新车队信息成功!");
        $uibModalInstance.close(data.content);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
