(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $state, $stateParams,SYSTEM_VERSION, $uibModalStack, serviceResource,ORG_TREE_JSON_DATA_URL,$window,$log,Notification,Idle) {

    $rootScope.SYSTEM_VERSION = SYSTEM_VERSION;
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    //当前登录用户信息保存在session里面
    if ($window.sessionStorage["userInfo"]) {
      $rootScope.userInfo = JSON.parse($window.sessionStorage["userInfo"]);
    }
    if ($window.sessionStorage["statisticInfo"]) {
      $rootScope.statisticInfo = JSON.parse($window.sessionStorage["statisticInfo"]);
    }
    //组织结构信息
    if ($window.sessionStorage["orgChart"]) {
      $rootScope.orgChart = JSON.parse($window.sessionStorage["orgChart"]);
    }

    //提醒消息数量
    if ($window.sessionStorage["notificationNumber"]) {
      $rootScope.notificationNumber = $window.sessionStorage["notificationNumber"];
    }

    //权限列表
    if ($window.sessionStorage["permissions"]) {
      $rootScope.permissions = $window.sessionStorage["permissions"];
    }

    //判断是否登录
    if ($rootScope.userInfo){
      //监控用户登录超时
      Idle.watch();
    }

    //保存当前打开的modal,用于超时时关闭
    $rootScope.currentOpenModal = null;

    //用户在modal打开的时候按回退键时把所有打开的modal关掉
    $rootScope.$on('$stateChangeSuccess', function() {
      $uibModalStack.dismissAll();
    });

    $log.debug('runBlock end');


  }

})();
