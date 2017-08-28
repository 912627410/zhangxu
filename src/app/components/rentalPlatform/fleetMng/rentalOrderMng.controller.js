/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalOrderMngController', rentalOrderMngController);

  /** @ngInject */
  function rentalOrderMngController($scope, $window,$state, $location, $filter,$anchorScroll, serviceResource,NgTableParams,ngTableDefaults,treeFactory,Notification,permissions,rentalService,DEFAULT_SIZE_PER_PAGE,RENTAL_ORDER_PAGE_URL) {
    var vm = this;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    vm.anchorList = ["currentLocation", "currentState", "alarmInfo"];


    //加载品牌信息
    var retanlOrderStatusListPromise = rentalService.getRetnalOrderStatusList();
    retanlOrderStatusListPromise.then(function (data) {
      vm.retanlOrderStatusList= data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取状态失败');
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
      console.log("111222");
      var restCallURL = RENTAL_ORDER_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
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
          restCallURL += "&search_DGTE_startDate=" + $filter('date')(rentalOrder.startDate, 'yyyy-MM-dd');
        }

        if (null != rentalOrder.endDate&&rentalOrder.endDate!="") {
          restCallURL += "&search_DLTE_endDate=" + $filter('date')(rentalOrder.endDate, 'yyyy-MM-dd');
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
        Notification.error("获取车辆数据失败");
      });
    };


    vm.query(null,null,null,null);

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

    vm.new=function(id){
      $state.go('rental.newOrder');
    }

    //重置查询框
    vm.reset = function () {
      vm.rentalOrder = null;
      vm.org=null;
      vm.id=null;
    }
  }
})();
