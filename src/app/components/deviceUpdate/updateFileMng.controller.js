/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('updateFileMngController', updateFileMngController);

  function updateFileMngController($rootScope, ngTableDefaults, $scope, $uibModal, Notification, NgTableParams, UPDATE_FILE_UPLOAD_QUERY, DEFAULT_SIZE_PER_PAGE, UPDATE_FILE_DATA_BY, serviceResource, $confirm, REMOVE_UPDATE_FILE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.query=function(page, size, sort, updateFile){
      var restCallURL = UPDATE_FILE_UPLOAD_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || UPDATE_FILE_DATA_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if(null != vm.queryVersionNum && vm.queryVersionNum != "") {
        restCallURL += "&search_LIKE_versionNum=" + (vm.queryVersionNum);
      }
      if(null != vm.querySoftVersion && vm.querySoftVersion != ""){
        restCallURL += "&search_EQ_softVersion=" + (Math.round(vm.querySoftVersion*100))      }

      if(null != vm.queryFileName&&null != ""){
        restCallURL += "&search_LIKE_fileName=" + (vm.queryFileName);
      }

      if(null != vm.queryApplicableProducts&&null != ""){
        restCallURL += "&search_LIKE_applicableProducts=" + (vm.queryApplicableProducts);
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
          operatorInfo: function () {
            return vm.operatorInfo;
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
      vm.queryApplicableProducts = null;
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
