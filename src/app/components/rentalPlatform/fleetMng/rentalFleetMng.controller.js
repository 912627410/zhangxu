/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalFleetMngController', rentalFleetMngController);

  /** @ngInject */
  function rentalFleetMngController($scope, $window, $location, $uibModal,$anchorScroll, serviceResource,NgTableParams,ngTableDefaults,Notification,permissions,rentalService,DEFAULT_SIZE_PER_PAGE,RENTANL_ORDER_MACHINE_BATCH_OPER_URL,RENTAL_ORDER_MACHINE_PAGE_URL) {
    var vm = this;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //定义偏移量
    $anchorScroll.yOffset = 50;


    vm.leftRentalOrderId=181889905;
    vm.rightRentalOrderId=181889930;




    vm.leftQuery = function (page, size, sort, order) {
      var restCallURL = RENTAL_ORDER_MACHINE_PAGE_URL;

      var sortUrl = sort || "id,desc";
      restCallURL += "?sort=" + sortUrl;

      // if (null == order) {
      //
      // }

      // if (null != order.id&&order.id!="") {
      //   restCallURL += "&id=" + fleet.id;
      // }

      restCallURL += "&id="+vm.leftRentalOrderId;

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
        }, {
          dataset: data.content
        });


      }, function (reason) {
        Notification.error("获取作业面数据失败");
      });
    };

    vm.rightQuery = function (page, size, sort, order) {
      var restCallURL = RENTAL_ORDER_MACHINE_PAGE_URL;

      var sortUrl = sort || "id,desc";
      restCallURL += "?sort=" + sortUrl;

      // if (null == order) {
      //
      // }

      // if (null != order.id&&order.id!="") {
      //   restCallURL += "&id=" + fleet.id;
      // }

      restCallURL += "&id="+vm.rightRentalOrderId;

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams2 = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
      }, function (reason) {
        Notification.error("获取作业面数据失败");
      });
    };


    vm.leftQuery();
    vm.rightQuery();

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }


    //更新fleet
    vm.updateFleet = function (fleet, size, type) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/updateRentalFleetMng.html',
        controller: 'updateRentalFleetController as updateRentalFleetController',
        size: size,
        backdrop: false,
        resolve: {
          fleet: function () {
            return fleet;
          },type: function () {
            return type;
          }
        }
      });

      modalInstance.result.then(function(result) {

        var tabList=vm.tableParams.data;
        //更新内容
        for(var i=0;i<tabList.length;i++){
          if(tabList[i].id==result.id){
            tabList[i]=result;
          }
        }

      }, function(reason) {

      });
    };



    vm.dropSuccessHandler2 = function($event,index,sourceArray,destArray,rentalOrderId){

      // console.log("vm.fleetList==="+vm.fleetList);
      // console.log("vm.fleetList2==="+vm.fleetList2);

      console.log(rentalOrderId);
      console.log(destArray);

      console.log("sourceArray[index]=="+sourceArray.data[index]);
      console.log(destArray.data.length);
      console.log(sourceArray.data.length);
//      destArray.data.push(sourceArray[index]);

    //

      console.log(sourceArray);
      console.log(destArray);


      var rentalOrderMachine=sourceArray.data[index];

      console.log(rentalOrderMachine);
      console.log(rentalOrderMachine.machine);
      console.log(rentalOrderMachine.rentalOrder);


      sourceArray.data.splice(index,1);

      vm.updateOrderMachineInfo(rentalOrderMachine.machine.id,rentalOrderId,rentalOrderMachine.id,destArray);
    };




    //批量设置为已处理
    vm.updateOrderMachineInfo = function (machineId,addOrderId,delId,destArray) {

      console.log("machineId=="+machineId);
      console.log("addOrderId=="+addOrderId);
      console.log("delId=="+delId);


      var orderMachines = {"addOrderId": addOrderId, "delId": delId, "addMachineId": machineId};
      var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_OPER_URL, orderMachines);
      restPromise.then(function (data) {

        if(data.code==0){
          Notification.success("车辆调拨成功!");

          destArray.data.splice(0, 0, data.content);
        }


      }, function (reason) {
        Notification.error(" 车辆调拨失败!");
      });


    };

    vm.onDrop = function($event,$data,array){
      alert($data);

      array.push($data);
    };

    vm.onDrop2 = function($event,$data,array){
      // alert("onDrop2=="+$data);
      //
      // array.push($data);
    };


  }
})();
