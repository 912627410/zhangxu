/**
 * Created by mengwei on 17-12-8.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalOrgMngController', rentalOrgMngController);

  /** @ngInject */
  function rentalOrgMngController($rootScope,$scope, $uibModal, languages,RENTAL_ORG_TREE_JSON_DATA_URL, Notification, serviceResource,$window ,QUERY_PARENTORG_URL,RENTAL_ORG_ID_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.animationsEnabled = true;
    vm.selectedOrg;
    vm.selectedParentOrg;
    vm.isShow = false;
    vm.showOrgTree = false;

    vm.searchText = '';     //搜索的数据
    var rootParent = {id: 0}; //默认根节点为0



    //初始化组织树
    if ($rootScope.orgChart && $rootScope.orgChart.length > 0) {
      vm.my_data = [$rootScope.orgChart[0]];
    } else {
      Notification.error(languages.findKey('failedToGetOrganizationInformation'));
    }

    //选中组织事件
    vm.my_tree_handler = function (branch) {
      //查询组织信息
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

    //通过后台返回的结构生成json tree
    vm.unflatten=function( array, parent, tree ){
      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : { id: 0 };
      var children = _.filter( array, function(child) {
        return child.parentId == parent.id;
      });

      if( !_.isEmpty( children )  ){
        if( parent.id == 0){
          tree = children;

        }else{
          parent['children'] = children
        }
        _.each( children, function( child ){ vm.unflatten( array, child,null ) } );
      }
      //alert("tree="+tree);
      return tree;
    };

    //生成局部组织树
    vm.loadLocalOrgTree = function () {
      if(vm.operatorInfo){
        var rspData = serviceResource.restCallService(RENTAL_ORG_TREE_JSON_DATA_URL,"QUERY");
        rspData.then(function (data) {
          var orgParent = rootParent;
          if(vm.operatorInfo.userdto.organizationDto!=null){
            orgParent.id=vm.operatorInfo.userdto.organizationDto.id;
            rootParent.id=orgParent.id;
          }
          var list=data;
          for(var i=0;i<list.length;i++){
            if(list[i].id==rootParent.id){
              list[i].parentId=0;
              break;
            }
          }
          $rootScope.orgChart = vm.unflatten(list);
          $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);

          vm.orgShow();
        },function (reason) {
          Notification.error(languages.findKey('failedToGetOrganizationInformation'));
        })
      }
    }


    vm.openOrgTree = function(){
      vm.showOrgTree = !vm.showOrgTree;
    }


    vm.user_tree_handler = function(eventName,branch) {
      $scope.$emit(eventName,branch);
    };

    vm.orgShow = function () {
      if ($scope.orgChart && $scope.orgChart.length > 0){
        vm.my_data=[$scope.orgChart[0]];
      }
      else{
        Notification.error(languages.findKey('failedToGetOrganizationInformation'));
      }
    };
    vm.orgShow();


    vm.animationsEnabled = true;
    vm.toggleAnimation = function () {
      vm.animationsEnabled = !vm.animationsEnabled;
    };


    /**
     *
     * @param size
       */
    vm.addOrg = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/RentalSystemMng/OrgMng/rentalNewOrg.html',
        controller: 'rentalNewOrgController as rentalNewOrgCtrl',
        size: size,
        backdrop: false,
        resolve: {
          selectedOrg: function () {
            return vm.selectedOrg;

          }
        }
      });

      modalInstance.result.then(function (newOrg) {
        vm.loadLocalOrgTree();
      }, function () {
        //取消
      });
    };

    //update org
    vm.updateOrg = function (size) {
      if(null == vm.selectedOrg) {
        Notification.warning(languages.findKey('selectAnOrganizationToUpdate'));
        return;
      }
      if(vm.selectedOrg.parentId=="0"){
        Notification.error(languages.findKey('theRootOrganizationCannotBeUpdate'));
      }else{
        var url = RENTAL_ORG_ID_URL+"?id=" + vm.selectedOrg.parentId;
        var orgPromise = serviceResource.restCallService(url,"GET");
        orgPromise.then(function (data) {
          var parentOrg = data.content;
          var modalInstance = $uibModal.open({
            animation:vm.animationsEnabled,
            templateUrl:'app/components/rentalPlatform/RentalSystemMng/OrgMng/rentalUpdateOrg.html',
            controller: 'rentalUpdateOrgController as rentalUpdateOrgCtrl',
            size: size,
            backdrop: false,
            resolve: {
              selectedOrg: function () {
                return vm.selectedOrg;
              }
            }
          });

          modalInstance.result.then(function () {
            vm.loadLocalOrgTree();
            //when close
          }, function () {
            //取消
          });
        },function (reason) {

        });
      }
    };

  }
})();
