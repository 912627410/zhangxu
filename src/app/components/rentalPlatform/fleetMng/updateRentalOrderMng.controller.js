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
    vm.rentalOrderMachineTypeVos = [];
    vm.orderMachineTypeVoList = orderMachineTypeVoList;
    for(var i = 0;i<vm.orderMachineTypeVoList.length;i++){
      if(vm.orderMachineTypeVoList[i].deviceType.id == 1){
        vm.jcOption = vm.orderMachineTypeVoList[i]
      }
      if(vm.orderMachineTypeVoList[i].deviceType.id == 2){
        vm.qbOption = vm.orderMachineTypeVoList[i]
      }
      if(vm.orderMachineTypeVoList[i].deviceType.id == 3){
        vm.zbOption = vm.orderMachineTypeVoList[i]
      }
    }


    // vm.customer=vm.rentalOrder.rentalCustomer;
    // vm.org=vm.rentalOrder.org;

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

      if(vm.rentalOrder.endDate==null||vm.rentalOrder.startDate==null||vm.rentalOrder.endDate==undefined||vm.rentalOrder.startDate==undefined){
        Notification.error(languages.findKey('selTime'));
      }

      vm.rentalOrder.jc = vm.jcOption.quantity;
      vm.rentalOrder.zb= vm.zbOption.quantity;
      vm.rentalOrder.qb = vm.qbOption.quantity;
      if(vm.zbOption.quantity){
        vm.rentalOrderMachineTypeVos.push(vm.jcOption)
      }
      if( vm.qbOption.quantity){
        vm.rentalOrderMachineTypeVos.push(vm.qbOption)
      }

      if(vm.zbOption.quantity){
        vm.rentalOrderMachineTypeVos.push(vm.zbOption)
      }
      vm.rentalOrder.org= vm.rentalOrder.rentalCustomer.org;
      vm.rentalOrder.machineTypeVos = vm.rentalOrderMachineTypeVos;

      vm.addRentalOrderOption.orderVo = vm.rentalOrder;
      vm.addRentalOrderOption.orderMachineTypeVoList =  vm.rentalOrderMachineTypeVos;
      vm.addRentalOrderOption.orderMachineVoList = null;

      // vm.rentalOrder.org=vm.customer.org; //TODO ,客户所属组织发生了变化,是否需要更新原始订单呢? by riqian.ma 20170829

      var rspdata = serviceResource.restUpdateRequest(RENTAL_ORDER_URL,vm.addRentalOrderOption);
      rspdata.then(function (data) {
        Notification.success(languages.findKey('upOrderSucc'));
        $uibModalInstance.close(data.content);

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
