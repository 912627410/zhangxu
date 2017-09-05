/**
 * Created by xielongwang on 2017/7/20.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalPlatformTopbarController', rentalPlatformTopbarController);

  /** @ngInject */
  function rentalPlatformTopbarController($rootScope, $cookies, $scope, $window, $http, $stateParams, permissions, Notification, Idle, $translate, languages) {
    var vm = this;
    vm.logout = function () {
      //更换图标
      $rootScope.logo = "assets/images/logo2.png";
      //移除缓存中的用户信息
      $rootScope.userInfo = null;
      $rootScope.deviceGPSInfo = null;
      $rootScope.statisticInfo = null;
      $rootScope.permissionList = null;
      $window.sessionStorage.removeItem("userInfo");
      $window.sessionStorage.removeItem("deviceGPSInfo");
      $window.sessionStorage.removeItem("statisticInfo");
      $window.sessionStorage.removeItem("permissionList");
      //自动登录cookie设置
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
      //登录页面
      $rootScope.$state.go('login');
      //提示信息
      Notification.success(languages.findKey('successfulExit'));
    };

    /**
     * 切换语言
     * @param langKey
     */
    vm.changeLanguage = function (langKey) {
      $rootScope.langkey = langKey;
      $translate.use(langKey);
      if($scope.langZH){
        $scope.langZH = false;
      }else {
        $scope.langZH = true;
      }
      if($scope.langEN){
        $scope.langEN = false;
      }else {
        $scope.langEN = true;
      }
    };

    var topButtons = document.getElementsByClassName('sidebar-toggle');
    topButtons[0].style.backgroundColor = 'rgb(0,160,152)';
    vm.topButtonClick = function (a) {
      for(var i = 0;i<topButtons.length;i++){
        if(i == a){
          topButtons[i].style.backgroundColor = 'rgb(0,160,152)';
        }
        else{
          topButtons[i].style.backgroundColor = '#262626';
        }
      }
    }

  }

})();
