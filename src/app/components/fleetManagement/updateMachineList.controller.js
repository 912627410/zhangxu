/**
 * Created by develop on 7/25/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateMachineListController', updateMachineListController);

  /** @ngInject */
  function updateMachineListController($rootScope,$scope,$confirm,$uibModal,$filter,$uibModalInstance,NgTableParams,MACHINE_PAGE_URL,MACHINE_MOVE_FLEET_URL,serviceResource, Notification,fleet) {
    var vm = this;
    vm.fleet = fleet;
    vm.operatorInfo =$rootScope.userInfo;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id

    vm.query = function (page, size, sort, fleet, type) {

      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if(type=="org"&&null != fleet&&null != fleet.id){
        restCallURL += "&search_EQ_orgEntity.id=" +fleet.id;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          vm.ownTableParams = new NgTableParams({},
            {
              dataset: data.content
            });
          vm.ownPage = data.page;
          vm.ownPagenumber = data.page.number + 1;

        },function (reason) {

        });

      }

      if(type=="fleet"&&null != fleet&&null != fleet.id){
        restCallURL += "&search_EQ_fleetEntity.id=" +fleet.id;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          vm.workTableParams = new NgTableParams({},
            {
              dataset: data.content
            });
          vm.workPage = data.page;
          vm.workPagenumber = data.page.number + 1;

        },function (reason) {

        });
      }


    };

    vm.query(null, null, null, vm.fleet,"org");

    //重置查询框
    vm.reset = function () {
      vm.machine = null;
    }

    vm.cancel = function () {
      $uibModalInstance.close(vm.fleet);
      $uibModalInstance.dismiss('cancel');
    };


    vm.moveToOtherFleet = function (machine) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/moveToOtherFleet.html',
        controller: 'moveToOtherFleetController as moveToOtherFleetCtrl',
        size: 'xs',
        backdrop: false,
        resolve: {
          machine: function () {
            return machine;
          }
        }
      });

      modalInstance.result.then(function (result) {
        machine.fleet=result;

      }, function () {
        //取消
      });

    }

    vm.addMachine = function (type) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/addMachine.html',
        controller: 'addMachineController as addMachineCtrl',
        size: 'lg',
        backdrop: false,
        resolve: {
          fleet: function () {
            return vm.fleet;
          },
          type : function () {
            return type
          }
        }
      });

      modalInstance.result.then(function (result) {

        vm.query(null, null, null, vm.fleet,type);

      }, function () {
        //取消
      });
    }

    vm.backToOrg = function (machine) {

      var machineIds = [machine.id];
      var moveOrg = {ids: machineIds, "orgId": machine.org.id};

      var restPromise = serviceResource.restUpdateRequest(MACHINE_MOVE_FLEET_URL, moveOrg);
      restPromise.then(function (data) {
        //更新页面显示
        vm.query(null, null, null, vm.fleet,'work')
        Notification.success("归还车辆成功!");
        machine.fleet =machine.org;
      }, function (reason) {
        Notification.error("归还车辆出错!");
      });


    }
  }
})();
