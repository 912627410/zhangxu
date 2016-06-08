(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('treeController', treeController);

  function treeController($rootScope, $scope, $timeout, $confirm, $filter, $uibModalInstance, languages, serviceResource, org) {
    var vm = this;
    vm.showOrgTree = true;    //默认显示树
    vm.org = {label: ""};    //调拨组织
    vm.selectedOrg;         //选中的组织

    //响应的选中事件
    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.org = vm.selectedOrg;
    });

    //关闭选择org的页面
    vm.cancel = function () {
      vm.select_branch();
      $uibModalInstance.dismiss('cancel');
    };

    //确定
    vm.confirm = function () {
      $rootScope.$emit("orgSelected", vm.org);
      //取消选中
      vm.select_branch();
      //关闭modal
      $uibModalInstance.dismiss('cancel');
    }

  }

})();
