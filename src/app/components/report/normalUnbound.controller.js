/**
 * Created by yaLong on 17-2-6.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('normalUnboundController', normalUnboundController);

  /** @ngInject */
  function normalUnboundController($rootScope, $http, $filter, NgTableParams,ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, DEVCE_NORMAL_UNBOUND_QUERY, DEVCE_NORMAL_UNBOUND_EXPORT) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, queryCriteria) {
      var restCallURL = DEVCE_NORMAL_UNBOUND_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "sendTime,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if (null != queryCriteria) {
        if (null != queryCriteria.deviceNum&&queryCriteria.deviceNum!="") {
          restCallURL += "&deviceNum=" + $filter('uppercase')(queryCriteria.deviceNum);
        }
        if (null != queryCriteria.machineLicenseId&&queryCriteria.machineLicenseId!="") {
          restCallURL += "&licenseId=" + $filter('uppercase')(queryCriteria.machineLicenseId);
        }
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取数据失败");
      });
    };

    vm.query(null,null,null,null);

    vm.excelExport = function () {
      var restCallURL = DEVCE_NORMAL_UNBOUND_EXPORT;
      $http({
        url: restCallURL,
        method: "GET",
        responseType: 'arraybuffer'
      }).success(function (data, status, headers, config) {
        var blob = new Blob([data], { type: "application/vnd.ms-excel" });
        var objectUrl = window.URL.createObjectURL(blob);

        var anchor = angular.element('<a/>');
        anchor.attr({
          href: objectUrl,
          target: '_blank',
          download: '正常解绑的车辆.xls'
        })[0].click();

      }).error(function (data, status, headers, config) {
        Notification.error("下载失败!");
      });
    };

    vm.reset = function () {
      vm.queryDeviceinfo = null;
    };
  }
})();
