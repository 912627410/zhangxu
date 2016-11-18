/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('updateFileMngController', updateFileMngController);

  function updateFileMngController($rootScope, $filter, $scope, $uibModal, Notification, NgTableParams, UPDATE_FILE_UPLOAD_QUERY, DEFAULT_SIZE_PER_PAGE, UPDATE_FILE_DATA_BY, serviceResource) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    vm.query=function(page, size, sort, updateFile){
      var restCallURL = UPDATE_FILE_UPLOAD_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || UPDATE_FILE_DATA_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if(null != vm.queryVersionNum&&null != ""){
        restCallURL += "&search_LIKE_versionNum=" + (vm.queryVersionNum);/*$filter('uppercase')*/
      }

      if(null != vm.queryFileName&&null != ""){
        restCallURL += "&search_LIKE_fileName=" + (vm.queryFileName);/*$filter('uppercase')*/
      }

      if(null != vm.queryApplicableProducts&&null != ""){
        restCallURL += "&search_LIKE_applicableProducts=" + (vm.queryApplicableProducts);/*$filter('uppercase')*/
      }

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

    //
    vm.update = function(updateFile){
      Notification.error("暂不支持该功能");
    };

    //删除文件
    vm.delete = function(id){

    };

    //重置查询框
    vm.reset = function() {
      vm.queryVersionNum = null;
      vm.queryFileName = null;
      vm.queryApplicableProducts = null;
    }
  }
})();
