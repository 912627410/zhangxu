(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('treeController', treeController);

  function treeController($rootScope, $scope, $timeout, $confirm, $filter, $uibModalInstance, languages, serviceResource) {
    var vm = this;
    vm.showOrgTree = true;    //默认显示树
    vm.selectedOrg;         //选中的组织

    //响应的选中事件
    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
    });

    //关闭选择org的页面
    vm.cancel = function () {
      vm.select_branch();
      $uibModalInstance.dismiss('cancel');
    };

    //确定
    vm.confirm = function () {

      //关闭modal
      $uibModalInstance.close(vm.selectedOrg);
      //取消选中
      vm.select_branch();
    }


  }

})();
