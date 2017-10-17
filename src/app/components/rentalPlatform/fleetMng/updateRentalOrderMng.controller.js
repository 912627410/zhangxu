/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRentalOrderController', updateRentalOrderController);

  /** @ngInject */
  function updateRentalOrderController($rootScope,$window,$scope,$timeout,$stateParams,$http,$confirm,$uibModal,$location,treeFactory,serviceResource,RENTAL_ORDER_URL,AMAP_GEO_CODER_URL, Notification) {
    var vm = this;
    vm.rentalOrder={};


    var path="/rental/order";
    vm.operatorInfo =$rootScope.userInfo;
    vm.cancel = function () {
      $location.path(path);

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

      vm.rentalOrder.rentalCustomer=vm.customer;
      vm.rentalOrder.radius=vm.radius;
     // vm.rentalOrder.org=vm.customer.org; //TODO ,客户所属组织发生了变化,是否需要更新原始订单呢? by riqian.ma 20170829

      if (vm.locationAlarmReceiverChk){
        vm.rentalOrder.locationAlarmReceiver = 1;
      }
      else{
        vm.rentalOrder.locationAlarmReceiver = 0;
      }

      var rspdata = serviceResource.restUpdateRequest(RENTAL_ORDER_URL,vm.rentalOrder);
      rspdata.then(function (data) {
        Notification.success("更新订单成功!");
        $location.path(path);

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



    //查询要修改的客户信息
    vm.getOrder=function(){
      var id=$stateParams.id;
      var url=RENTAL_ORDER_URL+"?id="+id;
      var rspdata = serviceResource.restCallService(url,"GET");

      rspdata.then(function (data) {
        vm.rentalOrder=data.content;
        vm.customer=vm.rentalOrder.rentalCustomer;
        vm.org=vm.rentalOrder.org;
        vm.selectAddress=vm.rentalOrder.location;
        vm.amaplongitudeNum=vm.rentalOrder.longitude;
        vm.amaplatitudeNum=vm.rentalOrder.latitude;
        vm.radius=vm.rentalOrder.radius;

        if (vm.rentalOrder.locationAlarmReceiver ==1){
          vm.locationAlarmReceiverChk=true;
        }
        else{
          vm.locationAlarmReceiverChk=false;
        }


      },function (reason) {
        Notification.error(reason.data.message);
      })

    }

    vm.getOrder();


  }
})();
