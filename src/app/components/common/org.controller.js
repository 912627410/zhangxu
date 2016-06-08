/**
 * Created by shuangshan on 16/1/19.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('orgController', orgController);

  /** @ngInject */
  function orgController($rootScope, $scope) {
    var vm = this;
    vm.selectedOrg;
    vm.searchText = '';     //搜索的数据
    //选中组织事件
    vm.my_tree_handler = function (branch) {
      $scope.$emit("OrgSelectedEvent", branch);
      vm.selectedOrg = branch;

    };

    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = [$rootScope.orgChart[0]];
    } else {
      Notification.error('获取组织机构信息失败');
    }
    //TODO 搜索树

    vm.search = function (searchText) {
      //存储被搜索到的组织
      vm.searched_array = [];
      //展开所有的组织
      //vm.expand_all();
      //如果搜索为空默认生成tree
      if (vm.searchText == '' || vm.searchText == "") {
         vm.my_data=[$rootScope.orgChart[0]];
      } else {
        vm.returnSearch($rootScope.orgChart[0], vm.searchText);
        vm.my_data=vm.searched_array;
      }

    }

    //搜索树
    vm.returnSearch = function (orgTree, searchText) {
      if (orgTree.label.indexOf(searchText) != -1) {
        vm.searched_array.push(orgTree);

      }
      
      if (orgTree.children.length != 0) {
       angular.forEach(orgTree.children, function (node,index) {
          vm.returnSearch(node, searchText);
        });
      } else {
        vm.my_data= vm.searched_array;
      }

    };

  }
})();


