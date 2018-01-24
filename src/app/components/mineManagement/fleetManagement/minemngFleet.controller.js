/**
 * Created by luzhen on 12/26/17.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngFleetController', minemngFleetCtrl);

  /** @ngInject */
  function minemngFleetCtrl(ngTableDefaults,languages,NgTableParams,MINE_ADD_MACHINE_INFO, $uibModal,MINE_MACHINE_FLEET_TEAM, Notification, serviceResource,MINE_MACHINE_FLEET) {
    var vm = this;
    vm.animationsEnabled = true;
    vm.selectedObject = '';
    vm.selectedParentObject = '';
    vm.searchText = '';     //搜索的数据
    vm.fleet_data = [];
    vm.fleetName='';
    vm.selectedArray = [];
    vm.newBtnShow = true;
    vm.copyFleetData = [];
    ngTableDefaults.settings.counts = [];//取消ng-table的默认分页
    vm.init = function () {
      vm.getUpdateObject();
    };


    vm.getUpdateObject = function () {
      var promise = serviceResource.restCallService(MINE_MACHINE_FLEET_TEAM, "QUERY");
      promise.then(function (data) {
        vm.fleet_data = vm.unflatten(data);
        vm.copyFleetData = angular.copy(vm.fleet_data);
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
        //选中小组事件
        if(0!=data.parentId){
            var restCallURL = MINE_ADD_MACHINE_INFO;
            restCallURL += "?teamId=" + data.id;
            var restPromise = serviceResource.restCallService(restCallURL,"GET");
            restPromise.then(function (data) {

              vm.tableParams2 = new NgTableParams({}, {
                dataset: data.content
              });
            }, function (reason) {
              Notification.error(languages.findKey('getDataVeFail'));
            });

          vm.selectedParentObject = data.name;
          var restCallURL = MINE_MACHINE_FLEET;
          restCallURL += "?id=" + vm.selectedObject.parentId;
          var dataPromis = serviceResource.restCallService(restCallURL, "GET");
          dataPromis.then(function (data) {
            vm.fleetName=data.name;
          });
        }else {
          //选中车队事件
          var restCallURL = MINE_MACHINE_FLEET;
          restCallURL += "?id=" + vm.selectedObject.id;
          var dataPromis = serviceResource.restCallService(restCallURL, "GET");
          dataPromis.then(function (data) {
            vm.fleetName=data.name;
            vm.selectedParentObject =null;
            vm.tableParams2= new NgTableParams({}, {
              dataset:null
            })
          });
        }
        vm.selectedArray[data.level - 1] = data;
      });
    };

    //搜索
    vm.search = function () {
      //存储被搜索到的组织
      vm.searched_array = [];
      var index = 0;
      //如果搜索为空默认生成tree
      if (vm.searchText != null && vm.searchText != "") {
        if(!vm.fleet_data || vm.fleet_data.length <= 0) {
          vm.fleet_data = vm.copyFleetData;
        }
        vm.returnSearch(vm.fleet_data, vm.searchText);
        vm.fleet_data = vm.searched_array;
        if(vm.fleet_data == null || vm.fleet_data.length <= 0) {
          Notification.warning("暂无数据");
        }
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

    //新建车辆
    vm.addMineFleetMachine = function() {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/fleetManagement/minemngFleetMachine.html',
        controller: 'mineFleetController as mineFleetCtrl',
        size: 'sx',
        backdrop: false
      });
      modalInstance.result.then(function () {
        vm.reset();
      }, function () {
      });
    };

    //新建车队
    vm.newFleet = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/fleetManagement/minemngNewFleet.html',
        controller: 'addFleetController as addFleetCtrl',
        size: size,
        backdrop: false
      });

      modalInstance.result.then(function (result) {
        vm.getUpdateObject();
      }, function () {
        //取消
      });
    };

    //新建小组
    vm.newTeam = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/fleetManagement/minemngNewGroup.html',
        controller: 'addGroupController as addGroupCtrl',
        size: size,
        backdrop: false
      });

      modalInstance.result.then(function (result) {
        vm.getUpdateObject();
      }, function () {
        //取消
      });
    };

    //管理车队队长
    vm.newFleetCaptain = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/fleetManagement/minemngFleetCaptain.html',
        controller: 'fleetCaptainController as fleetCaptainCtrl',
        size: size,
        backdrop: false
      });
      modalInstance.result.then(function (result) {

      }, function () {
        //取消
      });
    };


    //修改车队小组
    vm.updateFleetTeam = function (size) {
      if(vm.selectedObject.parentId==null){
        Notification.warning({message:"请选择车队或小组",positionX: 'center'});
        return;
      }
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/fleetManagement/minemngUpdateFleetTeam.html',
        controller: 'updateFleetTeamController as updateFleetTeamCtrl',
        size: size,
        backdrop: false,
        resolve: {
          fleetTeam: function () {
            return vm.selectedObject;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.getUpdateObject();
      }, function () {
        //取消
      });
    };

    /**
     * 重置
     */
    vm.reset = function () {
      vm.searchText = "";
      vm.selectedObject = '';
      vm.selectedParentObject = '';
      vm.fleetName='';
      vm.tableParams2= new NgTableParams({}, {
        dataset:null
      });
      vm.init();
    };

    vm.init();

  }
})();
