/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalMaintenanceController', newRentalMaintenanceController);

  /** @ngInject */
  function newRentalMaintenanceController($rootScope,$scope,$http,$confirm, $filter,$uibModal,rentalService,$location,NgTableParams,treeFactory,serviceResource,RENTAL_MAINTENANCE_URL,RENTANL_MAINTENANCE_MACHINE_PAGE_URL,RENTAL_MAINTENANCE_TYPE_URL, Notification,languages) {
    var vm = this;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id
   // vm.maintenance={};

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



    var listStatusPromise = rentalService.getMaintenanceListStatusList();
    listStatusPromise.then(function (data) {
      vm.listStatusList= data;

    }, function (reason) {
      Notification.error(languages.findKey('faGetState'));
    })



    vm.ok = function () {
      vm.maintenance.machine=vm.machine;
      vm.maintenance.maintenanceListVo=vm.tableParams.data;

      if (null != vm.status) {
        vm.maintenance.status= vm.status.value;
      }

      for(var i=0;i<vm.maintenance.maintenanceListVo.length;i++){
        vm.maintenance.maintenanceListVo[i].status=vm.maintenance.maintenanceListVo[i].status.value;
      }


      var rspdata = serviceResource.restAddRequest(RENTAL_MAINTENANCE_URL,vm.maintenance);

      rspdata.then(function (data) {
        Notification.success(languages.findKey('newMaInS'));
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
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalMaintenanceMachineListMng.html',
        controller: 'maintenanceMachineListMngController as maintenanceMachineListMngCtrl',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          },
          selectUrl: function () {
          return RENTANL_MAINTENANCE_MACHINE_PAGE_URL;
        }
        }
      });

      modalInstance.result.then(function (result) {
        vm.rightRentalOrder=result;


        console.log(result);
        vm.machine=result;

        vm.queryTypes(vm.machine.id);




      }, function () {
      });
    };

    vm.queryTypes = function ( machineId) {


      var restCallURL = RENTAL_MAINTENANCE_TYPE_URL;
      restCallURL += "?id="+machineId;

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });

      }, function (reason) {
        Notification.error(languages.findKey('faGetWorkData'));
      });
    };

    vm.open = function($event, dt) {
      $event.preventDefault();
      $event.stopPropagation();


      dt.opened = true;

    };

    var updateSelected = function (action, id) {
      if (action == 'add' && vm.selected.indexOf(id) == -1) {
        vm.selected.push(id);
      }
      if (action == 'remove' && vm.selected.indexOf(id) != -1) {
        var idx = vm.selected.indexOf(id);
        vm.selected.splice(idx, 1);

      }
    }

    vm.updateSelection = function ($event, id, status) {

      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    }


    vm.updateAllSelection = function ($event) {
      var checkbox = $event.target;
      var action = (checkbox.checked ? 'add' : 'remove');

      vm.tableParams.data.forEach(function (maintenanceList) {
        updateSelected(action, maintenanceList.machineMaintenanceType.id);
      })

    }

    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    }




  }
})();
