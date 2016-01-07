(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($rootScope, $window,$http,TipService) {
    var vm = this;
    //因为全局提示框需要在页面上直接访问tipService，需要在最外层controller（如果没有可以直接绑定到$rootScope)中绑定
    $rootScope.tipService = TipService;
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
      TipService.setMessage('成功退出', 'success');

    }

    //显示profile box
    vm.hideProfile = function(){
      vm.profileFormHided = !vm.profileFormHided;
    }
  }
})();
