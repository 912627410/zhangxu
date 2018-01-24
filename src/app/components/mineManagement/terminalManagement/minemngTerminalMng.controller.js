/**
 * Created by weihua on 18-1-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngTerminalMngController', minemngTerminalMngController);

  /** @ngInject */
  function minemngTerminalMngController($rootScope,$uibModal,$confirm,serviceResource,ngTableDefaults,MINEMNG_TERMINALPAGE_URL,MINEMNG_UPDATE_TERMINAL,
                                        MINEMNG_TERMINAL_DELETE, DEFAULT_MINSIZE_PER_PAGE,MINEMNG_TERMINAL_URL, NgTableParams, Notification, languages) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.page = {
      totalElements: 0
    };

    /**
     * 新增终端
     */
    vm.new=function () {
      var modalInstance=$uibModal.open({
        animation: true,
        templateUrl:'app/components/mineManagement/terminalManagement/minemngNewTerminal.html',
        controller:'minemngNewTerminalMngController',
        controllerAs:'minemngNewTerminalMngCtrl',
        size:'md'
      });
      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0,0,result);
        vm.query(null,null,null,null)
      },function () {

      });

    }

    /**
     * 修改终端相关信息
     */
    vm.updateTerminal=function(minemngterminal){
      var restCallURL = MINEMNG_TERMINAL_URL + "?id=" + minemngterminal.id;
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
      var modalInstance=$uibModal.open({
        animation: true,
        templateUrl:'app/components/mineManagement/terminalManagement/minemngUpdateTerminal.html',
        controller:'minemngUpdateTerminalController',
        controllerAs:'minemngUpdateTerminalCtrl',
        size:'md',
        resolve:{
          minemngterminal:function () {
            return minemngterminal;
          }
        }
      });
      modalInstance.result.then(function (result) {

        var tabList = vm.tableParams.data;
        //更新内容
        for (var i = 0; i < tabList.length; i++) {
          if (tabList[i].id == result.id) {
            tabList[i] = result;
          }
        }
       }, function (reason) {

       });

      }, function (reason) {
      });


    };

    /* 删除操作
    * @param id
    */
    vm.delete = function (id) {
      $confirm({text: languages.findKey('areYouWanttoDeleteIt'), title: languages.findKey('deleteConfirmation'), ok: languages.findKey('confirm'), cancel:languages.findKey('cancel')})
        .then(function () {
          var restCall = MINEMNG_TERMINAL_DELETE + "?id=" + id;
          var restPromise = serviceResource.restCallService(restCall, "UPDATE");
          restPromise.then(function (data) {
            Notification.success(languages.findKey('delSuccess'));
            vm.query(null, null, null, null);
          }, function (reason) {
            Notification.error(languages.findKey('delFail'));
          });
        });
    };


    /**
     *  分页查询终端信息
     */
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
        if (data.content.length > 0) {
          vm.tableParams = new NgTableParams({}, {
            dataset: data.content

          });
          vm.page = data.page;
          vm.pageNumber = data.page.number + 1;
          vm.page.totalElements = data.page.totalElements;
        }else {
          Notification.warning(languages.findKey('暂无数据'));
          vm.tableParams = new NgTableParams({},{
            dataset: null
          });
          vm.page.totalElements = 0;
        }
      }, function (reason) {
        Notification.error(languages.findKey('获取终端信息数据失败'));
      });
    };
    vm.query(null, null, null, null);

    /**
     * 重置查询框
     */
    vm.reset = function () {
      vm.minemngTerminal.terminalNumber = null;
      vm.minemngTerminal.simCardNumber = null;
      vm.carNumber = null;
    };

  }
})();
