/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalOrderMngController', rentalOrderMngController);

  /** @ngInject */
  function rentalOrderMngController( $window,$uibModal, $filter,$anchorScroll, serviceResource,NgTableParams,ngTableDefaults,treeFactory,Notification,rentalService,RENTAL_ORDER_MACHINE_PAGE_URL,
                                    DEFAULT_MINSIZE_PER_PAGE,RENTAL_ORDER_PAGE_URL,RENTAL_ORDER_GROUP_BY_STATUS,RENTAL_ORDER_URL,RENTANL_UNUSED_MACHINE_PAGE_URL,languages) {

    var vm = this;
    vm.totalOrders=0;
    vm.planOrders=0;
    vm.processOrders=0;
    vm.fininshOrders=0;


    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    vm.anchorList = ["currentLocation", "currentState", "alarmInfo"];


    //订单状态List
    var retanlOrderStatusListPromise = rentalService.getRetnalOrderStatusList();
    retanlOrderStatusListPromise.then(function (data) {
      vm.retanlOrderStatusList= data;
    }, function (reason) {
      Notification.error(languages.findKey('getStatusFail'));
    })


    var groupByStatusListPromise = serviceResource.restCallService(RENTAL_ORDER_GROUP_BY_STATUS,"GET");
    groupByStatusListPromise.then(function (data) {
      var groupByStatusList= data.content;

      for(var i=0;i<groupByStatusList.length;i++){
        var retanlOrderStatus=groupByStatusList[i];
        if(retanlOrderStatus.status==1){ //计划
          vm.planOrders+=retanlOrderStatus.rentalOrderNumber;
        }else if(retanlOrderStatus.status==2){ //进行中
          vm.processOrders+=retanlOrderStatus.rentalOrderNumber;
        }else{
          vm.fininshOrders+=retanlOrderStatus.rentalOrderNumber;
        }
        vm.totalOrders+=retanlOrderStatus.rentalOrderNumber;

      }
    }, function (reason) {
      Notification.error(languages.findKey('getStaGroupFail'));
    })




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
      open: function($event) {
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
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



    vm.query = function (page, size, sort, rentalOrder) {

      var restCallURL = RENTAL_ORDER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != rentalOrder) {

        if (null != rentalOrder.id&&rentalOrder.id!="") {
          restCallURL += "&search_EQ_id=" + rentalOrder.id;
        }
        if (null != rentalOrder.customerName&&rentalOrder.customerName!="") {
          restCallURL += "&search_LIKE_rentalCustomer.name=" + rentalOrder.customerName;
        }

        if (null != rentalOrder.status&&rentalOrder.status!="") {
          restCallURL += "&search_EQ_status=" + rentalOrder.status.value;
        }

        if (null != rentalOrder.startDate&&rentalOrder.startDate!="") {
          restCallURL += "&search_DGT_startDate=" + $filter('date')(rentalOrder.startDate, 'yyyy-MM-dd');
        }

        if (null != rentalOrder.endDate&&rentalOrder.endDate!="") {
          restCallURL += "&search_DLT_endDate=" + $filter('date')(rentalOrder.endDate, 'yyyy-MM-dd');
        }



      }

      if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
        restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
      }

      if(null != vm.org&&null != vm.org.id&&vm.querySubOrg){
        restCallURL += "&parentOrgId=" +vm.org.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error(languages.findKey('getDataVeFail'));
      });
    };
    vm.query(null,null,null,null);


    vm.new=function(){
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/rentalPlatform/fleetMng/newRentalOrder.html',
        controller: 'newRentalOrderController',
        controllerAs:'newRentalOrderCtrl',
        size: 'lg'
      });
      modalInstance.result.then(function (result) {
        if(null!=result){
          vm.totalOrders += 1;
          vm.planOrders += 1;
          var orderVo  = result.orderVo
          var machineTypeList = result.orderMachineTypeVoList
          var rentalOrderNew = {
            id:"",
            startDate:"",
            endDate:"",
            rentalCustomer:"",
            statusDesc:"",
            location:"",
            jc:"",
            zb:"",
            qb:""
          }
          rentalOrderNew = orderVo;
          for(var i = 0;i<machineTypeList.length;i++){
            if(machineTypeList[i].deviceType.id ==1){
              rentalOrderNew.jc = machineTypeList[i].quantity
            }
            if(machineTypeList[i].deviceType.id ==2){
              rentalOrderNew.qb = machineTypeList[i].quantity
            }
            if(machineTypeList[i].deviceType.id ==3){
              rentalOrderNew.zb = machineTypeList[i].quantity
            }
          }

          vm.tableParams.data.splice(0, 0, rentalOrderNew);
        }

      }, function () {
      });
    }

    //重置查询框
    vm.reset = function () {
      vm.rentalOrder = null;
      vm.org=null;
      vm.id=null;
    }


    //租赁订单管理--更新订单
    vm.update=function(id){
      //$state.go('rental.updateOrder', {id: id});
      var orderUrl=RENTAL_ORDER_URL+"?id="+ id;
      var rspdata = serviceResource.restCallService(orderUrl,"GET");
      rspdata.then(function (data) {
        var retalOrder=data.content.orderVo;
        var orderMachineTypeVoList=data.content.orderMachineTypeVoList;

        var modalInstance= $uibModal.open({
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
          var tabList=vm.tableParams.data;
          //更新内容
          for(var i=0;i<tabList.length;i++){
            if(tabList[i].id==result.orderVo.id){
              tabList[i]=result.orderVo;
            }
          }
        }, function () {
          //取消
        });
      })

    }

    vm.view=function(id){
     // $state.go('rental.viewOrder', {id: id});
      var orderUrl=RENTAL_ORDER_URL+"?id="+ id;
      var rspdata = serviceResource.restCallService(orderUrl,"GET");
      rspdata.then(function (data) {
        var retalOrderTotalVo=data.content;
        var orderMachineTypeVoList=data.content.orderMachineTypeVoList;
        var modalInstance= $uibModal.open({
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
      },function () {
        //取消
      });


    }
    vm.goSite=function (rentalOrder) {
      var rentalOrder = rentalOrder ;
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
    }


    vm.leaveSite=function (id) {

      var orderId = id;
      var restCallURL = RENTAL_ORDER_MACHINE_PAGE_URL;
      var sortUrl =  "id,desc";
      restCallURL += "?sort=" + sortUrl;
      restCallURL += "&id="+orderId;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          var orderMachineList = data.content;
          var modalInstance = $uibModal.open({
            animation: vm.animationsEnabled,
            templateUrl: 'app/components/rentalPlatform/fleetMng/rentalLeaveSite.html',
            controller: 'rentalLeaveSiteController as rentalLeaveSiteCtrl',
            size: 'lg',
            resolve: {
              orderMachineList: function () {
                return orderMachineList;
              },
              orderId: function () {
                return orderId;
              }
            }
          });
        })
    }

  }
})();
