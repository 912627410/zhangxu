/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('updateFileMngController', updateFileMngController);

  function updateFileMngController($rootScope, ngTableDefaults, $http, $scope, $uibModal, Notification, NgTableParams, UPDATE_FILE_UPLOAD_QUERY, DEFAULT_SIZE_PER_PAGE,
                                   UPDATE_FILE_DATA_BY, serviceResource, $confirm, REMOVE_UPDATE_FILE_URL, UPDATE_OBJECT_LIST) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.query = function(page, size, sort, updateFile){
      var restCallURL = UPDATE_FILE_UPLOAD_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || UPDATE_FILE_DATA_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if(null != vm.queryVersionNum && vm.queryVersionNum != "") {
        restCallURL += "&search_LIKE_versionNum=" + (vm.queryVersionNum);
      }
      if(null != vm.querySoftVersion && vm.querySoftVersion != ""){
        restCallURL += "&search_EQ_softVersion=" + (Math.round(vm.querySoftVersion*100))
      }

      if(null != vm.queryFileName && vm.queryFileName != ""){
        restCallURL += "&search_LIKE_fileName=" + (vm.queryFileName);
      }

      if(null != vm.queryProjectTeam && vm.queryProjectTeam != ""){
        restCallURL += "&search_EQ_projectTeam=" + vm.queryProjectTeam;
      }

      if(null != vm.queryProjectCode && vm.queryProjectCode != ""){
        restCallURL += "&search_EQ_projectCode=" + vm.queryProjectCode;
      }

      if(null != vm.queryCustomerCode && vm.queryCustomerCode != ""){
        restCallURL += "&search_EQ_customerCode=" + vm.queryCustomerCode;
      }

      if(null != vm.queryHardwareVersion && vm.queryHardwareVersion != ""){
        restCallURL += "&search_EQ_hardwareVersion=" + vm.queryHardwareVersion;
      }

      if(null != vm.queryUpgradeMethod && vm.queryUpgradeMethod != ""){
        restCallURL += "&search_EQ_upgradeMethod=" + vm.queryUpgradeMethod;
      }
      restCallURL += "&search_EQ_status=1";
      var updateFilePromis = serviceResource.restCallService(restCallURL, "GET");
      updateFilePromis.then(function(data){
        vm.updateFileList = data.content;
        vm.tableParams = new NgTableParams({},{
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取升级文件信息失败");
      });
    };

    vm.query(null, null, null, null);

    /**
     * 获取项目组集合
     */
    vm.getProjectTeams = function () {
      var restCallURL = UPDATE_OBJECT_LIST;
      restCallURL += "?parentId=0";
      var dataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      dataPromis.then(function (data) {
        vm.projectTeams = data;
      });
    };

    vm.getProjectTeams();

    /**
     * 获取项目代号集合
     * @param code
     */
    vm.getProjectCodes = function (code) {
      vm.queryProjectCode = null;
      vm.queryCustomerCode = null;
      vm.projectCodes = null;
      vm.customerCodes = null;
      var id = vm.getIdByCode(vm.projectTeams, code);
      var restCallURL = UPDATE_OBJECT_LIST;
      restCallURL += "?parentId=" + id;
      var dataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      dataPromis.then(function (data) {
        vm.projectCodes = data;
      });
    };

    /**
     * 获取客户编码集合
     * @param code
       */
    vm.getCustomerCodes = function (code) {
      vm.queryCustomerCode = null;
      vm.customerCodes = null;
      var id = vm.getIdByCode(vm.projectCodes, code);
      var restCallURL = UPDATE_OBJECT_LIST;
      restCallURL += "?parentId=" + id;
      var dataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      dataPromis.then(function (data) {
        vm.customerCodes = data;
      });
    };

    /**
     * 根据code获得相应的id
     * @param list
     * @param code
     * @returns {*}
       */
    vm.getIdByCode = function(list, code) {
      var len = list.length;
      if(len <= 0) return;
      for(var i = 0;i < len;i++) {
        if(list[i].code == code) {
          return list[i].id;
        }
      }
    };

    //新增升级文件
    vm.newUpdateFile = function(size){
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceUpdate/newUpdateFile.html',
        controller: 'newUpdateFileController as newUpdateFileCtrl',
        size: size,
        backdrop:false,
        scope:$scope,
        resolve: {
          projectTeams: function () {
            return vm.projectTeams;
          }
        }
      });

      modalInstance.result.then(function () {
        vm.query();
      }, function () {
        //取消
      });
    };

    //修改升级文件
    vm.modifyFile = function(updateFile, size){
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceUpdate/modifyFile.html',
        controller: 'modifyFileController as modifyFileCtrl',
        size: size,
        backdrop:false,
        scope:$scope,
        resolve: {
          updateFile: function () {
            return updateFile;
          },
          projectTeams: function () {
            return vm.projectTeams;
          }
        }
      });

      modalInstance.result.then(function () {
        vm.query();
      }, function () {
        vm.query();
      });
    };

    //重置查询框
    vm.reset = function() {
      vm.queryVersionNum = null;
      vm.querySoftVersion = null;
      vm.queryFileName = null;
      vm.queryProjectTeam = null;
      vm.queryProjectCode = null;
      vm.queryCustomerCode = null;
      vm.queryHardwareVersion = null;
      vm.queryUpgradeMethod = null;
      vm.projectCodes = null;
      vm.customerCodes = null;
    }

    //删除
    vm.removeFile = function (fileId) {
      if(fileId != null) {
        $confirm({
          title:"删除确认",
          text: "确定要删除吗?"
        }).then(function () {
          var restURL = REMOVE_UPDATE_FILE_URL + "?updateFileId=" + fileId;
          var rspData = serviceResource.restCallService(restURL, "GET");
          rspData.then(function(data){
            if(data.code == 0) {
              vm.query(0,null,null,vm.update);
              Notification.success(data.content);
            } else {
              Notification.error(data.content);
            }
          }, function (reason) {
            Notification.error(reason.data.message);
          })
        })
      }
    }
  }


})();
