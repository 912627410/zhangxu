/**
 * Created by yalong on 17-12-8.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngTopbarController', minemngTopbarController);

  /** @ngInject */
  function minemngTopbarController($rootScope, $cookies, $scope, $window, $http, Notification, Idle, $translate, languages) {
    var vm = this;

    vm.logout = function () {
      $rootScope.logo = "assets/images/logo2.png";

      $rootScope.userInfo = null;
      $rootScope.deviceGPSInfo = null;
      $rootScope.statisticInfo = null;
      $rootScope.permissionList = null;

      $window.sessionStorage.removeItem("userInfo");
      $window.sessionStorage.removeItem("deviceGPSInfo");
      $window.sessionStorage.removeItem("statisticInfo");
      $window.sessionStorage.removeItem("permissionList");

      var cookieDate = {};
      cookieDate.value = 1;
      $cookies.putObject("IOTSTATUS", cookieDate);
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 10);//设置cookie保存10天
      $cookies.putObject("IOTSTATUS", cookieDate, {'expires': expireDate});


      //如果http header里面有auth信息的话好像是每次都验证的
      $http.defaults.headers.common['token'] = null;

      //停止监控用户登录超时
      Idle.unwatch();

      $rootScope.$state.go('login');
      Notification.success(languages.findKey('successfulExit'));

    }

    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey);
    };

  }

})();
