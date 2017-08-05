/**
 * Created by yalong on 17-7-17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('updateRecordController', updateRecordController);
  function updateRecordController($rootScope, $filter, Notification, NgTableParams, ngTableDefaults, UPDATE_RECORD_URL, DEFAULT_SIZE_PER_PAGE, UPDATE_RECORD_SORT_BY, serviceResource) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];
    vm.query=function(page, size, sort, record){
      var restCallURL = UPDATE_RECORD_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || UPDATE_RECORD_SORT_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      restCallURL += "&search_EQ_tableName=DeviceUpdate";
      if(null != vm.queryDeviceNum&&null != ""){
        restCallURL += "&search_LIKES_fieldName=" + $filter('uppercase')(vm.queryDeviceNum);
      }
      var updateRecord = serviceResource.restCallService(restCallURL, "GET");
      updateRecord.then(function(data){
        vm.updateRecordList = data.content;
        vm.tableParams = new NgTableParams({},{
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取设备升级记录失败");
      });
    };
    vm.query(null, null, null, null);
    //重置查询框
    vm.reset = function() {
      vm.queryDeviceNum = null;
    }
  }
})();
