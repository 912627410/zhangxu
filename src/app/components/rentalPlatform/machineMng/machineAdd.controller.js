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
    }, {
      "title": "rental.machineAdd", "alias": "添加车辆", "icon": "fa-exclamation-triangle"
    }];
    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView = function (view) {
      $rootScope.$state.go(view);
    }
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
    }
    vm.adjustWindow($window.innerHeight);

  }
})();
