/**
 * Created by xielongwang on 2017/8/17.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineAddController', machineAddController);

  /** @ngInject */
  function machineAddController($rootScope,$scope,$window) {
    var vm =this;
    //定义页面导航
    $scope.navs = [{
      "title": "rental", "alias": "当前位置", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus", "alias": "当前状态", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias": "报警信息", "icon": "fa-exclamation-triangle"
    }];
    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView = function (view) {
      $rootScope.$state.go(view);
    }

  }
})();
