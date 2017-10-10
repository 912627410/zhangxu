/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalFleetMngController', rentalFleetMngController);

  /** @ngInject */
  function rentalFleetMngController($scope, $window, $location, $uibModal,$anchorScroll,languages,commonFactory, serviceResource,NgTableParams,ngTableDefaults,Notification,permissions,rentalService,DEFAULT_SIZE_PER_PAGE,RENTANL_ORDER_MACHINE_BATCH_MOVE_URL,RENTAL_ORDER_MACHINE_PAGE_URL,RENTANL_UNUSED_MACHINE_PAGE_URL,RENTANL_ORDER_MACHINE_BATCH_OPER_URL,RENTAL_MACHINE_DATA_URL) {
    var vm = this;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义每页显示多少条数据
    vm.pageSize = 12;
    //搜索条件定义
    vm.searchConditions = {};
    var rentalMachineLeft = {
      deviceNum:'',
      deviceType:'',
      heightType:'',
      machineId:'',
      machineLicenseId:'',
      manufacture:''
    }


    vm.rightRentalOrderId;


    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 7;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);




   //左侧表格数据仓库车辆查询
    vm.leftQuery = function (currentPage, pageSize, totalElements, searchConditions) {

      var restCallURL = RENTAL_MACHINE_DATA_URL;
      var pageUrl = currentPage || 0;
      var sizeUrl = pageSize || vm.pageSize;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl;
      if (totalElements != null && totalElements != undefined) {
        restCallURL += "&totalElements=" + totalElements;
      }
      if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
        restCallURL += "&orgId=" + vm.org.id;
      }
      if (searchConditions!=null){
        restCallURL = commonFactory.processSearchConditions(restCallURL, searchConditions);
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

    vm.machineStatusLoadData = function (machineStatus) {
      vm.searchConditions={};
      vm.searchConditions.status = machineStatus;
      vm.leftQuery(0, vm.pageSize, null, vm.searchConditions);
    };
    //status为7表示在库待租
    vm.machineStatusLoadData(7);

    //右侧订单下车辆List查询
    vm.rightQuery = function (page, size, sort, id) {

      vm.rightRentalOrderId=id;
      var restCallURL = RENTAL_ORDER_MACHINE_PAGE_URL;
      var sortUrl = sort || "id,desc";
      restCallURL += "?sort=" + sortUrl;
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


    /**
     * 左拖动触发事件
     * @param $event
     * @param index
     * @param sourceArray
     * @param destArray
     * @param rentalOrderId
     */
    vm.dropSuccessHandler1 = function($event,index,sourceArray,destArray,rentalOrderId){

      if(rentalOrderId==null||destArray==null){
        return;
      }
      var rentalOrderMachine=sourceArray.data[index];
      sourceArray.data.splice(index,1);
      vm.updateOrderMachineInfo1(rentalOrderMachine.machineId,rentalOrderId,null,destArray);
    };


    //批量设置为已处理
    vm.updateOrderMachineInfo1 = function (machineId,addOrderId,delId,destArray) {

      var orderMachines = {"addOrderId": addOrderId, "delId": delId,"addMachineId": machineId};
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

    /**
     * 右拖动触发事件
     * @param $event
     * @param index
     * @param sourceArray
     * @param destArray
     * @param rentalOrderId
     */
    vm.dropSuccessHandler2 = function($event,index,sourceArray,destArray,rentalOrderId){

      if(rentalOrderId==null||destArray==null){
        return;
      }
      var rentalOrderMachine=sourceArray.data[index];
      sourceArray.data.splice(index,1);
      vm.updateOrderMachineInfo2(rentalOrderMachine.machine.id,rentalOrderId,rentalOrderMachine.id,destArray);

    };

    //批量设置为已处理
    vm.updateOrderMachineInfo2 = function (machineId,addOrderId,delId,destArray) {
      var rentalOrderMachineLeft = {

      }
      var orderMachines = {"addOrderId": addOrderId, "delId": delId,"addMachineId": machineId};
      var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_OPER_URL, orderMachines);
      restPromise.then(function (data) {
        var rentalMachineLeft = {
          deviceNum:'',
          deviceType:'',
          heightType:'',
          machineId:'',
          machineLicenseId:'',
          manufacture:''
        }
        if(data.code==0){
          Notification.success("车辆调拨成功!");
          rentalMachineLeft.deviceNum = data.content.machine.deviceinfo.deviceNum;
          rentalMachineLeft.deviceType = data.content.machine.deviceType.name;
          rentalMachineLeft.heightType = data.content.machine.deviceHeightType.name;
          rentalMachineLeft.machineId = data.content.machine.id;
          rentalMachineLeft.machineLicenseId = data.content.machine.licenseId;
          rentalMachineLeft.manufacture = data.content.machine.deviceManufacture.name;
          destArray.data.splice(0, 0, rentalMachineLeft);
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
    //批量设置为已处理
    // vm.updateOrderMachineInfo1 = function (machineId,addOrderId,delId,destArray) {
    //
    //   var orderMachines = {"addOrderId": addOrderId, "delId": delId,"addMachineId": machineId};
    //   var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_OPER_URL, orderMachines);
    //   restPromise.then(function (data) {
    //
    //     if(data.code==0){
    //       Notification.success("车辆调拨成功!");
    //
    //       destArray.data.splice(0, 0, data.content);
    //     }
    //
    //
    //   }, function (reason) {
    //     Notification.error(" 车辆调拨失败!");
    //   });
    // };

    vm.onDrop = function($event,$data,array){
      alert($data);

      array.push($data);
    };

    vm.onDrop2 = function($event,$data,array){
      // alert("onDrop2=="+$data);
      //
      // array.push($data);
    };


    vm.selectLeftOrder = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalOrderListMng.html',
        controller: 'orderListMngController as orderListMngController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.leftRentalOrder=result;
        //如果选择的订单和左边的一样,则直接提示重新选择
        if(null!=vm.leftRentalOrder&&null!=vm.rightRentalOrder&&vm.rightRentalOrder.id==vm.leftRentalOrder.id){
          vm.leftRentalOrder=null;
          Notification.error(" 选择的订单不能一样!");
          return;
        }

        if(null!=vm.leftRentalOrder) {
          vm.leftQuery(null, null, null, vm.leftRentalOrder.id);
        }
      }, function () {
      });
    };


    vm.selectRightOrder = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalOrderListMng.html',
        controller: 'orderListMngController as orderListMngController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.rightRentalOrder=result;

        //如果选择的订单和左边的一样,则直接提示重新选择
        if(null!=vm.leftRentalOrder&&null!=vm.rightRentalOrder&&vm.rightRentalOrder.id==vm.leftRentalOrder.id){
          vm.rightRentalOrder=null;
          Notification.error(" 选择的订单不能一样!");
          return;
        }

        if(null!=vm.rightRentalOrder){
         vm.rightQuery(null,null,null,vm.rightRentalOrder.id);
        }

      }, function () {
      });
    };

    /**
     * 从组织调入车辆
     * @param size
     */
    vm.getMachineFromOrg = function (destArray,rentalOrderId,size) {

      var dest=destArray;
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalOrgMachineListMng.html',
        controller: 'orgMachineListMngController as orgMachineListMngController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          },
          selectUrl: function () {
            return RENTANL_UNUSED_MACHINE_PAGE_URL;
          }
        }
      });

      modalInstance.result.then(function (result) {

        if(result.length==0){
          return;
        }
        var roleUsers = {"addMachineIdList": result, "addOrderId": rentalOrderId};
        var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, roleUsers);
        restPromise.then(function (data) {

          if(data.code==0){
            Notification.success("调入车辆成功!");
            var result=data.content;
            for(var i=0;i<result.length;i++){
              dest.data.splice(0, 0, result[i]);
            }
          }


        }, function (reason) {
          Notification.error(" 调入车辆失败!");
        });


      }, function () {
      });
    };

    //重置查询框
    vm.rightReset = function () {
      vm.rightRentalOrder = null;
    }


  }
})();
