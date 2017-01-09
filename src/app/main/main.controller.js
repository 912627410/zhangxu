(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($rootScope, $cookies,$scope,$window,$http,$uibModal,permissions,Notification,Idle, Keepalive,$translate,languages) {
    var vm = this;
    vm.profileFormHided = true;
    //$rootScope.logo="assets/images/logo.png";

    var userInfo=$rootScope.userInfo;
    if(null!=userInfo&&null!=userInfo.userdto&&null!=userInfo.userdto.organizationDto&&
      null!=userInfo.userdto.organizationDto.logo&& userInfo.userdto.organizationDto.logo!=""){
        // $rootScope.logo=userInfo.userdto.organizationDto.logo;
        $rootScope.logo="assets/images/"+$rootScope.userInfo.userdto.organizationDto.logo;

    }
    else{
      $rootScope.logo="assets/images/logo.png";
    }

    vm.logout = function(){

      $rootScope.logo="assets/images/logo.png";

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
      $cookies.putObject("outstate", cookieDate);
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 10);//设置cookie保存10天
      $cookies.putObject("outstate", cookieDate, {'expires': expireDate});


      //如果http header里面有auth信息的话好像是每次都验证的
      $http.defaults.headers.common['token'] = null;

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
