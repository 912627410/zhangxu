/**
 * Created by shuangshan on 16/1/19.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('fleetController', fleetController);

  /** @ngInject */

  function fleetController($rootScope,$scope,Notification) {
    var vm = this;
    vm.selectedFleet;
    vm.searchText = '';     //搜索的数据
    //选中组织事件
    vm.my_tree_handler = function (branch) {
      $scope.$emit("FleetSelectedEvent", branch);
      vm.selectedFleet = branch;

    };

    //初始化组织树
    if ($rootScope.fleetChart && $rootScope.fleetChart.length > 0) {
      vm.my_data = [$rootScope.fleetChart[0]];
    } else {
      Notification.error('获取组织机构信息失败');
    }

    vm.search = function (searchText) {
      //存储被搜索到的组织
      vm.searched_array = [];
      //展开所有的组织
      //vm.expand_all();
      //如果搜索为空默认生成tree
      if (vm.searchText == '' || vm.searchText == "") {
         vm.my_data=[$rootScope.fleetChart[0]];
      } else {
        vm.returnSearch($rootScope.fleetChart[0], vm.searchText);
        vm.my_data=vm.searched_array;
      }

    }

    //搜索树
    vm.returnSearch = function (orgTree, searchText) {
      if (orgTree.label.indexOf(searchText) != -1) {
        //根据搜索到的节点，构建不带字节点的节点
        vm.createTreeNode={
          id:orgTree.id,
          label: orgTree.label,
          name: orgTree.name,
          parentId: orgTree.parentId,
        }
        //添加到搜索的节点数组中
        vm.searched_array.push(vm.createTreeNode);

      }

      if (orgTree.children.length != 0) {
       //循环搜索
       angular.forEach(orgTree.children, function (node,index) {
          vm.returnSearch(node, searchText);
        });
      } else {
        vm.my_data= vm.searched_array;
      }

    };

  }
})();


