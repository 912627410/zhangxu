/**
 * Created by xiaopeng on 17-2-9.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('orgMngController', orgMngController);

  /** @ngInject */
  function orgMngController($rootScope,$scope, $uibModal, ORG_TREE_JSON_DATA_URL, Notification, serviceResource,$window , DEFAULT_SIZE_PER_PAGE,QUERY_PARENTORG_URL) {
    var vm = this;
    vm.animationsEnabled = true;
    vm.selectedOrg;
    vm.selectedParentOrg;
    vm.isShow = false;

    vm.searchText = '';     //搜索的数据
    var rootParent = {id: 0}; //默认根节点为0
    var userInfo =$rootScope.userInfo;


    //通过后台返回的结构生成json tree
    vm.unflatten = function (array, parent, tree) {
      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : {id: 0};

      var children = _.filter(array, function (child) {
        return child.parentId == parent.id;
      });

      // alert("parent.id=="+parent.id);

      if (!_.isEmpty(children)) {
        //alert("1.children.tree=="+JSON.stringify(children));
        //alert("2.parent.id =="+parent.id );
        //判断是否是根节点
        // if( parent.id == rootParent.id ){
        if (parent.id == 0) {
          //alert("3.rootParent.id =="+rootParent.id );
          //alert("4.rootParent.tree=="+JSON.stringify(children));
          tree = children;

        } else {
          parent['children'] = children
          // alert("5. tree=="+JSON.stringify(children));
        }
        _.each(children, function (child) {
          vm.unflatten(array, child, null)
        });
      }


      //alert("tree="+tree);
      return tree;
    };
    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = [$rootScope.orgChart[0]];
    } else {
      Notification.error('获取组织机构信息失败');
    }

    //选中组织事件
    vm.my_tree_handler = function (branch) {


      $scope.$emit("OrgSelectedEvent", branch);
      vm.selectedOrg = branch;
      var restCallURL = QUERY_PARENTORG_URL;
      restCallURL += "?parentId=" + vm.selectedOrg.parentId;
      var orgDataPromis = serviceResource.restCallService(restCallURL, "GET");
      orgDataPromis.then(function (data) {
        vm.selectedParentOrg = data.label;
      })
      if(null!=vm.selectedOrg.org_legalRepresentative&&""!=vm.selectedOrg.org_legalRepresentative){
        vm.isShow = true;
      }else{
        vm.isShow = false;
      }
    };

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

    };

    vm.reset = function (searchText) {
      vm.searchText = "";
      vm.my_data=[$rootScope.orgChart[0]];

    };

    //搜索树
    vm.returnSearch = function (orgTree, searchText) {
      if (orgTree.label.indexOf(searchText) != -1) {
        //根据搜索到的节点，构建不带字节点的节点
        vm.createTreeNode={
          id:orgTree.id,
          label: orgTree.label
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

    vm.update = function () {

      if(vm.selectedOrg){

        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/orgManagement/updateOrg.html',
          controller: 'updateOrgController as updateOrgCtrl',
          size: 'sx',
          backdrop: false,
          resolve: {
            selectedOrg: function () {
              return vm.selectedOrg;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {

          vm.getOrg();

        }, function () {
          //$log.info('Modal dismissed at: ' + new Date());
        });

      }else {

        Notification.error('请选择要修改的组织!');

      }

    };



    vm.new = function () {

      if(vm.selectedOrg){

        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/orgManagement/newOrg.html',
          controller: 'newOrgController as newOrgCtrl',
          size: 'sx',
          backdrop: false,
          resolve: {
            selectedOrg: function () {
              return vm.selectedOrg;
            }
          }
        });

        modalInstance.result.then(function (newOrg) {



          vm.selectedOrg.children.push({
              label: newOrg.label,
              id: newOrg.id
            });
          vm.selectedOrg.expanded = true;

          vm.getOrg();

        }, function () {
        });

      }else {

        Notification.error('请选择上级组织!');

      }

    };

    //读取组织结构信息
    vm.getOrg = function () {
      var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL, "QUERY");
      rspData.then(function (data) {
        //判断树形菜单的根节点,默认为0,然后根据用户的组织来进行更新
        var orgParent = rootParent;
        if (null != userInfo.userdto.organizationDto) {
          orgParent.id = userInfo.userdto.organizationDto.id;
          rootParent.id = orgParent.id;

          //userInfo.userdto.organizationDto.parentId=0;
        }

        //TODO生成树的方法,要求根的父节点必须为0才可以,临时这么写,后续需要优化
        var list = data;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id == rootParent.id) {
            //  alert("1=="+list[i].parentId);
            list[i].parentId = 0;
            // alert("2=="+list[i].parentId);
            break;
          }
        }

        // alert("orgParent.id==="+orgParent.id);
        $rootScope.orgChart = vm.unflatten(list);



        $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetOrganizationInformation'));
      });
    }
  }
})();
