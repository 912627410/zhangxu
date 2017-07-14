/**
 * @author songyutao
 * @create 2017-07-04
 * @email yutao.song@nvr-china.com
 * @describe 车辆类型管理页面的Js
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineTypeMngController', machineTypeMngController);

  /** @ngInject */
  function machineTypeMngController($rootScope, $uibModal, NgTableParams, ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, MACHINE_TYPE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.orgTypeList;

    //初始化查询参数
    vm.machineTypeInfo = {
      "name": ""
    };

    /**
     * 分页查询
     * @param page
     * @param size
     * @param sort
     * @param machineTypeInfo
     */
    vm.query = function (page, size, sort, machineTypeInfo) {
      //构造查询条件
      var restCallURL = MACHINE_TYPE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,asc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != machineTypeInfo) {
        if (null != machineTypeInfo.typeName && machineTypeInfo.typeName != "") {
          restCallURL += "&search_LIKE_typeName=" + machineTypeInfo.typeName;
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
        Notification.error("获取车辆类型数据失败");
      });
    }

    //首次查询
    vm.query();

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.machineTypeInfo = null;
    }


    /**
     * 新建车辆类型
     * @param size 模态框大小
     */
    vm.newMachineType = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineTypeManagement/newMachineType.html',
        controller: 'newMachineTypeController as newMachineTypeCtrl',
        size: size,
        backdrop: false
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    /**
     * 更新车辆类型
     * @param machineTypeInfo 车辆类型信息
     * @param size 模态框大小
     */
    vm.updateMachineType = function (machineTypeInfo, size) {

      var sourceMachineTypeInfo = angular.copy(machineTypeInfo); //深度copy
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineTypeManagement/updateMachineType.html',
        controller: 'updateMachineTypeController as updateMachineTypeCtrl',
        size: size,
        backdrop: false,
        resolve: {
          machineTypeInfo: function () {
            return machineTypeInfo;
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
          if(vm.tableParams.data[i].id==sourceMachineTypeInfo.id){
            vm.tableParams.data[i]=sourceMachineTypeInfo;
          }
        }
      });
    };

    //隶属组织管理
    vm.orgMng = function (machineTypeInfo,size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineTypeManagement/machineTypeOrgMng.html',
        controller: 'machineTypeOrgMngController as machineTypeOrgMngCtrl',
        size: size,
        backdrop: false,
        resolve: {
          machineTypeInfo: function () {
            return machineTypeInfo;
          },

        }
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

  }
})();
