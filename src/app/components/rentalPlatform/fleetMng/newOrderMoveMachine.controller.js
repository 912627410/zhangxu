/**
 * Created by mengwei on 17-9-28.
 */


(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newOrderMoveMachineController', newOrderMoveMachineController);

   // newOrderMoveMachineController.$inject = ["NgTableParams", "ngTableSimpleList"];
  /** @ngInject */
  function newOrderMoveMachineController($rootScope,$window,$scope,NgTableParams,$uibModalInstance,serviceResource,Notification,machineOption,machineType,RENTANL_UNUSED_MACHINE_PAGE_URL,DEFAULT_SIZE_PER_PAGE) {
    var vm = this
    vm.machineType = machineType;
    vm.machineOption = machineOption;
    vm.userInfo = $rootScope.userInfo;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的machineId
    var originalData ;

    vm.queryMachine = function (machineOption,machineType,page,size,sort) {
      var restCallURL = RENTANL_UNUSED_MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      restCallURL += "&orgId=" + vm.userInfo.userdto.organizationDto.id;
      if (null != machineType) {
        if (null != machineType && machineType != "") {
          restCallURL += "&machineType=" + machineType;
        }
      }
      if (null != machineOption) {
        if (null != machineOption.heightTypeId&&machineOption.heightTypeId!="") {
          restCallURL += "&heightTypeId=" + machineOption.heightTypeId;
        }
        if (null != machineOption.factoryId&&machineOption.factoryId!="") {
          restCallURL += "&factoryId=" + machineOption.factoryId;
        }
      }



      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          filterDelay: 0,
          dataset: angular.copy(data.content)
          // dataset: data.content
        });
        vm.page = data.page;
        //vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error("获取车辆数据失败");
      });

    }
    vm.queryMachine(vm.machineOption,vm.machineType,null,null,null);


    vm.cancel = cancel;
    vm.save = save;


    function cancel(machine, machineForm) {
      var originalRow = resetRow(machine, machineForm);
      angular.extend(machine, originalRow);
    }


    function save(machine, machineForm) {
      var originalRow = resetRow(machine, machineForm);
      angular.extend(originalRow, machine);
    }
    function resetRow(machine, machineForm){
      machine.isEditing = false;
      machineForm.$setPristine();
      vm.tableTracker.untrack(machine);
      return _.findWhere(originalData, function(r){
        return r.id === machineForm.id;
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
      vm.tableParams.data.forEach(function (machine) {
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






    vm.moveConfirm = function () {
      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});

        return;
      }

    };

    vm.moveCancel = function () {
      $uibModalInstance.dismiss('cancel');
    }



  }
})();
