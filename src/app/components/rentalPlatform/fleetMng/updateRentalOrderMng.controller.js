/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRentalOrderController', updateRentalOrderController);

  /** @ngInject */
  function updateRentalOrderController($rootScope,$window,$uibModalInstance,$uibModal,$location,treeFactory,serviceResource,rentalService,RENTAL_ORDER_URL, Notification,retalOrder,orderMachineTypeVoList,languages) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.rentalOrder= retalOrder;
    vm.rentalOrderMachineTypeVos = [];
    vm.updateRentalOrderOption = {
      orderVo:'',
      orderMachineTypeVoList:''
    }


    vm.orderMachineTypeVoList = orderMachineTypeVoList;
    for(var i = 0;i<vm.orderMachineTypeVoList.length;i++){

    }

    vm.startDateSetting = {
      //dt: "请选择开始日期",
      open: function($event) {
        vm.startDateSetting.status.opened = true;
      },
      dateOptions: {
        formatYear: 'yy',
        startingDay: 1
      },
      status: {
        opened: false
      }
    };



    //vm.startDateSetting.dt="";

    // 日期控件相关
    // date picker
    vm.startDateOpenStatus = {
      opened: false
    };

    vm.startDateOpen = function ($event) {
      vm.startDateOpenStatus.opened = true;
    };

    vm.endDateOpenStatus = {
      opened: false
    };

    vm.endDateOpen = function ($event) {
      vm.endDateOpenStatus.opened = true;
    };

    //加载品牌信息
    var deviceManufactureListPromise = rentalService.getDeviceManufactureList();
    deviceManufactureListPromise.then(function (data) {
      vm.deviceManufactureList= data.content;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取厂家失败');
    })

    //加载高度信息
    var deviceHeightTypeListPromise = rentalService.getDeviceHeightTypeList();
    deviceHeightTypeListPromise.then(function (data) {
      vm.deviceHeightTypeList= data.content;
    }, function (reason) {
      Notification.error('获取高度失败');
    })

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }


    vm.ok = function () {

      //订单所属组织为客户的所属组织
      vm.rentalOrder.org = vm.operatorInfo.userdto.organizationDto;
      vm.rentalOrder.machineTypeVos = vm.rentalOrderMachineTypeVos;

      vm.updateRentalOrderOption.orderVo = vm.rentalOrder;
      vm.updateRentalOrderOption.orderMachineTypeVoList =  vm.rentalOrderMachineTypeVos;
      vm.updateRentalOrderOption.orderMachineVoList = null;


      var rspdata = serviceResource.restUpdateRequest(RENTAL_ORDER_URL,vm.updateRentalOrderOption);
      rspdata.then(function (data) {
        Notification.success(languages.findKey('upOrderSucc'));
        var result = data.content.orderVo;
        result.customerName = result.rentalCustomer.name;
        result.realNumber = 0;
        $uibModalInstance.close(result);

      },function (reason) {
        Notification.error(reason.data.message);
      })
    }


    //新建角色
    vm.selectCustomer = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalCustomerListMng.html',
        controller: 'customerListController as customerListCtrl',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.rentalOrder.rentalCustomer = result;
      }, function () {
      });
    };


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    // 订单关联车辆
    vm.addMachine=function (size,machineOption,machineType) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/newOrderMoveMachine.html',
        controller: 'newOrderMoveMachineController',
        controllerAs:'newOrderMoveMachineCtrl',
        size: size,
        backdrop: false,
        resolve: {
          machineOption: function () {
            return machineOption;
          },
          machineType: function () {
            return machineType;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.customer=result;
      }, function () {
      });
    };



  }
})();
