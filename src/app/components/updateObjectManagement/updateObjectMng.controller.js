/**
 * Created by yalong on 17-11-28.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateObjectMngController', updateObjectMngController);

  /** @ngInject */
  function updateObjectMngController($rootScope, $http, $uibModal, UPDATE_OBJECT_TREE_JSON_URL, Notification, serviceResource, UPDATE_OBJECT_URL) {
    var vm = this;
    vm.animationsEnabled = true;
    vm.selectedObject = '';
    vm.selectedParentObject = '';
    vm.searchText = '';     //搜索的数据
    vm.my_data = [];
    vm.selectedArray = [];


    vm.init = function () {
      vm.getUpdateObject();
    };


    vm.getUpdateObject = function () {
      var promise = serviceResource.restCallService(UPDATE_OBJECT_TREE_JSON_URL, "QUERY");
      promise.then(function (data) {
        vm.my_data = vm.unflatten(data);
      }, function (reason) {
        Notification.error("获取失败");
      })
    };

    vm.getUpdateMethod = function () {
      $http.get("upgradeMethod.json").success(function(data){
        vm.upgradeMethodList = JSON.parse(JSON.stringify(data));
      });
    };

    //通过后台返回的结构生成json tree
    vm.unflatten = function (array, parent, tree) {
      var tree = [], mappedArr = {}, arrElem, mappedElem;
      for (var i = 0, len = array.length;i < len;i++) {
        arrElem = array[i];
        mappedArr[arrElem.id] = arrElem;
        mappedArr[arrElem.id]['children'] = [];
      }

      for (var id in mappedArr) {
        if(mappedArr.hasOwnProperty(id)) {
          mappedElem = mappedArr[id];
          if(mappedElem.parentId != null && mappedArr.hasOwnProperty(mappedElem.parentId)) {
            mappedArr[mappedElem['parentId']]['children'].push(mappedElem);
          }
          else {
            tree.push(mappedElem);
          }
        }
      }
      return tree;
    };


    //选中组织事件
    vm.my_tree_handler = function (branch) {
      vm.selectedObject = branch;
      var restCallURL = UPDATE_OBJECT_URL;
      restCallURL += "?id=" + vm.selectedObject.parentId;
      var dataPromis = serviceResource.restCallService(restCallURL, "GET");
      dataPromis.then(function (data) {
        vm.selectedParentObject = data;
        vm.selectedArray[data.level - 1] = data;
      });
    };

    vm.search = function () {
      //存储被搜索到的组织
      vm.searched_array = [];
      var index = 0;
      //如果搜索为空默认生成tree
      if (vm.searchText != null && vm.searchText != "") {
        if(!vm.my_data || vm.my_data.length <= 0) {
          vm.init();
        }
        vm.returnSearch(vm.my_data, vm.searchText);
        vm.my_data = vm.searched_array;
      }
    };

    //搜索树
    vm.returnSearch = function (objectTree, searchText) {
      var len = objectTree.length;
      if(len > 0) {
        angular.forEach(objectTree, function (node, index) {
          vm.processSearch(node, searchText);
        })
      } else {
        vm.processSearch(objectTree, searchText);
      }
    };

    vm.processSearch = function(objectTree, searchText) {
      if (objectTree.label.indexOf(searchText) != -1) {
        //根据搜索到的节点，构建不带字节点的节点
        vm.createTreeNode = {
          id: objectTree.id,
          label: objectTree.label,
          parentId: objectTree.parentId
        };
        //添加到搜索的节点数组中
        vm.searched_array.push(vm.createTreeNode);
      }

      if (objectTree.children.length != 0) {
        //循环搜索
        angular.forEach(objectTree.children, function (node,index) {
          vm.returnSearch(node, searchText);
        });
      } else {
        vm.my_data= vm.searched_array;
      }
    };

    vm.new = function() {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/updateObjectManagement/newUpdateObject.html',
        controller: 'newUpdateObjectController as newUpdateObjectCtrl',
        size: 'sx',
        backdrop: false,
        resolve: {
          selectedObject: function () {
            return vm.selectedObject;
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
    };

    vm.update = function () {
      if(vm.selectedObject == null || vm.selectedObject == "" || vm.selectedObject.id == null) {
        Notification.warning("请选择需要修改的信息");
        return;
      }

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/updateObjectManagement/modifyUpdateObject.html',
        controller: 'modifyUpdateObjectController as modifyUpdateObjectOrgCtrl',
        size: 'sx',
        backdrop: false,
        resolve: {
          selectedObject: function () {
            return vm.selectedObject;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {

        vm.getOrg();

      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });

    };


    vm.reset = function () {
      vm.searchText = "";
      vm.init();
    };



    vm.init();


  }
})();
