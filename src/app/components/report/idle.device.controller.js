/**
 * Created by shuangshan on 16/7/7.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('idleDeviceController', idleDeviceController);

  /** @ngInject */
  function idleDeviceController($rootScope, $http,languages, NgTableParams,ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, DEVCE_PAGED_QUERY, DEVCE_NOUPLOAD_DATA_EXCELEXPORT) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.queryTime = null;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //重置查询框
    vm.reset = function () {
      var dataUploadDate = new Date();
      dataUploadDate.setDate(dataUploadDate.getDate()-3);
      vm.dataUploadDate = dataUploadDate;
    };
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
        vm.queryTime = new Date();
      }, function (reason) {
        //vm.machineList = null;
        Notification.error(languages.findKey('rentalGetDataError'));
      });
    };

    vm.init = function () {
      vm.reset();
      var date = new Date();
      date.setDate(date.getDate() - 3);
      vm.query(null,null,null,date);
    };
    vm.init();

    vm.excelExport = function (DataUploadDate) {
      var restCallURL = DEVCE_NOUPLOAD_DATA_EXCELEXPORT;
      if (DataUploadDate) {
        var DataUploadMonth = DataUploadDate.getMonth() +1;  //getMonth返回的是0-11
        var DataUploadDateFormated = DataUploadDate.getFullYear() + '-' + addZero(DataUploadMonth,2) + '-' + addZero(DataUploadDate.getDate(),2);
        restCallURL += "?lastDataUploadTime=" + DataUploadDateFormated;
      }

      $http({
        url: restCallURL,
        method: "GET",
        responseType: 'arraybuffer'
      }).success(function (data, status, headers, config) {
        var blob = new Blob([data], { type: "application/vnd.ms-excel" });
        var objectUrl = window.URL.createObjectURL(blob);

        var anchor = angular.element('<a/>');
        //兼容多种浏览器
        if (window.navigator.msSaveBlob) { // IE
          window.navigator.msSaveOrOpenBlob(blob, '长时间未连接设备.xls')
        } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
          anchor.css({display: 'none'});
          angular.element(document.body).append(anchor);
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download: '长时间未连接设备.xls'
          })[0].click();
          anchor.remove();
        } else { // Chrome
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download: '长时间未连接设备.xls'
          })[0].click();
        }



      }).error(function (data, status, headers, config) {
        Notification.error(languages.findKey('failedToDownload'));
      });
    };
  }
})();
