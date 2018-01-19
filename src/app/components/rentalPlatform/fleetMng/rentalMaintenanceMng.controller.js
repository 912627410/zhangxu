/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMaintenanceController', rentalMaintenanceController);

  /** @ngInject */
  function rentalMaintenanceController( $window,$filter,$uibModal,rentalService, serviceResource,NgTableParams,ngTableDefaults, Notification,treeFactory,
                                        RENTAL_MAINTENANCE_URL,DEFAULT_SIZE_PER_PAGE,RENTAL_MAINTENANCE_PAGE_URL,RENTAL_MAINTENANCE_GROUP_BY_STATUS,languages) {
    var vm = this;
    vm.totalOrders=0;
    vm.planOrders=0;
    vm.processOrders=0;
    vm.fininshOrders=0;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];



    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };
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
      Notification.error(languages.findKey('faGetState'));
    })
    var listStatusPromise = rentalService.getMaintenanceListStatusList();
    listStatusPromise.then(function (data) {
      vm.listStatusList= data;

    }, function (reason) {
      Notification.error(languages.findKey('faGetState'));
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
        Notification.error(languages.findKey('FaGetCu'));
      });
    };


    vm.query(null,null,null,null);

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

    //重置查询框
    vm.reset = function () {
      vm.maintenance = {};
      vm.machine = {};
      vm.org={};
      vm.querySubOrg=false;
    }

    /**
     * 跳转到更新页面
     * @param id
     */
    vm.update=function(id){
      //$state.go('rental.updateMaintenance', {id: id});
      var maintenceUrl=RENTAL_MAINTENANCE_URL+"?id="+ id;
      var rspdata = serviceResource.restCallService(maintenceUrl,"GET");
      rspdata.then(function (data) {
        var rentalMaintence=data.content;

        var modalInstance= $uibModal.open({
          animation: true,
          templateUrl: 'app/components/rentalPlatform/fleetMng/updateRentalMaintenanceMng.html',
          controller: 'updateRentalMaintenanceController',
          controllerAs:'updateRentalMaintenanceCtrl',
          size: 'lg',
          resolve: {
            rentalMaintence: function () {
              return rentalMaintence;
            }
          }
        });
        modalInstance.result.then(function (result) {
          var tabList=vm.tableParams.data;
          //更新内容
          for(var i=0;i<tabList.length;i++){
            if(tabList[i].id==result.id){
              tabList[i]=result;
            }
          }
        }, function () {
          //取消
        });
      })
    }

 /**
     * 跳转到查看页面
     * @param id
     */
    vm.view=function(id){
      //$state.go('rental.viewMaintenance', {id: id});
      var maintenceUrl=RENTAL_MAINTENANCE_URL+"?id="+ id;
      var rspdata = serviceResource.restCallService(maintenceUrl,"GET");
      rspdata.then(function (data) {
        var rentalMaintence=data.content;
        var modalInstance = $uibModal.open({
          animation: true,
          backdrop: false,
          templateUrl: 'app/components/rentalPlatform/fleetMng/viewRentalMaintenanceMng.html',
          controller: 'viewRentalMaintenanceController',
          controllerAs:'viewRentalMaintenanceCtrl',
          size: 'lg',
          resolve: {
            rentalMaintence: function () {
              return rentalMaintence;
            }

          }
        });
      }, function () {
        //取消
      });

    }


    vm.new=function(){
      //$state.go('rental.newMaintenance');
      var modalInstance = $uibModal.open({
        animation: true,
        backdrop: false,
        templateUrl: 'app/components/rentalPlatform/fleetMng/newRentalMaintenanceMng.html',
        controller: 'newRentalMaintenanceController',
        controllerAs:'newRentalMaintenanceCtrl',
        size: 'super-lgs',
      });
       modalInstance.result.then(function (newMaintence) {
        vm.totalOrders += 1;
        vm.tableParams.data.splice(0, 0, newMaintence);
      }, function () {
        //取消
      });
    }


    var groupByStatusListPromise = serviceResource.restCallService(RENTAL_MAINTENANCE_GROUP_BY_STATUS,"GET");
    groupByStatusListPromise.then(function (data) {
      var groupByStatusList= data.content;

      for(var i=0;i<groupByStatusList.length;i++){
        var retanlOrderStatus=groupByStatusList[i];
        console.log(retanlOrderStatus);
        if(retanlOrderStatus.status==1){ //计划
          vm.planOrders+=retanlOrderStatus.rentalOrderNumber;
        }else if(retanlOrderStatus.status==2){ //进行中
          vm.processOrders+=retanlOrderStatus.rentalOrderNumber;
        }else{
          vm.fininshOrders+=retanlOrderStatus.rentalOrderNumber;
        }


        // console.log(vm.totalOrders);
        vm.totalOrders+=retanlOrderStatus.rentalOrderNumber;

        // console.log(vm.totalOrders);

      }
    }, function (reason) {
      Notification.error(languages.findKey('getStaGroupFail'));
    })



  }
})();
