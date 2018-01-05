/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalOrderController', newRentalOrderController);
  /** @ngInject */
  function newRentalOrderController($rootScope,$filter,$uibModal,$uibModalInstance,MACHINE_DEVICETYPE_URL,serviceResource,RENTAL_ORDER_URL,rentalService, Notification,languages,NgTableParams) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.rentalOrder={};
    //订单车辆类型 List
    vm.rentalOrderMachineTypeVos = [];
    vm.addRentalOrderOption = {
      orderVo:'',
      orderMachineTypeVoList:'',
    }
    //取消
    vm.cancel = function () {
      $uibModalInstance.close();
    };

    //选择订单的所属客户
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
        vm.rentalOrder.rentalCustomer=result;
      }, function () {
      });
    };

    vm.startDateSetting = {
      open: function($event) {
        vm.startDateSetting.status.opened = true;
      },
      dateOptions: {
        formatYear: 'yyyy',
        startingDay: 1
      },
      status: {
        opened: false
      }
    };
    vm.endDateSetting = {
      open: function($event) {
        vm.endDateSetting.status.opened = true;
      },
      dateOptions: {
        formatYear: 'yyyy',
        startingDay: 1
      },
      status: {
        opened: false
      }
    };

    vm.paymentdateSetting = {
      open: function($event) {
        vm.paymentdateSetting.status.opened = true;
      },
      dateOptions: {
        formatYear: 'yyyy',
        startingDay: 1
      },
      status: {
        opened: false
      }
    };

    //租金收取约定List
    var collectionAgreementListPromise = rentalService.getCollectionAgreementList();
    collectionAgreementListPromise.then(function (data) {
      vm.collectionAgreementList = data;
    }, function (reason) {
      Notification.error(languages.findKey('getStatusFail'));
    })
    //订单作业内容List
    var jobContentListPromise = rentalService.getJobContentList();
    jobContentListPromise.then(function (data) {
      vm.jobContentList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getStatusFail'));
    })

    //进退场费用责任方List
    var responsibilityListPromise = rentalService.getResponsibilityList();
    responsibilityListPromise.then(function (data) {
      vm.responsibilityList = data;
    }, function (reason) {
      Notification.error(languages.findKey('getStatusFail'));
    })

    //订单下车辆租金单位
    var machinePriceUnitListPromise = rentalService.getMachinePriceUnitList();
    machinePriceUnitListPromise.then(function (data) {
      vm.priceUnitList = data;
    }, function (reason) {
      Notification.error(languages.findKey('getStatusFail'));
    })

    //订单支付方式
    var payTypeListPromise = rentalService.getPayTypeList();
    payTypeListPromise.then(function (data) {
      vm.payTypeList = data;
    }, function (reason) {
      Notification.error(languages.findKey('getStatusFail'));
    })

    /**
     * 得到设备类型集合
     */
    var deviceTypeListPromise = serviceResource.restCallService(MACHINE_DEVICETYPE_URL, "GET");
    deviceTypeListPromise.then(function (data) {
      vm.deviceTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('rentalGetDataError'));
    })

    /**
     * 操作类型（进场/退场）
     */
    var operationTypePromise = rentalService.getoperationType();
    operationTypePromise.then(function (data) {
      vm.operationType = data;
    }, function (reason) {
      Notification.error(languages.findKey('getStatusFail'));
    })

    /**
     * 新建订单确认
     * @param rentalOrder
     */
    vm.newOrder = function (rentalOrder) {
      //订单所属组织为登录用户的所属组织
      vm.rentalOrder.org = vm.operatorInfo.userdto.organizationDto;
      // if(null!=rentalOrder.payType&&rentalOrder.payType!=""){
      //   vm.rentalOrder.payType = rentalOrder.payType.value;
      // }
      // if(null!=rentalOrder.collectionagreement&&rentalOrder.collectionagreement!=""){
      //   vm.rentalOrder.collectionagreement = rentalOrder.collectionagreement.value;
      // }
      // if(null!=rentalOrder.entryOrExit&&rentalOrder.entryOrExit!=""){
      //   vm.rentalOrder.entryOrExit = rentalOrder.entryOrExit.value;
      // }
      // if(null!=rentalOrder.responsibility&&rentalOrder.responsibility!=""){
      //   vm.rentalOrder.responsibility  = rentalOrder.responsibility.value;
      // }

      vm.rentalOrder.paymentDate = $filter('date')(vm.rentalOrder.paymentDate,'yyyy-MM-dd');
      vm.rentalOrderMachineTypeVos = vm.tableParams.data;
      for(var i = 0;i<vm.tableParams.data.length;i++){
        vm.rentalOrderMachineTypeVos[i].priceUnit = vm.tableParams.data[i].priceUnit.value;
        vm.rentalOrderMachineTypeVos[i].startDate =  $filter('date')(vm.tableParams.data[i].startDate,'yyyy-MM-dd');
        vm.rentalOrderMachineTypeVos[i].endDate =  $filter('date')(vm.tableParams.data[i].endDate,'yyyy-MM-dd');
      }
      vm.addRentalOrderOption.orderVo = vm.rentalOrder;
      vm.addRentalOrderOption.orderMachineTypeVoList =  vm.rentalOrderMachineTypeVos;
      console.log(vm.addRentalOrderOption)
      var rspdata = serviceResource.restAddRequest(RENTAL_ORDER_URL,vm.addRentalOrderOption);
      rspdata.then(function (data) {
        Notification.success(languages.findKey('newOrderSucc'));
        var result = data.content.orderVo;
        result.customerName = result.rentalCustomer.name;
        result.realNumber = 0;
        $uibModalInstance.close(result);
      },function (reason) {
        Notification.error(reason.data.message);
      })

    }



    var originalData = [];

    vm.tableParams = new NgTableParams({}, {
      dataset: originalData
    });

    vm.deleteCount = 0;

    vm.add = add;
    vm.cancelChanges = cancelChanges;
    vm.del = del;
    vm.hasChanges = hasChanges;
    vm.saveChanges = saveChanges;


    function add() {
      vm.isEditing = true;
      vm.isAdding = true;
      vm.tableParams.settings().dataset.unshift({
        deviceType: "",
        heightType: null,
        num: null
      });
      // we need to ensure the user sees the new row we've just added.
      // it seems a poor but reliable choice to remove sorting and move them to the first page
      // where we know that our new item was added to
      vm.tableParams.sorting({});
      vm.tableParams.page(1);
      vm.tableParams.reload();
    }

    function cancelChanges() {
      resetTableStatus();
      var currentPage = vm.tableParams.page();
      vm.tableParams.settings({
        dataset: angular.copy(originalData)
      });
      // keep the user on the current page when we can
      if (!vm.isAdding) {
        vm.tableParams.page(currentPage);
      }
    }

    function del(row) {
      _.remove(vm.tableParams.settings().dataset, function(item) {
        return row === item;
      });
      vm.deleteCount++;
      vm.tableTracker.untrack(row);
      vm.tableParams.reload().then(function(data) {
        if (data.length === 0 && vm.tableParams.total() > 0) {
          vm.tableParams.page(vm.tableParams.page() - 1);
          vm.tableParams.reload();
        }
      });
    }

    function hasChanges() {
      return vm.tableForm.$dirty || vm.deleteCount > 0
    }

    function resetTableStatus() {
      vm.isEditing = false;
      vm.isAdding = false;
      vm.deleteCount = 0;
      vm.tableTracker.reset();
      vm.tableForm.$setPristine();
    }

    function saveChanges() {
      resetTableStatus();
      var currentPage = vm.tableParams.page();
      originalData = angular.copy(vm.tableParams.settings().dataset);
    }


  }
})();
