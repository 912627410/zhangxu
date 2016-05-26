(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('priviligeMngController', priviligeMngController);

  /** @ngInject */
  function priviligeMngController($rootScope,$confirm, $uibModal, NgTableParams, ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, PRIVILAGE_PAGE_URL,PRIVILAGE_STATUS_URL,PRIVILAGE_STATUS_DISABLE_URL,PRIVILAGE_STATUS_ENABLE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];
    vm.priviligeStatusList;

    //初始化查询参数
    vm.priviligeInfo = {
      "name": ""
    };

    //得到设备类型集合
    var deviceTypeData = serviceResource.restCallService(PRIVILAGE_STATUS_URL, "QUERY");
    deviceTypeData.then(function (data) {
      vm.priviligeStatusList = data;
    }, function (reason) {
      Notification.error('获取权限状态失败');
    })



    /**
     * 分页查询
     * @param page
     * @param size
     * @param sort
       * @param priviligeInfo
       */
    vm.query = function (page, size, sort, priviligeInfo) {
      //构造查询条件
      var restCallURL = PRIVILAGE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != priviligeInfo) {
        if (null != priviligeInfo.permission && priviligeInfo.permission != "") {
          restCallURL += "&search_LIKE_permission=" + priviligeInfo.permission;
        }

        if (null != priviligeInfo.status ) {
          restCallURL += "&search_EQ_status=" + priviligeInfo.status.value;
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
      vm.priviligeInfo = null;
    }


    /**
     * 新建角色
     * @param size
       */
    vm.newPrivilige = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/priviligeManagement/newPrivilige.html',
        controller: 'newPriviligeController as newPriviligeController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    //更新角色
    vm.updatePrivilige = function (priviligeInfo, size) {

      var sourcePriviligeInfo = angular.copy(priviligeInfo); //深度copy
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/priviligeManagement/updatePrivilige.html',
        controller: 'updatePriviligeController as updatePriviligeController',
        size: size,
        backdrop: false,
        resolve: {
          priviligeInfo: function () {
            return priviligeInfo;
          }
        }
      });

      modalInstance.result.then(function(result) {
        vm.updateTable(data.content);
      }, function(reason) {
        vm.updateTable(sourcePriviligeInfo);

      });
    };


    vm.statusDisable = function (priviligeInfo) {
      $confirm({text: '确定要禁用吗?',title: '禁用确认', ok: '确定', cancel: '取消'})
        .then(function() {
          var restPromise = serviceResource.restUpdateRequest(PRIVILAGE_STATUS_DISABLE_URL, priviligeInfo.id);
          restPromise.then(function (data) {
            Notification.success("禁用成功!");
            vm.updateTable(data.content);

          }, function (reason) {
            Notification.error("禁用出错!");
          });
        });
    };

    vm.statusEnable = function (priviligeInfo) {
      $confirm({text: '确定要启用吗?',title: '启用确认', ok: '确定', cancel: '取消'})
        .then(function() {
          var restPromise = serviceResource.restUpdateRequest(PRIVILAGE_STATUS_ENABLE_URL, priviligeInfo.id);
          restPromise.then(function (data) {
            Notification.success("启用成功!");
            vm.updateTable(data.content);
          }, function (reason) {
            Notification.error("启用出错!");
          });
        });
    };

    vm.updateTable=function(content){
      for(var i=0;i<vm.tableParams.data.length;i++){
        if(vm.tableParams.data[i].id==content.id){
          vm.tableParams.data[i]=content;
        }
      }
    }
  }
})();
