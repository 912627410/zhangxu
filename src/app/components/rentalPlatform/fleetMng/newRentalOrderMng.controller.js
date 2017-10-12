/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalOrderController', newRentalOrderController);

  /** @ngInject */
  function newRentalOrderController($rootScope,$window,$scope,$timeout,$http,$confirm,$uibModal,$location,treeFactory,serviceResource,RENTAL_ORDER_URL,AMAP_GEO_CODER_URL,rentalService, Notification) {
    var vm = this;
    vm.rentalOrder={};

    vm.radius = 100; //设置的半径,默认100米

    var path="/rental/order";
    vm.operatorInfo =$rootScope.userInfo;
    vm.cancel = function () {
      $location.path(path)
    };


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
        vm.customer=result;
      }, function () {
      });
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


    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.ok = function () {
      if(vm.rentalOrder.endDate==null||vm.rentalOrder.startDate==null||vm.rentalOrder.endDate==undefined||vm.rentalOrder.startDate==undefined){
        Notification.error("请选择订单开始时间和结束时间");
      } else{
        vm.rentalOrder.rentalCustomer=vm.customer;
        vm.rentalOrder.radius=vm.radius;
        vm.rentalOrder.org=vm.customer.org;

        if (vm.locationAlarmReceiverChk){
          vm.rentalOrder.locationAlarmReceiver = 1;
        }
        else{
          vm.rentalOrder.locationAlarmReceiver = 0;
        }

        var rspdata = serviceResource.restAddRequest(RENTAL_ORDER_URL,vm.rentalOrder);
        //  vm.rentalCustomer.org=vm.org;
        rspdata.then(function (data) {
          Notification.success("新建订单成功!");
          $location.path(path);

        },function (reason) {
          Notification.error(reason.data.message);
        })
      }
    }


    //新建角色
    vm.selectCustomer = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalCustomerListMng.html',
        controller: 'customerListController as customerListController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.customer=result;
      }, function () {
      });
    };



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



  }
})();
