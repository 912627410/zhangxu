/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalMaintenanceController', newRentalMaintenanceController);

  /** @ngInject */
  function newRentalMaintenanceController($rootScope,$scope,$http,$confirm,$location,treeFactory,serviceResource,RENTAL_MAINTENANCE_URL, Notification) {
    var vm = this;
    var path="/rental/maintenance";
    vm.operatorInfo =$rootScope.userInfo;
    vm.cancel = function () {
      $location.path(path);

    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.ok = function () {
      var rspdata = serviceResource.restAddRequest(RENTAL_MAINTENANCE_URL,vm.maintenance);
      vm.maintenance.org=vm.org;
      rspdata.then(function (data) {
        Notification.success("新建保养信息成功!");
        $location.path(path);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

  }
})();
