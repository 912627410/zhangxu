(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($rootScope, $scope,$window,$http,$uibModal,Notification,Idle, Keepalive,$translate,languages) {
    var vm = this;
    vm.profileFormHided = true;
    vm.logout = function(){
      $rootScope.userInfo = null;
      $rootScope.deviceGPSInfo = null;
      $rootScope.statisticInfo = null;
      $window.sessionStorage["userInfo"] = null;
      $window.sessionStorage["deviceGPSInfo"] = null;
      $window.sessionStorage["statisticInfo"] = null;
      //如果http header里面有auth信息的话好像是每次都验证的
      $http.defaults.headers.common['Authorization'] = null;

      //发送消息清除地图上的点
      //$scope.$emit('mapObject', {
      //    AMap: AMap,
      //    map: map
      //});
      //停止监控用户登录超时
      Idle.unwatch();

      $rootScope.$state.go('home.login');
      Notification.success(languages.findKey('successfulExit'));

    }

    //显示profile box
    vm.hideProfile = function(){
      vm.profileFormHided = !vm.profileFormHided;
    }

    //用户登录超时设置
    $rootScope.events = [];

    $rootScope.$on('IdleStart', function() {
      // the user appears to have gone idle
      closeModals();

      $rootScope.warning = $uibModal.open({
        templateUrl: 'app/components/common/warning-dialog.html',
        windowClass: 'modal-warning'
      });
    });

    $rootScope.$on('IdleWarn', function(e, countdown) {
      // follows after the IdleStart event, but includes a countdown until the user is considered timed out
      // the countdown arg is the number of seconds remaining until then.
      // you can change the title or display a warning dialog from here.
      // you can let them resume their session by calling Idle.watch()
    });

    $rootScope.$on('IdleTimeout', function() {
      // the user has timed out (meaning idleDuration + timeout has passed without any activity)
      // this is where you'd log them
      closeModals();
      vm.logout();
      //$rootScope.timedout = $uibModal.open({
      //  templateUrl: 'app/components/common/timedout-dialog.html',
      //  windowClass: 'modal-danger'
      //});
    });

    $rootScope.$on('IdleEnd', function() {
      // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
      closeModals();
    });

    $rootScope.$on('Keepalive', function() {
      // do something to keep the user's session alive
    });

    function closeModals() {
      if ($rootScope.warning) {
        $rootScope.warning.close();
        $rootScope.warning = null;
      }

      if ($rootScope.currentOpenModal) {
        $rootScope.currentOpenModal.close();
        $rootScope.currentOpenModal = null;
      }
    }

     $scope.changeLanguage = function (langKey) {
       $translate.use(langKey);
      };

  }

})();
