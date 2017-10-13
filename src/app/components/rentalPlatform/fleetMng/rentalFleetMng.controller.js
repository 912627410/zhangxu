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
    vm.rightRentalOrderId;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义每页显示多少条数据
    vm.pageSize = 12;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的车辆id List
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

    //左侧仓库车辆数据查询  默认查询登录用户所属组织及其下级组织的在库待租车辆
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


    /**
     * 左拖动触发事件(从订单调拨回仓库)
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


    //左拖动触发事件(从订单调拨回仓库)
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
     * 右拖动触发事件(从仓库调入订单)
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
      vm.selected = [];
    };

    //右拖动触发事件(从仓库调入订单)
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
    //选择右侧订单
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
        templateUrl: 'app/components/rentalPlatform/fleetMng/rentalUnUsedMachineList.html',
        controller: 'rentalUnUsedMachineListController as rentalUnUsedMachineListCtrl',
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
        var rentalOrderMachineOperVo = {"addMachineIdList": result, "addOrderId": rentalOrderId,"operationType":2};
        var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, rentalOrderMachineOperVo);
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
      vm.tableParams2.data.forEach(function (rentalOrderMachine) {
        updateSelected(action, rentalOrderMachine.id);
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

      vm.tableParams2.data.forEach(function (rentalOrderMachine) {
        rentalOrderMachine.checked = operStatus;
      })
    }

    vm.bringUpBatch = function (sourceArray,destArray,rentalOrderId) {

      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});

        return;
      }
      var MachineIdList =  vm.selected;
      var rentalOrderMachineOperVo = {"addMachineIdList": vm.selected, "addOrderId": rentalOrderId,"operationType":1};
      var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, rentalOrderMachineOperVo);
      restPromise.then(function (data) {

        if(data.code==0){
          Notification.success("批量调出车辆成功!");
          vm.selected = [];
          for(var i = 0;i<MachineIdList.length;i++){
            var rentalOrderMachine=sourceArray.data[0];
            sourceArray.data.splice(0,1);

            var machineLeft=sourceArray.data[0];
            rentalMachineLeft.deviceNum = machineLeft.machine.deviceinfo.deviceNum;
            rentalMachineLeft.deviceType = machineLeft.machine.deviceType.name;
            rentalMachineLeft.heightType = machineLeft.machine.deviceHeightType.name;
            rentalMachineLeft.machineId =machineLeft.machine.id;
            rentalMachineLeft.machineLicenseId = machineLeft.machine.licenseId;
            rentalMachineLeft.manufacture =machineLeft.machine.deviceManufacture.name;
            destArray.data.splice(0, 0, rentalMachineLeft);
            rentalMachineLeft = {
              deviceNum:'',
              deviceType:'',
              heightType:'',
              machineId:'',
              machineLicenseId:'',
              manufacture:''
            }
          }



        }
      }, function (reason) {
        Notification.error(" 批量调出车辆失败!");
      });
    }

    //重置查询框
    vm.rightReset = function () {
      vm.rightRentalOrder = null;
    }


  }
})();
