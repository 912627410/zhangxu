(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('deviceinfoMngController', deviceinfoMngController);

  /** @ngInject */
  function deviceinfoMngController($rootScope, $scope, $uibModal, Notification, serviceResource, DEVCE_PAGED_QUERY,DEFAULT_SIZE_PER_PAGE,DEIVCIE_MOVE_ORG_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.radioListType = "list";
    vm.deviceinfo = {};

    //查询条件相关
    vm.showOrgTree = false;
    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })


    //调拨组织
    vm.org={label:""};
    vm.showMoveOrgTree = false;
    vm.openMoveOrgTree = function () {
      vm.showMoveOrgTree = !vm.showMoveOrgTree;
    }

    $scope.$on('showMoveOrgEvent', function (event, data) {
      vm.selectedMoveOrg = data;
      vm.deviceinfo.moverg = vm.selectedMoveOrg;
      vm.showMoveOrgTree = false;
    })


    vm.query = function (page, size, sort, deviceinfo) {
      var restCallURL = DEVCE_PAGED_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != deviceinfo) {
        // alert(deviceinfo.phoneNumber);
        //alert(deviceinfo.org.id);
        //alert(deviceinfo.deviceNum);
        if (null != deviceinfo.org) {
          restCallURL += "&search_EQ_organization.id=" + deviceinfo.org.id;
        }
        if (null != deviceinfo.deviceNum) {
          restCallURL += "&search_LIKE_deviceNum=" + deviceinfo.deviceNum;
        }
        if (null != deviceinfo.phoneNumber) {
          restCallURL += "&search_LIKE_sim.phoneNumber=" + deviceinfo.phoneNumber;
        }

      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.deviceinfoList = data.content;

        //  alert(vm.deviceinfoList[0].id);
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.deviceinfoList = {};
        Notification.error("获取SIM数据失败");
      });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN") {
      vm.query(null, null, null, null);
    }

    //重置查询框
    vm.reset = function () {
      vm.deviceinfo.org = null;
      vm.deviceinfo.deviceNum = null;
      vm.deviceinfo.phoneNumber = null;
    }





    vm.newDeviceinfo = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/newDeviceinfo.html',
        controller: 'newDeviceinfoController as newDeviceinfoController',
        size: size,
        backdrop: false,
        scope: $scope,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        //刷新
        vm.query();
      }, function () {
        //取消
      });
    };


    vm.updateDeviceinfo = function (deviceinfo, size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/updateDeviceinfo.html',
        controller: 'updateDeviceinfoController as updateDeviceinfoController',
        size: size,
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return deviceinfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
        vm.query();
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

    //批量导入
    vm.uploadDeviceinfo = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/uploadDeviceinfo.html',
        controller: 'uploadDeviceinfoController as uploadDeviceinfoController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        //正常返回
      }, function () {
        //取消
      });
    };



    //批量设置为已处理
    vm.batchMoveOrg = function(){

      if(vm.selected.length==0){
        alert("请选择要调拨的设备");
        return;
      }


      if(vm.org.label==""){
        alert("请选择要调拨的组织");
        return;
      }

      //alert(vm.org.id+" "+vm.org.label);

      var moveOrg={ids:vm.selected,"orgId":vm.org.id};
     // alert(moveOrg.ids+"  "+moveOrg.orgId);


      var restPromise = serviceResource.restUpdateRequest(DEIVCIE_MOVE_ORG_URL, moveOrg);
      restPromise.then(function (data) {
        Notification.success("调拨设备成功!");
        vm.query(null, null, null, null);
      }, function (reason) {
        Notification.error("调拨设备出错!");
      });


      //if (deviceinfoList){
      //  deviceinfoList.forEach(function(deviceinfo){
      //    //9表示初始状态
      //    if (deviceinfo.checked && deviceinfo.status == 9){
      //      ids.push(deviceinfo.id);
      //    }
      //  });
      //  //$timeout(function(){
      //  //  vm.queryNotificationStatistics();
      //  //  Notification.success("批量设置为已处理成功!");
      //  //})
      //}


    };


    vm.selected = [];

    var updateSelected = function(action,id){
      if(action == 'add' && vm.selected.indexOf(id) == -1){
        vm.selected.push(id);
      }
      if(action == 'remove' && vm.selected.indexOf(id)!=-1){
        var idx = vm.selected.indexOf(id);
        vm.selected.splice(idx,1);

      }
    }

    vm.updateSelection = function($event, id,status){

      var checkbox = $event.target;
      var action = (checkbox.checked?'add':'remove');
      updateSelected(action,id);
    }

    vm.selectAll=false;
    vm.updateAllSelection = function($event){
      var checkbox = $event.target;
      var action = (checkbox.checked?'add':'remove');
      vm.deviceinfoList.forEach(function(deviceinfo){
        updateSelected(action,deviceinfo.id);
      })

    }

    vm.isSelected = function(id){
      return vm.selected.indexOf(id)>=0;
    }



    vm.checkAll = function(){
      var operStatus=false;
      if(vm.selectAll) {
        operStatus=false;
        vm.selectAll=false;
      }else{
        operStatus=true;
        vm.selectAll=true;
      }

      vm.deviceinfoList.forEach(function(deviceinfo){
        deviceinfo.checked=operStatus;
      })
    }

  }
})();
