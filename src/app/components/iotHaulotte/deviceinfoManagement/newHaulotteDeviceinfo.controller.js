/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newHaulotteDeviceinfoController', newHaulotteDeviceinfoController);

  /** @ngInject */
  function newHaulotteDeviceinfoController($q,$scope,$http, $uibModalInstance, SIM_UNUSED_URL,SIM_FETCH_UNUSED_URL,DEVCE_HIGHTTYPE,DEVCE_POWERTYPE,DEVCE_MF,
                                   DEIVCIE_TYPE_LIST_URL, DEIVCIE_PROTOCAL_TYPE_LIST_URL,DEVCEINFO_URL, serviceResource, Notification, operatorInfo,languages) {
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

    //默认不是通过扫码输入
    vm.deviceNumFromScanner = false;
    vm.deviceNumContentFromScanner = '';
    //用于判断设备号输入的数据是否是通过扫码输入
    //扫码格式是 ".LG4130002690.43985.C202B5"
    vm.deviceNumInputChanged = function(deviceNum){
      if (deviceNum.length == 26){
        if (deviceNum.substring(0,1) == '.' && deviceNum.substring(13,14) == '.' && deviceNum.substring(19,20) == '.'){
          vm.deviceNumFromScanner = true;
          vm.deviceNumContentFromScanner = deviceNum.substring(20);
        }
        else{
          vm.deviceNumFromScanner = false;
          vm.deviceNumContentFromScanner = '';
        }
      }
      else{
        vm.deviceNumFromScanner = false;
        vm.deviceNumContentFromScanner = '';
      }
    }


    //得到设备类型集合
    var deviceTypeData = serviceResource.restCallService(DEIVCIE_TYPE_LIST_URL, "GET");
    deviceTypeData.then(function (data) {
      vm.deviceTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getDevTypeFail'));
    })

    //得到协议类型集合
    var protocalTypeData = serviceResource.restCallService(DEIVCIE_PROTOCAL_TYPE_LIST_URL, "QUERY");
    protocalTypeData.then(function (data) {
      vm.protocalTypeList = data;
    }, function (reason) {
      Notification.error(languages.findKey('getDevTypeFail'));
    })




    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getHtFail'));
    })
    var devicePowerTypeUrl = DEVCE_POWERTYPE + "?search_EQ_status=1";
    var devicePowerTypeData = serviceResource.restCallService(devicePowerTypeUrl, "GET");
    devicePowerTypeData.then(function (data) {
      vm.devicePowerTypeList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getDriFail'));
    })
    var deviceMFUrl = DEVCE_MF + "?search_EQ_status=1";
    var deviceMFData = serviceResource.restCallService(deviceMFUrl, "GET");
    deviceMFData.then(function (data) {
      vm.deviceMFList = data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getVendorFail'));
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

    vm.ok = function (deviceinfo) {
      vm.errorMsg=null;

      //条码输入
      if (deviceinfo.deviceNum.length == 26 && vm.deviceNumFromScanner == true && vm.deviceNumContentFromScanner != null & vm.deviceNumContentFromScanner !='') {
        deviceinfo.deviceNum = vm.deviceNumContentFromScanner;
      }

      //重新构造需要传输的数据
      var operDeviceinfo={
        "deviceNum":deviceinfo.deviceNum,
        "protocalType":deviceinfo.protocalType,
        "produceDate":deviceinfo.produceDate,
        "simPhoneNumber":deviceinfo.sim.phoneNumber,
        "deviceType":deviceinfo.deviceType,
        "deviceManufacture":deviceinfo.deviceManufacture,
        "devicePowerType":deviceinfo.devicePowerType,
        "deviceHeightType":deviceinfo.deviceHeightType
      };

   //   console.log(operDeviceinfo);

      var restPromise = serviceResource.restAddRequest(DEVCEINFO_URL, operDeviceinfo);
      restPromise.then(function (data) {

        if(data.code===0){
          Notification.success(languages.findKey('newDevSucc'));
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
