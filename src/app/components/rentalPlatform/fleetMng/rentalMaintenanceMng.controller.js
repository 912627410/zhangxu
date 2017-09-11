/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMaintenanceController', rentalMaintenanceController);

  /** @ngInject */
  function rentalMaintenanceController($scope, $window, $location,$state,$filter, $anchorScroll,rentalService, serviceResource,NgTableParams,ngTableDefaults,Notification,permissions,treeFactory,DEFAULT_SIZE_PER_PAGE,RENTAL_MAINTENANCE_PAGE_URL) {
    var vm = this;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


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


    var statusPromise = rentalService.getMaintenanceStatusList();
    statusPromise.then(function (data) {
      vm.statusList= data;

    }, function (reason) {
      Notification.error('获取状态集合失败');
    })
    var listStatusPromise = rentalService.getMaintenanceListStatusList();
    listStatusPromise.then(function (data) {
      vm.listStatusList= data;

    }, function (reason) {
      Notification.error('获取状态集合失败');
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


    vm.query = function (page, size, sort, maintentance) {
      console.log("111222");
      var restCallURL = RENTAL_MAINTENANCE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if (null != maintentance) {



        if (null != maintentance.status&&maintentance.status!="") {
          restCallURL += "&search_EQ_status=" + maintentance.status.value;
        }

        if (null != maintentance.startDate&&maintentance.startDate!="") {
          restCallURL += "&search_DGTE_createTime=" + $filter('date')(maintentance.startDate, 'yyyy-MM-dd');
        }

        if (null != maintentance.endDate&&maintentance.endDate!="") {
          restCallURL += "&search_DLTE_updateTime=" + $filter('date')(maintentance.endDate, 'yyyy-MM-dd');
        }



      }

      if (null != vm.machine&&null != vm.machine.licenseId) {
        restCallURL += "&search_LIKE_machine.licenseId=" + vm.machine.licenseId;
      }


      if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
        restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
      }

      if(null != vm.org&&null != vm.org.id&&vm.querySubOrg){
        restCallURL += "&parentOrgId=" +vm.org.id;
      }

      console.log(restCallURL);

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
        Notification.error("获取客户数据失败");
      });
    };


    vm.query(null,null,null,null);

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

    //重置查询框
    vm.reset = function () {
      vm.maintentance = null;
      vm.machine = null;
      vm.org=null;
      vm.querySubOrg=false;
    }

    /**
     * 跳转到更新页面
     * @param id
     */
    vm.update=function(id){
      $state.go('rental.updateMaintenance', {id: id});
    }
 /**
     * 跳转到查看页面
     * @param id
     */
    vm.view=function(id){
      $state.go('rental.viewMaintenance', {id: id});
    }


    vm.new=function(){
      $state.go('rental.newMaintenance');
    }


  }
})();
