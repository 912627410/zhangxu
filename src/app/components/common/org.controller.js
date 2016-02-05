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

    vm.showOrgTree = false;

    vm.openOrgTree = function(){
      vm.showOrgTree = !vm.showOrgTree;
    }

    vm.my_tree_handler = function(branch) {
      $scope.$emit("OrgSelectedEvent",branch);
    };
    vm.my_data=[$rootScope.orgChart[0]];
    //vm.my_data[0].label = '组织架构';
    //示例代码
    //vm.my_data = [{
    //  label: "11111",
    //  children: [
    //    {
    //      label: "222222",
    //      leaf: true
    //    }
    //  ]
    //}];

  }
})();


