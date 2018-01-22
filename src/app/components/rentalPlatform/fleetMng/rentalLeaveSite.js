(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalLeaveSiteController', rentalLeaveSiteController);

  function rentalLeaveSiteController($rootScope, $uibModalInstance, $timeout, Notification, languages, RENTANL_ORDER_MACHINE_BATCH_MOVE_URL, RENTAL_MACHINE_MONITOR_URL, serviceResource, NgTableParams, orderId, Upload, RENTANL_ATTACH_UPLOAD_URL, RENTAL_ORDER_ENTRY_MACHINE_URL)
  {
    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    vm.orderId = orderId;
    vm.selected = []; //选中的订单车辆id List
    vm.leaveMachineNumber = 0;
    vm.leaveReason = null;


    //时间格式检验
    vm.timeValidate = function (date) {
      if (date == undefined) {
        Notification.error(languages.findKey('exitTimeFormatIsNotCorrect'));
      }
    }

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

    vm.machineMonitor = function (licenseId) {
      var restCallUrl = RENTAL_MACHINE_MONITOR_URL + "?licenseId=" + licenseId;
      var deviceDataPromis = serviceResource.restCallService(restCallUrl, "GET");
      deviceDataPromis.then(function (data) {
        //打开模态框
        var currentOpenModal = $uibModal.open({
          animation: true,
          backdrop: false,
          templateUrl: 'app/components/rentalPlatform/machineMng/machineMonitor.html',
          controller: 'machineMonitorController',
          controllerAs: 'vm',
          openedClass: 'hide-y',//class名 加载到整个页面的body 上面可以取消右边的滚动条
          windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
          size: 'super-lgs',
          resolve: { //用来向controller传数据
            deviceInfo: function () {
              return data.content;
            }
          }
        });
      }, function (reason) {
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
          if (file) {
            var Id = data.content[0].leavefactoryrecordid;
            vm.fileUpload(Id, file);
          }
          vm.query(vm.orderId);
          Notification.success(languages.findKey('批量调出车辆成功'));
          vm.selected = [];
          vm.file = []
        }
      }, function (reason) {
        Notification.error(" 批量调出车辆失败!");
      });
    }

    //附件上传
    vm.fileUpload = function (id, files) {
      var uploadUrl = RENTANL_ATTACH_UPLOAD_URL;
      uploadUrl += "?leavefactoryrecordid=" + id
      if (files != null) {
        angular.forEach(files, function (file) {
          file.upload = Upload.upload({
            url: uploadUrl,
            file: file
          });
          file.upload.then(function (response) {
              $timeout(function () {
                file.result = response.data;
                if (file.result.code != 0) {
                  Notification.error(data.message);
                }
              })
            },
            function (reason) {
              vm.errorMsg = reason.data.message;
              Notification.error("批量调出车辆失败!");
              Notification.error(vm.errorMsg);
            }, function (evt) {
            });
        })
      }
    }
  }
})();
