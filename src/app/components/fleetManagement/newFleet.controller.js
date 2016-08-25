/**
 * Created by develop on 7/25/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newFleetController', newFleetController);

  /** @ngInject */
  function newFleetController($rootScope,$scope,$http,$confirm,$uibModalInstance,treeFactory,serviceResource,FLEETINFO_URL, Notification) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(vm);
    }


    //选中树的回调
    vm.selectedCallback=function (selectedItem) {
      vm.org =selectedItem;
    }

    vm.ok = function () {
      vm.fleet.parentId=vm.org.id;
      vm.fleet.type=4;
      var rspdata = serviceResource.restAddRequest(FLEETINFO_URL,vm.fleet);
      rspdata.then(function (data) {
        Notification.success("新建车队成功!");
        $uibModalInstance.close(data.content);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
