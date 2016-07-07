/**
 * Created by shuangshan on 16/7/7.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('idleDeviceController', idleDeviceController);

  /** @ngInject */
  function idleDeviceController($rootScope, NgTableParams,ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, DEVCE_PAGED_QUERY) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    var dataUploadDate = new Date();
    dataUploadDate.setDate(dataUploadDate.getDate()-5);
    vm.dataUploadDate = dataUploadDate;


    //date picker
    vm.dataUploadDateOpenStatus = {
      opened: false
    };

    vm.dataUploadDateOpen = function($event) {
      vm.dataUploadDateOpenStatus.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    vm.query = function (page, size, sort, DataUploadDate) {
      var restCallURL = DEVCE_PAGED_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "lastDataUploadTime,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != DataUploadDate) {
        var DataUploadMonth = DataUploadDate.getMonth() +1;  //getMonth返回的是0-11
        var DataUploadDateFormated = DataUploadDate.getFullYear() + '-' + addZero(DataUploadMonth,2) + '-' + addZero(DataUploadDate.getDate(),2);
        restCallURL += "&search_DLTE_lastDataUploadTime=" + DataUploadDateFormated;
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
        //vm.machineList = null;
        Notification.error("获取数据失败");
      });
    };


    //重置查询框
    vm.reset = function () {
      vm.DataUploadDate = null;
    }

  }
})();
