/**
 * Created by shuangshan on 16/1/18.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMngController', machineMngController);

  /** @ngInject */
  function machineMngController($rootScope, $scope, $uibModal, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, MACHINE_PAGE_URL, MACHINE_MOVE_ORG_URL,MACHINE_REMOVE_ORG_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.radioListType = "list";
    vm.org = {label: ""};    //调拨组织

    vm.query = function (page, size, sort, machine) {
      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != machine) {

        if (null != machine.deviceNum) {
          restCallURL += "&search_LIKE_deviceinfo.deviceNum=" + machine.deviceNum;
        }
        if (null != machine.licenseId) {
          restCallURL += "&search_LIKE_licenseId=" + machine.licenseId;
        }

      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.machineList = data.content;
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error("获取车辆数据失败");
      });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN") {
      vm.query();
    }

    //重置查询框
    vm.reset = function () {
      vm.machine.licenseId = null;
      vm.machine.deviceNum = null;
    }


    //查询条件相关
    vm.showOrgTree = false;

    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }


    vm.hideOrgTree = function () {
      vm.showOrgTree = false;
    }

    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })


    vm.newMachine = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineManagement/newMachine.html',
        controller: 'newMachineController as newMachineController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        //刷新
        vm.query();
      }, function () {
        //取消
      });
    };

    vm.updateMachine = function (machine, size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineManagement/updateMachine.html',
        controller: 'updateMachineController as updateMachineController',
        size: size,
        backdrop: false,
        resolve: {
          machine: function () {
            return machine;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
//        vm.selected = selectedItem;
        //刷新
        vm.query();
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };


    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id

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
      // alert(action);
      vm.machineList.forEach(function (machine) {
        updateSelected(action, machine.id);
      })

    }

    vm.isSelected = function (id) {
      //   alert(vm.selected);
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
        alert("请选择要调拨的车辆");
        return;
      }


      if (vm.org.label == "") {
        alert("请选择要调拨的组织");
        return;
      }

      //alert(vm.org.id+" "+vm.org.label);

      var moveOrg = {ids: vm.selected, "orgId": vm.org.id};
      // alert(moveOrg.ids+"  "+moveOrg.orgId);


      var restPromise = serviceResource.restUpdateRequest(MACHINE_MOVE_ORG_URL, moveOrg);
      restPromise.then(function (data) {
        Notification.success("调拨车辆成功!");
        vm.query(null, null, null, null);
      }, function (reason) {
        Notification.error("调拨车辆出错!");
      });


    };

    vm.hasRemoveDevice = function (machine) {
      //用户权限
      var role = vm.operatorInfo.userdto.role;
      var rolePermission = (role == 'ROLE_SYSADMIN' || role == 'ROLE_ADMIN' || role == 'ROLE_OPERATOR' || role == 'ROLE_PRODUCER');

      //设备是否已绑定
      var devicePermission=machine.deviceinfo==null?false:true;
     // alert(rolePermission&&devicePermission);
        return rolePermission&&devicePermission;

    };

    vm.removeDevice = function (machine) {
      if(!confirm("确认要解绑吗?")){
        return false;
      }

      var restPromise = serviceResource.restUpdateRequest(MACHINE_REMOVE_ORG_URL, machine.id);
      restPromise.then(function (data) {
        Notification.success("解绑设备成功!");
        vm.query(null, null, null, null);
      }, function (reason) {
        Notification.error("解绑设备出错!");
      });
    };
  }
})();
