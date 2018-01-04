/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalOrderController', newRentalOrderController);
  /** @ngInject */
  function newRentalOrderController($rootScope,$window,$uibModal,$uibModalInstance,treeFactory,serviceResource,RENTAL_ORDER_URL,rentalService, Notification,languages,NgTableParams) {
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
    /**
     * 新建订单确认
     * @param rentalOrder
     */
    vm.newOrder = function (rentalOrder) {

        //订单所属组织为登录用户的所属组织
        vm.rentalOrder.org = vm.operatorInfo.userdto.organizationDto;
        vm.rentalOrderMachineTypeVos = vm.tableParams.data;
         vm.addRentalOrderOption.orderVo = vm.rentalOrder;
         vm.addRentalOrderOption.orderMachineTypeVoList =  vm.rentalOrderMachineTypeVos;

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


    vm.jobContentList = [
      {id:1,name:"消防"},
      {id:2,name:"水电"},
      {id:3,name:"保温"},
      {id:4,name:"外墙"},
      {id:5,name:"安装"},
      {id:6,name:"涂装"},
      {id:7,name:"其他"}
    ];

    vm.payTypeList = [
      {id:1,name:"现金"},
      {id:2,name:"转账"}
    ];
    vm.collectionagreementList = [
      {id:1,name:"先付保证金及租金后使用设备"},
      {id:2,name:"先付租金后使用设备"},
      {id:3,name:"先付保证金后使用设备"},
      {id:4,name:"先使用设备后付租金"},
    ]
    vm.entryorexitList = [
      {id:1,name:"进场"},
      {id:2,name:"退场"},
    ]
    vm.entryexitcostresponsiblepersionList = [
      {id:"1",name:"出租方"},
      {id:"2",name:"承租方"},
    ]
    vm.priceUnitList = [
      {id:"1",name:"天租价"},
      {id:"2",name:"月租价"},
    ];
    vm.deviceTypeList = [
      {id:"1",name:"剪叉"},
      {id:"2",name:"曲臂"},
      {id:"3",name:"直臂"},
    ];

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
