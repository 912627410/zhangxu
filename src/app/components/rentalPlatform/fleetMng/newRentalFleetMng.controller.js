/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalFleetController', newRentalFleetController);

  /** @ngInject */
  function newRentalFleetController($rootScope,$scope,$http,$confirm,$location,treeFactory,serviceResource,FLEET_URL, Notification) {
    var vm = this;
    var path="/rental/fleet";
    vm.operatorInfo =$rootScope.userInfo;
    vm.cancel = function () {
     // $uibModalInstance.dismiss('cancel');
      $location.path(path);

    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.ok = function () {
      vm.fleet.parentId=vm.org.id;
      vm.fleet.type=4;
      var rspdata = serviceResource.restAddRequest(FLEET_URL,vm.fleet);
      rspdata.then(function (data) {
        Notification.success("新建车队成功!");
        $location.path(path);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
