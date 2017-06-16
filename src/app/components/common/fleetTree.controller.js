(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('fleetTreeController', fleetTreeController);

  function fleetTreeController($rootScope, $scope, $timeout, $confirm, $filter, $uibModalInstance, languages, serviceResource) {
    var vm = this;
    vm.showOrgTree = true;    //默认显示树
    vm.selectedFleet;         //选中的组织

    //响应的选中事件
    $scope.$on('FleetSelectedEvent', function (event, data) {
      vm.selectedFleet = data;
    });

    //关闭选择org的页面
    vm.cancel = function () {
      vm.select_branch();
      $uibModalInstance.dismiss('cancel');
    };

    //确定
    vm.confirm = function () {

      //关闭modal
      $uibModalInstance.close(vm.selectedFleet);
      //取消选中
      vm.select_branch();
    }


  }

})();
