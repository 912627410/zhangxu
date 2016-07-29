/**
 * Created by develop on 7/25/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateMachineListController', updateMachineListController);

  /** @ngInject */
  function updateMachineListController($rootScope,$scope,$http,$confirm,$filter,$uibModalInstance,NgTableParams,MACHINE_PAGE_URL,MACHINE_MOVE_FLEET_URL,serviceResource, Notification,fleet) {
    var vm = this;
    vm.fleet = fleet;
    vm.operatorInfo =$rootScope.userInfo;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id

    vm.query = function (page, size, sort, fleet) {

      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if(null != fleet&&null != fleet.id){
        restCallURL += "&search_EQ_orgEntity.id=" +fleet.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({},
          {
            dataset: data.content
          });
        vm.page = data.page;
        vm.machine_pagenumber = data.page.number + 1;

      },function (reason) {

      });
    };

    vm.query(null, null, null, vm.fleet);

    //重置查询框
    vm.reset = function () {
      vm.machine = null;
    }

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

      if (null != vm.fleet&&null != vm.fleet.id) {
        restCallURL += "&search_NEQ_orgEntity.id=" + vm.fleet.id;
      }

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
        Notification.error("获取车辆数据失败");
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
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

      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});

        return;
      }


      if (null==vm.fleet||vm.fleet.id == "") {
        Notification.warning({message: '请选择要调拨的组织', positionY: 'top', positionX: 'center'});

        return;
      }

      var moveOrg = {ids: vm.selected, "orgId": vm.fleet.id};

      var restPromise = serviceResource.restUpdateRequest(MACHINE_MOVE_FLEET_URL, moveOrg);
      restPromise.then(function (data) {
        //更新页面显示
        vm.machineTableParams.data.forEach(function (machine) {
          //循环table,更新选中的设备
          if(vm.selected.indexOf(machine.id)!=-1){
            machine.checked=false;
            machine.fleet=vm.fleet;
            // console.log(deviceinfo.org.label);
          }
        })
        vm.selected=[]; //把选中的设备设置为空
        Notification.success("借调车辆成功!");

      }, function (reason) {
        Notification.error("借调车辆出错!");
      });


    };
  }
})();
