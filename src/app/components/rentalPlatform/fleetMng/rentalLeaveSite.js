(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalLeaveSiteController', rentalLeaveSiteController);
  function rentalLeaveSiteController($uibModalInstance,Notification,languages,RENTANL_ORDER_MACHINE_BATCH_MOVE_URL,serviceResource,NgTableParams,orderMachineList,orderId) {

    var vm=this;
    vm.orderId=orderId;
    vm.orderMachineList = orderMachineList;
    vm.selected = []; //选中的订单车辆id List
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


    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
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


    vm.bringUpBatch = function () {

      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});

        return;
      }
      // var orderMachineIdList =  vm.selectedObj;
      var rentalOrderMachineOperVo = {"orderMachineIdList": vm.selected, "orderId":vm.orderId,"operationType":1,"recordTime":vm.leaveSiteDate};
      var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, rentalOrderMachineOperVo);
      restPromise.then(function (data) {

        if(data.code==0){
          //页面上同步移除调出的车辆
          for(var i = 0;i<vm.selected.length;i++){
            vm.tableParams.data.splice(0,1);
          }

          Notification.success(languages.findKey('批量调出车辆成功'));
        }
      }, function (reason) {
        Notification.error(" 批量调出车辆失败!");
      });
    }

  }

  })();
