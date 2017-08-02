/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineHistoryDataController', machineHistoryDataController);

  /** @ngInject */
  function machineHistoryDataController($scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, serviceResource) {
    var vm =this;
    vm.current = "A";
    //自适应高度
    var windowHeight = $window.innerHeight; //获取窗口高度
    function adjustWindow(windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 7;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
    }
    /**
     * 监听窗口大小改变后重新自适应高度
     */
    $scope.$watch('height', function(old, newv){
      adjustWindow(newv);
    })

  }
})();
