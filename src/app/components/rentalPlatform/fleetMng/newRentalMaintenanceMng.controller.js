/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalMaintenanceController', newRentalMaintenanceController);

  /** @ngInject */
  function newRentalMaintenanceController($rootScope,$scope,$http,$confirm, $uibModal,$location,treeFactory,serviceResource,RENTAL_MAINTENANCE_URL, Notification) {
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


    /**
     * 从组织调入车辆
     * @param size
     */
    vm.selectMachine = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalOrgMachineListMng.html',
        controller: 'orgMachineListMngController as orgMachineListMngController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          },
          selectUrl: function () {
          return RENTAL_MAINTENANCE_URL;
        }
        }
      });

      modalInstance.result.then(function (result) {
        vm.rightRentalOrder=result;

        //如果选择的订单和左边的一样,则直接提示重新选择
        if(null!=vm.leftRentalOrder&&null!=vm.rightRentalOrder&&vm.rightRentalOrder.id==vm.leftRentalOrder.id){
          vm.rightRentalOrder=null;
          Notification.error(" 选择的订单不能一样!");
          return;
        }

        console.log(vm.rightRentalOrder);

        if(null!=vm.rightRentalOrder){
          vm.rightQuery(null,null,null,vm.rightRentalOrder.id);
        }

      }, function () {
      });
    };

  }
})();
