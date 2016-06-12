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
        //根据搜索到的节点，构建不带字节点的节点
        vm.createTreeNode={
          id:orgTree.id,
          label: orgTree.label,
          lastUpdateTime: orgTree.lastUpdateTime,
          name: orgTree.name,
          orgAddress: orgTree.orgAddress,
          orgCompanyId: orgTree.orgCompanyId,
          orgContent: orgTree.orgContent,
          orgCreateTime: orgTree.orgCreateTime,
          orgFax: orgTree.orgFax,
          orgFullName: orgTree.orgFullName,
          orgLgCode: orgTree.orgLgCode,
          orgMailCode: orgTree.orgMailCode,
          orgSimpleName: orgTree.orgSimpleName,
          orgTellPhone: orgTree.orgTellPhone,
          orgUpdateTime: orgTree.orgUpdateTime,
          org_legalRepresentative: orgTree.org_legalRepresentative,
          parentId: orgTree.parentId,
          sccChannelId: orgTree.sccChannelId
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


