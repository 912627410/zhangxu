(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $state, $stateParams, serviceResource,ORG_TREE_JSON_DATA_URL,$window,$log,Notification,Idle) {


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

    //判断是否登录
    if ($rootScope.userInfo){
      //监控用户登录超时
      Idle.watch();
    }

    //保存当前打开的modal,用于超时时关闭
    $rootScope.currentOpenModal = null;

    $log.debug('runBlock end');

  }

})();
