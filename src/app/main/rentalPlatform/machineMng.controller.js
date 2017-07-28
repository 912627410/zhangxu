/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMachineMngController', rentalMachineMngController);

  /** @ngInject */
  function rentalMachineMngController($scope, $window, $location, $anchorScroll, serviceResource) {
    var vm = this;
    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    vm.anchorList = ["currentLocation", "currentState", "alarmInfo"];
    //自适应高度
    var windowHeight = $window.innerHeight; //获取窗口高度
    var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 5;//50 topBar的高,15间距,90msgBox高,15间距,5 预留
    //baseBox自适应高度
    vm.baseBoxContainer = {
      "min-height": baseBoxContainerHeight + "px"
    }
    var baseBoxMapContainerHeight = baseBoxContainerHeight - 45;//地图上方的header高度
    //地图的自适应高度
    vm.baseBoxMapContainer = {
      "min-height": baseBoxMapContainerHeight + "px"
    }
    //初始化地图
    serviceResource.refreshMapWithDeviceInfo("homeMap", null, 4);
    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    };


    $scope.navs = ["currentLocation", "currentState", "alarmInfo"];

  }
})();
