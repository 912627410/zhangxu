(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($rootScope, $cookies, $scope, $window, $http, $uibModal, permissions, Notification, Idle, Keepalive, $translate, languages) {
    var vm = this;
    vm.profileFormHided = true;
    var userInfo = $rootScope.userInfo;

    if (null != userInfo && null != userInfo.userdto && null != userInfo.userdto.organizationDto &&
      null != userInfo.userdto.organizationDto.logo && userInfo.userdto.organizationDto.logo != "") {
      $rootScope.logo = "assets/images/" + $rootScope.userInfo.userdto.organizationDto.logo;
    } else {
      $rootScope.logo = "assets/images/logo.png";
    }

    if ($rootScope.userInfo) {
      //监控用户登录超时
      Idle.watch();
    }

    vm.logout = function () {
      $rootScope.logo = "assets/images/logo.png";
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
      $cookies.putObject("LGSTATUS", cookieDate);
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 10);//设置cookie保存10天
      $cookies.putObject("LGSTATUS", cookieDate, {'expires': expireDate});

      //如果http header里面有auth信息的话好像是每次都验证的
      $http.defaults.headers.common['token'] = null;

      //停止监控用户登录超时
      Idle.unwatch();
      var bodyDom = angular.element(document.body);
      bodyDom.removeClass("sidebar-collapse");
      $rootScope.$state.go('login');
      Notification.success(languages.findKey('successfulExit'));
    };

    //显示profile box
    vm.hideProfile = function () {
      vm.profileFormHided = !vm.profileFormHided;
    };

    //用户登录超时设置
    $scope.events = [];

    /**
     * 开始弹出超时报警model
     */
    $scope.$on('IdleStart', function () {
      closeModals();
      $scope.warning = $uibModal.open({
        templateUrl: 'app/components/common/warning-dialog.html',
        windowClass: 'modal-warning'
      });
    });

    /**
     * 超时提醒过程中每一秒执行一次
     */
    $scope.$on('IdleWarn', function (e, countdown) {

    });

    /**
     * 超时退出
     */
    $scope.$on('IdleTimeout', function () {
      closeModals();
      vm.logout();
    });

    $scope.$on('IdleEnd', function () {
      closeModals();
    });

    /**
     * 保鲜机制监听
     */
    $scope.$on('Keepalive', function () {
    });

    /**
     * 关闭超时框
     */
    function closeModals() {
      if ($scope.warning) {
        $scope.warning.close();
        $scope.warning = null;
      }
      if ($rootScope.currentOpenModal) {
        $rootScope.currentOpenModal.close();
        $rootScope.currentOpenModal = null;
      }
    }

    /**
     * 切换语言
     * @param langKey
     */
    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey);
    };

  }

})();
