/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('maintenanceMachineListMngController', orgMachineListMngController);

  /** @ngInject */
  function orgMachineListMngController($scope, $window, $location,$uibModalInstance,$filter, $anchorScroll, languages,serviceResource,NgTableParams,ngTableDefaults,Notification,treeFactory,commonFactory,permissions,rentalService,DEFAULT_SIZE_PER_PAGE,selectUrl) {
    var vm = this;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id
    //定义每页显示多少条数据
    vm.pageSize = 20;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    //加载品牌信息
    var deviceManufactureListPromise = rentalService.getDeviceManufactureList();
    deviceManufactureListPromise.then(function (data) {
      vm.deviceManufactureList= data.content;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error(languages.findKey('getVendorFail'));
    })

    //加载高度信息
    var deviceHeightTypeListPromise = rentalService.getDeviceHeightTypeList();
    deviceHeightTypeListPromise.then(function (data) {
      vm.deviceHeightTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getHeFail'));
    })

    //加载车辆类型信息
    var deviceTypeListPromise = rentalService.getDeviceTypeList();
    deviceTypeListPromise.then(function (data) {
      vm.deviceTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getTypeFail'));
    })

    //加载车辆驱动信息
    var devicePowerTypeListPromise = rentalService.getDevicePowerTypeList();
    devicePowerTypeListPromise.then(function (data) {
      vm.devicePowerTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getDriFail'));
    })




    vm.query = function (currentPage, pageSize, totalElements, searchConditions) {

      var restCallURL = selectUrl;
      var pageUrl = currentPage || 0;
      var sizeUrl = pageSize || DEFAULT_SIZE_PER_PAGE;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl;
      if (totalElements != null || totalElements != undefined) {
        restCallURL += "&totalElements=" + totalElements;
      }
      if (searchConditions!=null){
        restCallURL = commonFactory.processSearchConditions(restCallURL, searchConditions);
      }
      if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
        restCallURL += "&orgId=" + vm.org.id;
      }

      var machineDataPromis = serviceResource.restCallService(restCallURL, "GET");
      machineDataPromis.then(function (data) {
        vm.machineDataList = data.content;
        vm.tableParams = new NgTableParams({}, {dataset: vm.machineDataList});
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    };


    vm.query(0,null,null,null);


    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

    //提交
    vm.ok = function () {
      // $uibModalInstance.close(vm.selectRadio);
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


    vm.reset = function () {
      vm.searchConditions = null;
      vm.org = null;
    }


    var updateSelected = function (action, machine) {
      if (action == 'add' && vm.selected.indexOf(machine.id) == -1) {
        vm.selected.push(machine.id);
      }
      if (action == 'remove' && vm.selected.indexOf(machine.id) != -1) {
        var idx = vm.selected.indexOf(machine.id);
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
        updateSelected(action, machine);
      })

    }

    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    }


    //提交
    vm.ok = function () {
      $uibModalInstance.close(vm.selectRadio);
    };



  }
})();
