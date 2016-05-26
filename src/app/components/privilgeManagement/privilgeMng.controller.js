(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('privilgeMngController', privilgeMngController);

  /** @ngInject */
  function privilgeMngController($rootScope, $uibModal, NgTableParams, ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, PRIVILAGE_PAGE_URL,PRIVILAGE_STATUS_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];
    vm.privilgeStatusList;

    //初始化查询参数
    vm.privilgeInfo = {
      "name": ""
    };

    //得到设备类型集合
    var deviceTypeData = serviceResource.restCallService(PRIVILAGE_STATUS_URL, "QUERY");
    deviceTypeData.then(function (data) {
      vm.privilgeStatusList = data;
    }, function (reason) {
      Notification.error('获取权限状态失败');
    })



    /**
     * 分页查询
     * @param page
     * @param size
     * @param sort
       * @param privilgeInfo
       */
    vm.query = function (page, size, sort, privilgeInfo) {
      //构造查询条件
      var restCallURL = PRIVILAGE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != privilgeInfo) {
        if (null != privilgeInfo.permission && privilgeInfo.permission != "") {
          restCallURL += "&search_LIKE_permission=" + privilgeInfo.permission;
        }

        if (null != privilgeInfo.status ) {
          restCallURL += "&search_EQ_status=" + privilgeInfo.status.value;
        }

      }
      var promise = serviceResource.restCallService(restCallURL, "GET");
      promise.then(function (data) {

        vm.tableParams = new NgTableParams({},
          {
            dataset: data.content
          });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取角色数据失败");
      });
    }

    //首次查询
    vm.query();

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.privilgeInfo = null;
    }


    /**
     * 新建角色
     * @param size
       */
    vm.newPrivilge = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/privilgeManagement/newPrivilge.html',
        controller: 'newPrivilgeController as newPrivilgeController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
       // console.log(result);
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    //更新角色
    vm.updatePrivilge = function (privilgeInfo, size) {

      var sourcePrivilgeInfo = angular.copy(privilgeInfo); //深度copy
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/privilgeManagement/updatePrivilge.html',
        controller: 'updatePrivilgeController as updatePrivilgeController',
        size: size,
        backdrop: false,
        resolve: {
          privilgeInfo: function () {
            return privilgeInfo;
          }
        }
      });

      modalInstance.result.then(function(result) {
        for(var i=0;i<vm.tableParams.data.length;i++){
          if(vm.tableParams.data[i].id==result.id){
            vm.tableParams.data[i]=result;
          }
        }


      }, function(reason) {
        for(var i=0;i<vm.tableParams.data.length;i++){
          if(vm.tableParams.data[i].id==sourcePrivilgeInfo.id){
            vm.tableParams.data[i]=sourcePrivilgeInfo;
          }
        }
      });
    };

  }
})();
