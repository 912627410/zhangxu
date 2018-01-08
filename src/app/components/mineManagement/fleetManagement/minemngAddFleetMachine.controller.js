/**
 * Created by 刘鲁振 on 2018/1/4.
 */
(function () {
  'use strict';
  angular.module('GPSCloud').controller('minemngAddFleetMachineController', minemngAddFleetMachineController);

  function minemngAddFleetMachineController(serviceResource,MINE_MACHINE_FLEET,GET_MINE_MACHINE_FLEET,$rootScope, $scope, $timeout, $confirm, $filter, $uibModalInstance) {
    var vm = this;
    vm.animationsEnabled = true;
    vm.selectedObject = '';
    vm.selectedParentObject = '';
    vm.searchText = '';     //搜索的数据
    vm.fleet_data = [];
    vm.fleetName='';
    vm.selectAllInfo='';
    vm.selectedArray = [];
    vm.newBtnShow = true;


    vm.init = function () {
      vm.getUpdateObject();
    };

    //确定
    vm.confirm = function () {
      //关闭modal
      $uibModalInstance.close(vm.selectAllInfo);
      //取消选中
      vm.select_branch();
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


    vm.getUpdateObject = function () {
      var promise = serviceResource.restCallService(GET_MINE_MACHINE_FLEET, "QUERY");
      promise.then(function (data) {
        vm.fleet_data = vm.unflatten(data);
      }, function (reason) {
        Notification.error("获取失败");
      })
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
      var restCallURL = MINE_MACHINE_FLEET;
      restCallURL += "?id=" + vm.selectedObject.id;
      var dataPromis = serviceResource.restCallService(restCallURL, "GET");
      dataPromis.then(function (data) {
        if(0!=data.parentId){
          vm.selectedParentObject = data.name;
          var restCallURL = MINE_MACHINE_FLEET;
          restCallURL += "?id=" + vm.selectedObject.parentId;
          var dataPromis = serviceResource.restCallService(restCallURL, "GET");
          dataPromis.then(function (data) {
            vm.fleetName=data.name;
            vm.selectAllInfo=vm.fleetName+vm.selectedParentObject;
          });
        }else {
          var restCallURL = MINE_MACHINE_FLEET;
          restCallURL += "?id=" + vm.selectedObject.id;
          var dataPromis = serviceResource.restCallService(restCallURL, "GET");
          dataPromis.then(function (data) {
            vm.fleetName=data.name;
            vm.selectedParentObject =null;
          });
        }
        vm.selectedArray[data.level - 1] = data;
      });
    };

    vm.search = function () {
      //存储被搜索到的组织
      vm.searched_array = [];
      var index = 0;
      //如果搜索为空默认生成tree
      if (vm.searchText != null && vm.searchText != "") {
        if(!vm.fleet_data || vm.fleet_data.length <= 0) {
          vm.init();
        }
        vm.returnSearch(vm.fleet_data, vm.searchText);
        vm.fleet_data = vm.searched_array;
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
        vm.fleet_data= vm.searched_array;
      }
    };


    vm.reset = function () {
      vm.searchText = "";
      vm.selectedObject = '';
      vm.selectedParentObject = '';
      vm.fleetName='';
      vm.init();
    };
    vm.init()


  }

})();
