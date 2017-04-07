/**
 * Created by xiaopeng on 16-8-24.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('fleetMachineMngController', fleetMachineMngController);

  /** @ngInject */
  function fleetMachineMngController($rootScope,treeFactory,ngTableDefaults,$uibModal,$uibModalInstance,NgTableParams,MACHINE_PAGE_URL,MACHINE_LOANPAGE_URL,MACHINE_MOVE_FLEET_URL,MACHINE_MOVE_ORG_URL,serviceResource, Notification,fleet) {
    var vm = this;
    vm.fleet = fleet;
    vm.operatorInfo =$rootScope.userInfo;
    vm.org = {label: ""};    //调拨组织
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function(selectedItem){
        vm.org = selectedItem;
      });
    }



    //重置查询框
    vm.reset = function () {
      vm.machine = null;
    }

    vm.cancel = function () {
      $uibModalInstance.close(vm.fleet);
      $uibModalInstance.dismiss('cancel');
    };

    ngTableDefaults.settings.counts = [];

    vm.queryOwn = function (page, size, sort, fleet) {

      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 5;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if(null != fleet&&null != fleet.id){
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

    };

    vm.queryOther = function (page, size, sort, fleet) {

      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 5;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if(null != fleet&&null != fleet.id){
        restCallURL += "&search_EQ_fleetEntity.id=" +fleet.id;
        restCallURL += "&search_NEQ_orgEntity.id=" +fleet.id;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          vm.otherTableParams = new NgTableParams({},
            {
              dataset: data.content
            });
          vm.otherPage = data.page;
          vm.otherPagenumber = data.page.number + 1;

        },function (reason) {

        });
      }


    };

    vm.queryOwn(null, null, null, vm.fleet);
    vm.queryOther(null, null, null, vm.fleet);

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


    vm.backToOrg = function (machine) {

      var machineIds = [machine.id];
      var moveOrg = {ids: machineIds, "orgId": machine.org.id};

      var restPromise = serviceResource.restUpdateRequest(MACHINE_MOVE_FLEET_URL, moveOrg);
      restPromise.then(function (data) {
        //更新页面显示
        vm.queryOther(vm.otherPagenumber-1, null, null, vm.fleet);
        Notification.success("归还车辆成功!");
        machine.fleet =machine.org;
      }, function (reason) {
        Notification.error("归还车辆出错!");
      });


    }

    vm.loanMachine = function (type) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/loanMachine.html',
        controller: 'loanMachineController as loanMachineCtrl',
        size: 'lg',
        backdrop: false,
        resolve: {
          fleet: function () {
            return vm.fleet;
          }
        }
      });

      modalInstance.result.then(function (result) {

        vm.queryOwn(null, null, null, vm.fleet);
        vm.queryOther(null, null, null, vm.fleet);

      }, function () {
        //取消
      });
    }

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
      vm.ownTableParams.data.forEach(function (machine) {
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

      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});

        return;
      }


      if (null==vm.org||vm.org.label == "") {
        Notification.warning({message: '请选择要调拨的组织', positionY: 'top', positionX: 'center'});

        return;
      }

      var moveOrg = {ids: vm.selected, "orgId": vm.org.id};

      var restPromise = serviceResource.restUpdateRequest(MACHINE_MOVE_ORG_URL, moveOrg);
      restPromise.then(function (data) {
        //更新页面显示
        vm.ownTableParams.data.forEach(function (machine) {
          //循环table,更新选中的设备
          if(vm.selected.indexOf(machine.id)!=-1){
            machine.checked=false;
            machine.org.label=vm.org.label;
            // console.log(deviceinfo.org.label);
          }
        })
        vm.org=null;
        vm.selected=[]; //把选中的设备设置为空
        Notification.success("调拨车辆成功!");

      }, function (reason) {
        Notification.error("调拨车辆出错!");
      });


    };

  }
})();
