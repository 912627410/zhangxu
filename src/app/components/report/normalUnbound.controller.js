/**
 * Created by yaLong on 17-2-6.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('normalUnboundController', normalUnboundController);

  /** @ngInject */
  function normalUnboundController($rootScope, $http,languages, NgTableParams,ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, DEVCE_NORMAL_UNBOUND_QUERY, DEVCE_NORMAL_UNBOUND_EXPORT) {
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
      restCallURL += "&search_EQ_smsType=2";

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('rentalGetDataError'));
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

        //兼容多种浏览器
        if (window.navigator.msSaveBlob) { // IE
          window.navigator.msSaveOrOpenBlob(blob, '正常解绑的车辆.xls')
        } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
          anchor.css({display: 'none'});
          angular.element(document.body).append(anchor);
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download: '正常解绑的车辆.xls'
          })[0].click();
          anchor.remove();
        } else { // Chrome
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download: '正常解绑的车辆.xls'
          })[0].click();
        }
        anchor.attr({
          href: objectUrl,
          target: '_blank',
          download: '正常解绑的车辆.xls'
        })[0].click();

      }).error(function (data, status, headers, config) {
        Notification.error(languages.findKey('failedToDownload'));
      });
    };
  }
})();
