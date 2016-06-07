/**
 * Created by shuangshan on 16/1/19.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('orgController', orgController);

  /** @ngInject */
  function orgController($rootScope,$scope) {
    var vm = this;
    vm.selectedOrg;
   //选中组织事件
   vm.my_tree_handler = function(branch) {
      $scope.$emit("OrgSelectedEvent",branch);
     vm.selectedOrg=branch;

   };

  //初始化组织树
  if ($rootScope.orgChart && $rootScope.orgChart.length > 0){
    vm.my_data=[$rootScope.orgChart[0]];
  } else{
    Notification.error('获取组织机构信息失败');
  }

  }
})();


