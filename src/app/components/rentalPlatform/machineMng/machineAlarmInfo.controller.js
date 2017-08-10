/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineAlarmInfoController', machineAlarmInfoController);

  /** @ngInject */
  function machineAlarmInfoController($rootScope,$scope, $window, $location, $anchorScroll, serviceResource) {
    var vm=this;
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 7;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);
    //定义页面导航
    $scope.navs = [{
      "title": "rental","alias":"当前位置", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus", "alias":"当前状态", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias":"报警信息", "icon": "fa-exclamation-triangle"
    }];

    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView=function (view) {
      $rootScope.$state.go(view);
    }
  }
})();
