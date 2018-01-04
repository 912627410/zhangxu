/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngTerminalMngController', minemngTerminalMngController);

  /** @ngInject */
  function minemngTerminalMngController($rootScope,serviceResource, MINEMNG_TERMINALPAGE_URL, DEFAULT_MINSIZE_PER_PAGE, NgTableParams, Notification, languages) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //分页查询用户信息
    vm.query = function (page, size, sort, minemngTerminal) {
      var restCallURL = MINEMNG_TERMINALPAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (minemngTerminal != 'undefined' && null != minemngTerminal) {

        if (null != minemngTerminal.terminalNumber && minemngTerminal.terminalNumber != "") {
          restCallURL += "&terminalNumber=" + minemngTerminal.terminalNumber;
        }
        if (null != minemngTerminal.simCardNumber && minemngTerminal.simCardNumber != "") {
          restCallURL += "&simCardNumber=" + minemngTerminal.simCardNumber;
        }
      }
      if (null != vm.carNumber && vm.carNumber != "") {
        restCallURL += "&carNumber=" + vm.carNumber;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({}, {
          dataset: data.content

        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;

      }, function (reason) {
        Notification.error(languages.findKey('获取终端信息数据失败'));
      });
    };
    //vm.query(null, null, null, null);

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.terminalNumber = null;
      vm.simCardNumber = null;
      vm.carNumber = null;
    };

  }
})();
