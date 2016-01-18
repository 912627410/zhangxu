(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($rootScope, $window,$http,Notification) {
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
      $rootScope.$state.go('home.login');
      Notification.success('成功退出');

    }

    //显示profile box
    vm.hideProfile = function(){
      vm.profileFormHided = !vm.profileFormHided;
    }
  }
})();
