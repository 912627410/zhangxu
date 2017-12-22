(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalLeaveSiteController', rentalLeaveSiteController);

  function rentalLeaveSiteController($rootScope, $uibModalInstance, Notification, languages, RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, serviceResource, NgTableParams, orderId, Upload, RENTANL_ORDER_MACHINE_BATCH_MOVE_ATTACH_UPLOAD_URL, RENTAL_ORDER_ENTRY_MACHINE_URL) {

    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    vm.orderId = orderId;
    vm.selected = []; //选中的订单车辆id List
    vm.leaveMachineNumber = 0;
    vm.leaveReason = null;
    //退场时间
    var date = new Date();
    vm.leaveSiteDate = date;
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

    vm.query = function (id) {
      var restCallURL = RENTAL_ORDER_ENTRY_MACHINE_URL;
      var sortUrl = "id,desc";
      restCallURL += "?sort=" + sortUrl;
      restCallURL += "&id=" + id;
      {
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


    vm.bringUpBatch = function (file) {
      if (vm.selected.length == 0) {
        Notification.warning({message: '请选择要调拨的车辆', positionY: 'top', positionX: 'center'});
        return;
      }
      vm.leaveMachineNumber = vm.leaveMachineNumber + vm.selected.length;
      var recordTime = serviceResource.getChangeChinaTime(vm.leaveSiteDate);
      var startMonth = recordTime.getMonth() + 1;  //getMonth返回的是0-11
      recordTime = recordTime.getFullYear() + '-' + startMonth + '-' + recordTime.getDate() + ' ' + recordTime.getHours() + ':' + recordTime.getMinutes() + ':' + recordTime.getSeconds();
      if (file != null && file != undefined) {
        var uploadurl = RENTANL_ORDER_MACHINE_BATCH_MOVE_ATTACH_UPLOAD_URL;
        uploadurl += "?orderId=" + vm.orderId + "&operationType=" + 2 + "&orderMachineIdList=" + vm.selected + "&recordTime=" + recordTime + "&recordTime=" + recordTime + "&reason=" + vm.leaveReason
        file.upload = Upload.upload({
          url: uploadurl,
          file: file
        });
        file.upload.then(function (response) {
            $timeout(function () {
              file.result = response.data;
              if (file.result.code == 0) {
                Notification.success("新增文件成功!");
                $uibModalInstance.close();
              } else {
                Notification.error(data.message);
              }
            })
          },
          function (reason) {
            vm.errorMsg = reason.data.message;
            Notification.error("新增文件失败!");
            Notification.error(vm.errorMsg);
          }, function (evt) {
          });
      }
      else {
        var rentalOrderMachineOperVo = {
          "orderMachineIdList": vm.selected,
          "orderId": vm.orderId,
          "operationType": 2,
          "recordTime": vm.leaveSiteDate,
          "reason": vm.leaveReason
        };
        var restPromise = serviceResource.restUpdateRequest(RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, rentalOrderMachineOperVo);
        restPromise.then(function (data) {

          if (data.code == 0) {
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

  }

})();
