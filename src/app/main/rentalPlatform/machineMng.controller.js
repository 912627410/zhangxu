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
    windowHeight = windowHeight - 50 - 15 - 90 - 15 - 5;//50 topBar的高,15间距,90msgBox高,15间距,5 预留
    vm.mapBox = {
      "min-height": windowHeight + "px"
    }
    //右边栏自适应
    var leftMapBoxHeight = windowHeight *(2/8);
    var leftMapBoxHeight2 = windowHeight *(5/8);
    vm.leftMapBox = {
      "min-height": leftMapBoxHeight + "px"
    }
    vm.leftMapBox2 = {
      "border": "dashed",
      "min-height": leftMapBoxHeight2 + "px"
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


    $scope.navs = ['Machine management','Fleet management','JIFEJIOWJG','FERGERFERGERG','grgehg'];

  }
})();
