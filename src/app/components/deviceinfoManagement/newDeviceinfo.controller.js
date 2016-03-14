/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newDeviceinfoController', newDeviceinfoController);

  /** @ngInject */
  function newDeviceinfoController($q,$scope,$http, $uibModalInstance, SIM_UNUSED_URL,SIM_FETCH_UNUSED_URL, DEIVCIE_TYPE_LIST_URL, DEIVCIE_PROTOCAL_TYPE_LIST_URL,DEVCEINFO_URL, serviceResource, Notification, operatorInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;
    vm.deviceinfo = {};

    $scope.address =[];
    //动态查询未使用的sim卡
    vm.refreshSimList = function(value) {
      vm.simList=[];
      //var reg = /^\d+$/;
      //if (!reg.test(value)) {
      //  alert(value);
      //  return ;
      //}

      if(!onlyNumber(value)){
        return;
      }
      if(value.length!=4){
        //vm.errorMsg="请输入sim卡号后4位";
        return;
      }


      var params = {phoneNumber: value};
      return $http.get(
        SIM_FETCH_UNUSED_URL,
        {params: params}
      ).then(function(response) {

        vm.simList = response.data
      //  alert( vm.simList.length);
      });
    };



    //查询sim卡的状态集合
    //var simData = serviceResource.restCallService(SIM_UNUSED_URL, "QUERY");
    //simData.then(function (data) {
    //  vm.simList = data;
    //}, function (reason) {
    //  Notification.error('获取Sim状态集合失败');
    //})


    //得到设备类型集合
    var deviceTypeData = serviceResource.restCallService(DEIVCIE_TYPE_LIST_URL, "QUERY");
    deviceTypeData.then(function (data) {
      vm.deviceTypeList = data;
    }, function (reason) {
      Notification.error('获取设备类型失败');
    })

    //得到协议类型集合
    var protocalTypeData = serviceResource.restCallService(DEIVCIE_PROTOCAL_TYPE_LIST_URL, "QUERY");
    protocalTypeData.then(function (data) {
      vm.protocalTypeList = data;
    }, function (reason) {
      Notification.error('获取设备类型失败');
    })

    //日期控件相关
    //date picker
    vm.produceDateOpenStatus = {
      opened: false
    };

    vm.produceDateOpen = function ($event) {
      vm.produceDateOpenStatus.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    vm.deviceinfo.produceDate=new Date();

    vm.ok = function (deiceinfo) {
      vm.errorMsg=null;

      //重新构造需要传输的数据
      var operDeviceinfo={
        "deviceNum":deiceinfo.deviceNum,
        "protocalType":deiceinfo.protocalType,
        "produceDate":deiceinfo.produceDate,
        "simPhoneNumber":deiceinfo.sim.phoneNumber
      };

   //   console.log(operDeviceinfo);

      var restPromise = serviceResource.restAddRequest(DEVCEINFO_URL, operDeviceinfo);
      restPromise.then(function (data) {

        if(data.code===0){
          Notification.success("新建设备信息成功!");
          $uibModalInstance.close(data.content);
        }else{
      //    vm.machine = machine;
          Notification.error(data.message);
        }

      }, function (reason) {
     //   Notification.error("新建设备信息出错!");
        vm.errorMsg=reason.data.message;
        Notification.error(reason.data.message);
      });
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };



    //

     vm.loadingItem = {type: 'loading'},
       vm.hasNextChunk = true,
       vm.queryString = '';

     vm.getInfinityScrollChunk=function(value) {
       alert(1);
      var params = {phoneNumber: value};
      return $http.get(
        SIM_FETCH_UNUSED_URL,
        {params: params}
      )
    }

     vm.addLoadingStateItem=function() {
       alert(2);
      vm.collections.push(vm.loadingItem);
    }

     vm.removeLoadingStateItem=function() {
       alert(3);
      var index = $scope.collections.indexOf(vm.loadingItem);
      if (index < 0) {
        return;
      }

      vm.collections.splice(index, 1);
    }


    vm.isItemMatch = function($select) {
      //implement your match function here by $select.search

      alert(4);
    };

    vm.requestMoreItems = function() {
      alert(111);
      if (vm.isRequestMoreItems || !vm.hasNextChunk) {
        return $q.reject();
      }

      addLoadingStateItem();

      vm.isRequestMoreItems = true;
      return vm.getInfinityScrollChunk(nextChunkId)
        .then(function(newItems) {
          nextChunkId = newItems.nextId;
          vm.simList = vm.simList.concat($scope.newItems.items);
          return newItems;
        }, function(err) {
          return $q.reject(err);
        })
        .finally(function() {
          vm.removeLoadingStateItem();
          vm.isRequestMoreItems = false;
        });
    };

    vm.refreshList = function() {
      vm.queryString =  SIM_FETCH_UNUSED_URL;
    };
  }
})();
