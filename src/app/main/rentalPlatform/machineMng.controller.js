/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMachineMngController', rentalMachineMngController);


  /** @ngInject */

  function rentalMachineMngController($scope, $location,$anchorScroll) {
    var vm = this;
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    vm.anchorList=["currentLocation","currentState","alarmInfo","historyData","liftCycle"];
    //用户名
    vm.userName="Admin";


    vm.gotoAnchor = function(x) {
      var newHash = 'anchor' + x;
      if ($location.hash() !== newHash) {
        $location.hash('anchor' + x);
      } else {
        $anchorScroll();
      }
    };



  }
})();
