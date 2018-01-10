/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalOrderMngController', rentalOrderMngController);

  /** @ngInject */

  function rentalOrderMngController($rootScope,$state, $window, $uibModal, $filter, $anchorScroll, serviceResource, NgTableParams, ngTableDefaults, treeFactory, Notification, rentalService,
                                    DEFAULT_MINSIZE_PER_PAGE, RENTAL_ORDER_PAGE_URL, RENTAL_ORDER_GROUP_BY_STATUS, RENTAL_ORDER_URL, languages) {

    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    //定义每页显示多少条数据
    vm.pageSize = DEFAULT_MINSIZE_PER_PAGE;
    vm.totalOrders=0;
    vm.planOrders=0;
    vm.processOrders=0;
    vm.fininshOrders=0;
    vm.rentalOrder = {};
    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;//表格中每页展示多少条数据
    ngTableDefaults.settings.counts = [];//取消ng-table的默认分页

    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    vm.anchorList = ["currentLocation", "currentState", "alarmInfo"];

    //订单状态List
    var retanlOrderStatusListPromise = rentalService.getRetnalOrderStatusList();
    retanlOrderStatusListPromise.then(function (data) {
      vm.retanlOrderStatusList = data;
    }, function (reason) {
      Notification.error(languages.findKey('getStatusFail'));
    })

    //每种状态订单数量
    vm.getStatusNumber = function () {
      var groupByStatusListPromise = serviceResource.restCallService(RENTAL_ORDER_GROUP_BY_STATUS, "GET");
      groupByStatusListPromise.then(function (data) {
        var groupByStatusList = data.content;
        for (var i = 0; i < groupByStatusList.length; i++) {
          var retanlOrderStatus = groupByStatusList[i];
          if (retanlOrderStatus.status == 1) { //计划
            vm.planOrders = retanlOrderStatus.rentalOrderNumber;
          } else if (retanlOrderStatus.status == 2) { //进行中
            vm.processOrders = retanlOrderStatus.rentalOrderNumber;
          } else {
            vm.fininshOrders = retanlOrderStatus.rentalOrderNumber;
          }
        }
        vm.totalOrders=vm.planOrders+vm.processOrders+vm.fininshOrders;
      }, function (reason) {
        Notification.error(languages.findKey('getStaGroupFail'));
      })
    }

    vm.queryOrderByStatus = function (status) {
      var rentalOrder = {status: {value: ''}}
      if (status) {
        rentalOrder.status.value = status;
        vm.query(0, DEFAULT_MINSIZE_PER_PAGE, null, rentalOrder)
      } else {
        vm.query(0, DEFAULT_MINSIZE_PER_PAGE, null, rentalOrder)
      }
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

    vm.startDateSetting = {
      //dt: "请选择开始日期",
      open: function ($event) {
        vm.startDateSetting.status.opened = true;
      },
      dateOptions: {
        formatYear: 'yy',
        startingDay: 1
      },
      status: {
        opened: false
      }
    };

    //vm.startDateSetting.dt="";

    // 日期控件相关
    // date picker
    vm.startDateOpenStatus = {
      opened: false
    };

    vm.startDateOpen = function ($event) {
      vm.startDateOpenStatus.opened = true;
    };

    vm.endDateOpenStatus = {
      opened: false
    };

    vm.endDateOpen = function ($event) {
      vm.endDateOpenStatus.opened = true;
    };

    //组织树的显示
    vm.openTreeInfo = function () {
      treeFactory.treeShow(function (selectedItem) {
        vm.org = selectedItem;
      });
    }

    //选择订单客户
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
        vm.rentalOrder.customerName=result.name;
      }, function () {
      });
    };

    vm.query = function (currentPage, pageSize, totalElements, rentalOrder) {

      var restCallURL = RENTAL_ORDER_PAGE_URL;
      var pageUrl = currentPage || 0;
      var sizeUrl = pageSize || DEFAULT_MINSIZE_PER_PAGE;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl;
      if (totalElements != null && totalElements != undefined) {
        restCallURL += "&totalElements=" + totalElements;
      }
      if (null != rentalOrder) {
        if (null != rentalOrder.orderNumber && rentalOrder.orderNumber != "") {
          restCallURL += "&orderNumber=" + rentalOrder.orderNumber;
        }
        if (null != rentalOrder.customerName && rentalOrder.customerName != "") {
          restCallURL += "&customerName=" + rentalOrder.customerName;
        }

        if (null != rentalOrder.status && rentalOrder.status != "") {
          restCallURL += "&status=" + rentalOrder.status.value;
        }

        if (null != rentalOrder.startDate && rentalOrder.startDate != "") {
          restCallURL += "&startDate=" + $filter('date')(rentalOrder.startDate, 'yyyy-MM-dd');
        }

        if (null != rentalOrder.endDate && rentalOrder.endDate != "") {
          restCallURL += "&endDate=" + $filter('date')(rentalOrder.endDate, 'yyyy-MM-dd');
        }
      }
      if(null!=vm.org&&null != vm.org.label && vm.org.label != ""){
        restCallURL += "&parentOrgId=" + vm.org.id;
      }else {
        restCallURL += "&parentOrgId=" + vm.userInfo.userdto.organizationDto.id;
      }



      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({}, {dataset: data.content});
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('getDataVeFail'));
      });
    };
    vm.query(null, null, null, null);
    vm.getStatusNumber();
    // 新建订单
    vm.new = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/rentalPlatform/fleetMng/newRentalOrder.html',
        controller: 'newRentalOrderController',
        controllerAs: 'newRentalOrderCtrl',
        size: 'super-lgs'
      });
      modalInstance.result.then(function (result) {
        if (null != result) {
          var orderVo = result
          vm.tableParams.data.splice(0, 0, orderVo);
        }
        vm.getStatusNumber();
      }, function () {
      });
    }

    //重置查询框
    vm.reset = function () {
      vm.rentalOrder = null;
      vm.org = null;
      vm.id = null;
    }

    //租赁订单管理--更新订单
    vm.update = function (id, realNumber) {
      var realNumber = realNumber;
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
          };
          vm.getStatusNumber();
        }, function () {
          //取消
        });
      })

    }

    /*vm.view = function (id) {
      // $state.go('rental.viewOrder', {id: id});
      var orderUrl = RENTAL_ORDER_URL + "?id=" + id;
      var rspdata = serviceResource.restCallService(orderUrl, "GET");
      rspdata.then(function (data) {
        var retalOrderTotalVo = data.content;
        var orderMachineTypeVoList = data.content.orderMachineTypeVoList;
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'app/components/rentalPlatform/fleetMng/viewRentalOrderMng.html',
          controller: 'viewRentalOrderController as viewRentalOrderCtrl',
          size: 'lg',
          resolve: {
            retalOrderTotalVo: function () {
              return retalOrderTotalVo;
            }
          }
        });
      }, function () {
        //取消
      });


    }*/

    vm.goSite = function (rentalOrder) {
      var rentalOrder = rentalOrder;
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

    vm.leaveSite = function (rentalOrder) {

      var rentalOrder = rentalOrder;
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

    //附件上传
    vm.fileUpload = function (rentalOrder) {
      vm.singleRentalOrder=rentalOrder;
      $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/orderFileUpload.html',
        controller: 'rentalOrderFileUploadController as rentalOrderFileUploadMngCtrl',
        size: 'lg',
        resolve: {
          rentalOrder: function () {
            return rentalOrder;
          }
        }
      });
    }

     /**
     * 查看订单详情页面
     * @param id  订单id
     */
    vm.view = function (id) {
      $state.go('rental.orderDetails', {id: id});
    }
  }
})();
