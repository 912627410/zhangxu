/**
 * Created by fxp on 9/25/17.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('appVersionController', appVersionController);

  /** @ngInject */
  function appVersionController($rootScope, $uibModal, NgTableParams, ngTableDefaults, Notification, serviceResource ,APP_VERSION_PAGE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.appTypeList = [
      {icon: "fa fa-android", type: "android"},
      {icon: "fa fa-apple", type:"iphone"}
    ];


    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, appVersion) {
      var restCallURL = APP_VERSION_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 10;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != appVersion) {

        if (null != appVersion.appType) {
          restCallURL += "&search_EQ_appType=" + appVersion.appType;
        }
        if (null != appVersion.appName) {
          restCallURL += "&search_LIKE_appName=" + appVersion.appName;
        }

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
        Notification.error("获取作业面数据失败");
      });
    };


    vm.versionContentView = function (appVersion) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/appManagement/versionContent.html',
        controller: 'versionContentController as versionContentCtrl',
        size: 'md',
        backdrop: false,
        resolve: {
          appVersion: appVersion
        }

      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);
        vm.page.totalElements += 1;
      }, function () {
        //取消
      });
    };

    vm.newAppVersion = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/appManagement/newAppVersion.html',
        controller: 'newAppVersionController as newAppVersionCtrl',
        size: 'md',
        backdrop: false
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);
        vm.page.totalElements += 1;
      }, function () {
        //取消
      });
    };

    //更新AppVersion
    vm.updateAppVersion = function (appVersion) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/appManagement/updateAppVersion.html',
        controller: 'updateAppVersionController as updateAppVersionCtrl',
        size: 'md',
        backdrop: false,
        resolve: {
          appVersion: appVersion
        }
      });

      modalInstance.result.then(function(result) {

        var tabList=vm.tableParams.data;
        //更新内容
        for(var i=0;i<tabList.length;i++){
          if(tabList[i].id==result.id){
            tabList[i]=result;
          }
        }

      }, function(reason) {

      });

    };


    //重置查询框
    vm.reset = function () {
      vm.appVersion = null;
    }

    // 初始查询
    vm.query();


  }
})();
