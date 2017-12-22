(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalLeaveSiteController', rentalLeaveSiteController);
  function rentalLeaveSiteController($rootScope,$uibModalInstance,Notification,$uibModal,languages,RENTANL_ORDER_MACHINE_BATCH_MOVE_URL,serviceResource,NgTableParams,orderId,RENTAL_ORDER_ENTRY_MACHINE_URL,RENTAL_MACHINE_MONITOR_URL) {

    var vm=this;
    vm.userInfo = $rootScope.userInfo;
    vm.orderId=orderId;
    vm.selected = []; //选中的订单车辆id List
    vm.leaveMachineNumber = 0;

    //时间格式检验
    vm.timeValidate = function (date) {
      if (date == undefined){
        Notification.error(languages.findKey('exitTimeFormatIsNotCorrect'));
      }
    }
    //退场时间
    var date=new Date();
    vm.leaveSiteDate=date;
    vm.leaveSiteDateOpenStatusData = {
      opened: false
    };
    vm.leaveSiteDateOpenData = function ($event) {
      vm.leaveSiteDateOpenStatusData.opened = true;
    };
    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    vm.machineMonitor = function(licenseId){
      var restCallUrl = RENTAL_MACHINE_MONITOR_URL + "?licenseId=" + licenseId;
      var deviceDataPromis = serviceResource.restCallService(restCallUrl, "GET");
      deviceDataPromis.then(function (data) {
        //打开模态框
        var currentOpenModal = $uibModal.open({
          animation: true,
          backdrop: false,
          templateUrl: 'app/components/rentalPlatform/machineMng/machineMonitor.html',
          controller: 'machineMonitorController',
          controllerAs:'vm',
          openedClass: 'hide-y',//class名 加载到整个页面的body 上面可以取消右边的滚动条
          windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
          size: 'super-lgs',
          resolve: { //用来向controller传数据
            deviceInfo: function () {
              return data.content;
            }
          }
        });
      },function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }

    vm.cancel = function () {
      $uibModalInstance.close(vm.leaveMachineNumber);
      vm.leaveMachineNumber = 0;
    };
    //订单下车辆List 数据
    vm.tableParams = new NgTableParams({}, {dataset: vm.orderMachineList});

    var updateSelected = function (action, orderMachine) {
      if (action == 'add' && vm.selected.indexOf(orderMachine.id) == -1) {
        vm.selected.push(orderMachine.id);
      }
      if (action == 'remove' && vm.selected.indexOf(orderMachine.id) != -1) {
        var idx = vm.selected.indexOf(orderMachine.id);
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

      vm.tableParams.data.forEach(function (orderMachine) {
        updateSelected(action, orderMachine);
      })

    }

    vm.isSelected = function (id) {
      return vm.selected.indexOf(id) >= 0;
    }

    vm.query=function (id) {
      var restCallURL = RENTAL_ORDER_ENTRY_MACHINE_URL;
      var sortUrl =  "id,desc";
      restCallURL += "?sort=" + sortUrl;
      restCallURL += "&id="+id;{
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {

          vm.tableParams = new NgTableParams({
            // initial sort order
            // sorting: { name: "desc" }
          }, {
            filterDelay: 0,
            dataset: angular.copy(data.content)
            // dataset: data.content
          });
        }, function (reason) {

          Notification.error("获取车辆数据失败");
        });
      }
    }
    vm.query(orderId);


    vm.bringUpBatch = function () {

      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});

        return;
      }
      vm.leaveMachineNumber = vm.leaveMachineNumber + vm.selected.length;
      var rentalOrderMachineOperVo = {"orderMachineIdList": vm.selected, "orderId":vm.orderId,"operationType":2,"recordTime":vm.leaveSiteDate,"reason":vm.leaveReason};
      var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, rentalOrderMachineOperVo);
      restPromise.then(function (data) {

        if(data.code==0){
          //页面上同步移除调出的车辆
          // for(var i = 0;i<vm.selected.length;i++){
          //   vm.tableParams.data.splice(0,1);
          // }
          vm.query(vm.orderId);
          Notification.success(languages.findKey('批量调出车辆成功'));
          vm.selected = [];
        }

      }, function (reason) {
        Notification.error(" 批量调出车辆失败!");
      });
    }

  }

  })();
