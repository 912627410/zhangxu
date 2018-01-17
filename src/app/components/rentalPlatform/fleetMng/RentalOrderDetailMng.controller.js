/**
 * Created by riqian.ma on 1/8/17.
 */

(function(){
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalOrderDetailController',rentalOrderDetailController);

  /** @ngInject */
  function rentalOrderDetailController ($rootScope,$location,$uibModal,$stateParams,$confirm,serviceResource,RENTAL_ORDER_URL,Notification,languages,RENTAL_ORDER_MACHINE_HISTORY_URL,RENTAL_ORDER_ENTRY_EXIT_LIST_URL,RENTANL_ATTACH_DELETE_URL,NgTableParams){
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.orderId=$stateParams.id;
    //根据订单id查询订单信息
    var orderUrl = RENTAL_ORDER_URL + "?id=" + vm.orderId;
    var rspdata = serviceResource.restCallService(orderUrl, "GET");
    rspdata.then(function (data) {
      vm.retalOrderTotalVo = data.content;
      vm.rentalOrder = vm.retalOrderTotalVo.orderVo;
    }, function () {
          //取消
    });

    //订单下车辆List查询
    vm.carlist = function(sort,id){
      var restCallURL = RENTAL_ORDER_MACHINE_HISTORY_URL;
      var sortUrl = sort||"id,desc";
      restCallURL += "?sort="+sortUrl;
      restCallURL += "&id="+id;

      var rspData = serviceResource.restCallService(restCallURL,"GET");
      rspData.then(function(data){
        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        },{
          dataset:data.content
        });
      },function(reason){
      });
    };
    vm.carlist(null,vm.orderId);

    //订单下车辆List查询
    vm.entryList = function(sort,id){
      var sortUrl = sort||"id,desc";
      var restCallURL = RENTAL_ORDER_ENTRY_EXIT_LIST_URL+"?sort="+sortUrl+"&orderId="+id;
      var entryListURL = restCallURL+"&type="+1;
      var exitListURL = restCallURL+"&type="+2;
      var entryRspData = serviceResource.restCallService(entryListURL,"GET");
      entryRspData.then(function(data){
        vm.entryTableParams = new NgTableParams({},{
          dataset:data.content
        });
      },function(reason){
      });
      var exitRspData = serviceResource.restCallService(exitListURL,"GET");
      exitRspData.then(function(data){
        vm.exitTableParams = new NgTableParams({},{
          dataset:data.content
        });
      },function(reason){
      });
    };
    vm.entryList(null,vm.orderId);

    var path="/rental/order";
    vm.cancel = function(){
      $location.path(path);
    };

    //车辆进场
    vm.goSite = function (rentalOrder) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalGoSite.html',
        controller: 'rentalGoSiteController as rentalGoSiteCtrl',
        size: 'lg',
        resolve: {
          rentalOrder: function () {
            return rentalOrder;
          }
        }
      });
      modalInstance.result.then(function (result) {
        rentalOrder.realNumber = rentalOrder.realNumber + result;
      }, function () {
        //取消
      });
    }

    //车辆退场
    vm.leaveSite = function (rentalOrder) {
      var orderId = rentalOrder.id;
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalLeaveSite.html',
        controller: 'rentalLeaveSiteController as rentalLeaveSiteCtrl',
        size: 'lg',
        resolve: {
          orderId: function () {
            return orderId;
          }
        }
      });
      modalInstance.result.then(function (result) {
        rentalOrder.realNumber = rentalOrder.realNumber - result;
      }, function () {
        //取消
      });
    }

    //订单变更
    vm.update = function (id, realNumber) {
      var orderUrl = RENTAL_ORDER_URL + "?id=" + id;
      var rspdata = serviceResource.restCallService(orderUrl, "GET");
      rspdata.then(function (data) {
        var retalOrder = data.content.orderVo;
        var orderMachineTypeVoList = data.content.orderMachineTypeVoList;
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'app/components/rentalPlatform/fleetMng/updateRentalOrderMng.html',
          controller: 'updateRentalOrderController as updateRentalOrderCtrl',
          size: 'lg',
          resolve: {
            retalOrder: function () {
              return retalOrder;
            },
            orderMachineTypeVoList: function () {
              return orderMachineTypeVoList;
            }
          }
        });
        modalInstance.result.then(function (result) {
          var tabList = vm.tableParams.data;
          result.realNumber = realNumber;
          //更新内容
          for (var i = 0; i < tabList.length; i++) {
            if (tabList[i].id == result.id) {
              tabList[i] = result;
            }
          }
          vm.getStatusNumber();
        }, function () {
          //取消
        });
      })
    }
  }
})();
