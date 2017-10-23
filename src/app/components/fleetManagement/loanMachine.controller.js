/**
 * Created by xiaopeng on 16-8-23.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('loanMachineController', loanMachineController);

  /** @ngInject */
  function loanMachineController($rootScope, $scope, $uibModal, permissions,ngTableDefaults,$uibModalInstance,$filter, NgTableParams, Notification, serviceResource,MACHINE_MOVE_FLEET_URL,MACHINE_MOVE_ORG_URL,MACHINE_PAGE_URL,fleet,languages) {
    var vm = this;
    vm.fleet = fleet;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id

    vm.cancel = function () {
      $uibModalInstance.close(vm.fleet);
      $uibModalInstance.dismiss('cancel');
    };

    ngTableDefaults.settings.counts = [];

    vm.queryMachine = function (page, size, sort, machine) {
      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != machine) {

        if (null != machine.deviceNum&&machine.deviceNum!="") {
          restCallURL += "&search_LIKE_deviceinfo.deviceNum=" + $filter('uppercase')(machine.deviceNum);
        }
        if (null != machine.licenseId&&machine.licenseId!="") {
          restCallURL += "&search_LIKE_licenseId=" + $filter('uppercase')(machine.licenseId);
        }

      }

      restCallURL += "&search_NEQ_fleetEntity.id=" + vm.fleet.id;



      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.machineTableParams = new NgTableParams({

        }, {
          dataset: data.content
        });
        vm.machinePage = data.page;
        vm.machinePageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error(languages.findKey('getDataVeFail'));
      });
    };

    vm.queryMachine();

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
      vm.machineTableParams.data.forEach(function (machine) {
        updateSelected(action, machine.id);
      })

    }

    vm.isSelected = function (id) {

      return vm.selected.indexOf(id) >= 0;
    }
    vm.checkAll = function () {
      var operStatus = false;
      if (vm.selectAll) {
        operStatus = false;
        vm.selectAll = false;
      } else {
        operStatus = true;
        vm.selectAll = true;
      }

      vm.deviceinfoList.forEach(function (deviceinfo) {
        deviceinfo.checked = operStatus;
      })
    }


    //批量设置为已处理
    vm.batchMoveOrg = function () {
      var restCallURL = MACHINE_MOVE_FLEET_URL;

      if (vm.selected.length == 0) {
          Notification.warning({message: '请选择要借调的车辆', positionY: 'top', positionX: 'center'});
          return;
      }

      var moveOrg = {ids: vm.selected, "orgId": vm.fleet.id};

      var restPromise = serviceResource.restUpdateRequest(restCallURL, moveOrg);
      restPromise.then(function (data) {
        //更新页面显示
        vm.machineTableParams.data.forEach(function (machine) {
          //循环table,更新选中的设备
          if(vm.selected.indexOf(machine.id)!=-1){
            machine.checked=false;
            machine.fleet=vm.fleet;

          }
        })
        vm.selected=[]; //把选中的设备设置为空

        Notification.success(languages.findKey('VehAllSu'));
        $uibModalInstance.close();
      }, function (reason) {
        Notification.error(languages.findKey('VehAllFa'));
      });


    };

  }
})();
