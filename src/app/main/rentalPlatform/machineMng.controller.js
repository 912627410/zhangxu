/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMachineMngController', rentalMachineMngController);

  /** @ngInject */
  function rentalMachineMngController($scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, serviceResource) {
    var vm = this;
    ngTableDefaults.params.count = 20;
    ngTableDefaults.settings.counts = [];
    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    $scope.navs = [{
      "title": "currentLocation", "icon": "fa-map"
    }, {
      "title": "currentState", "icon": "fa-signal"
    }, {
      "title": "alarmInfo", "icon": "fa-exclamation-triangle"
    }];
    //自适应高度
    var windowHeight = $window.innerHeight; //获取窗口高度
    var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 7;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
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
    }

    vm.simpleList = [{
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }, {
      name1: "H05024202",
      name2: null,
      name3: 3305258695,
      name4: 3305258695,
      name5: 3305258695,
      name6: 3305258695
    }
    ]

    vm.customConfigParams = new NgTableParams({}, {dataset: vm.simpleList});
  }
})();
