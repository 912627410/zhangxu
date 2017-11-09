/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalOrderController', newRentalOrderController);

  /** @ngInject */
  function newRentalOrderController($rootScope,$window,$uibModal,$uibModalInstance,treeFactory,serviceResource,RENTAL_ORDER_URL,rentalService, Notification,languages) {
    var vm = this;
    vm.rentalOrder={};
    var path="/rental/order";
    //订单车辆类型 List
    vm.rentalOrderMachineTypeVos = [];
    vm.addRentalOrderOption = {
      orderVo:'',
      orderMachineTypeVoList:'',
      orderMachineVoList:''

    }

    vm.jcOption = {
      deviceType :{id:1}
    }
    vm.qbOption = {
      deviceType :{id:2}
    }
    vm.zbOption = {
      deviceType :{id:3}
    }

    vm.rightBoxBottomHeight=20;
    vm.rightBoxTopHeightTemp=20;
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 10 -25 -5 - 90 - 15 - 7;//50 topBar的高,10间距,25面包屑导航,5间距90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      var baseBoxMapContainerHeight = baseBoxContainerHeight - 45;//地图上方的header高度
      //地图的自适应高度
      vm.baseBoxMapContainer = {
        "min-height": baseBoxMapContainerHeight + "px"
      }

      var rightBoxTopHeight=baseBoxContainerHeight/2;
      vm.rightBoxTopHeightTemp=rightBoxTopHeight-20;
      //地图的右边自适应高度
      vm.rightBoxTopHeight = {
        "min-height": vm.rightBoxTopHeightTemp+ "px"
      }
      vm.rightBoxBottomHeight=rightBoxTopHeight;
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);



    var path="/rental/order";
    vm.operatorInfo =$rootScope.userInfo;

    vm.cancel = function () {
      $uibModalInstance.close();
    };


    vm.startDateSetting = {
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
        vm.orderMachineVoList=result;
      }, function () {
      });
    };


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


    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.ok = function () {
      if(vm.rentalOrder.endDate==null||vm.rentalOrder.startDate==null||vm.rentalOrder.endDate==undefined||vm.rentalOrder.startDate==undefined){
        Notification.error(languages.findKey('selTime'));
      }

        vm.rentalOrder.jc = vm.zbOption.quantity;
        vm.rentalOrder.zb= vm.zbOption.quantity;
        vm.rentalOrder.qb = vm.qbOption.quantity;
        vm.rentalOrder.org= vm.rentalOrder.rentalCustomer.org;
        vm.rentalOrderMachineTypeVos.push(vm.zbOption)
        vm.rentalOrderMachineTypeVos.push(vm.jcOption)
        vm.rentalOrderMachineTypeVos.push(vm.qbOption)
        vm.rentalOrder.machineTypeVos = vm.rentalOrderMachineTypeVos;

       vm.addRentalOrderOption.orderVo = vm.rentalOrder;
       vm.addRentalOrderOption.orderMachineTypeVoList =  vm.rentalOrderMachineTypeVos;
       vm.addRentalOrderOption.orderMachineVoList = vm.orderMachineVoList;

        var rspdata = serviceResource.restAddRequest(RENTAL_ORDER_URL,vm.addRentalOrderOption);
        rspdata.then(function (data) {
          // $uibModalInstance.close(data.content);
          Notification.success(languages.findKey('newOrderSucc'));
          $uibModalInstance.close(data.content);
        },function (reason) {
          Notification.error(reason.data.message);
        })

    }



    //选择订单客户
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
        vm.rentalOrder.rentalCustomer=result;
      }, function () {
      });
    };







  }
})();
