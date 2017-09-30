/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRentalFleetController', updateRentalFleetController);

  /** @ngInject */
  function updateRentalFleetController($rootScope,$scope,$http,$confirm,$location,$uibModalInstance,treeFactory,serviceResource,FLEET_URL, Notification,fleet,type) {
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



