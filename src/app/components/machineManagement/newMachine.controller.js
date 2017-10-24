/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newMachineController', newMachineController);

  /** @ngInject */
  function newMachineController($rootScope,$scope,machineService,$http,$timeout,AMAP_PLACESEARCH_URL, $uibModal,$uibModalInstance,languages,treeFactory, DEIVCIE_FETCH_UNUSED_URL,MACHINE_URL,ENGINE_TYPE_LIST_URL, serviceResource,rentalService, Notification, operatorInfo,machineTypeInfo) {
    var vm = this;
    vm.operatorInfo = operatorInfo;
    vm.machineTypeList = machineTypeInfo;//车辆类型

    vm.machine = {
      installTime:new Date(),
    //  buyTime:new Date()
    };


    //增加高空车相关选项 by riqian.ma 20170823

    //加载品牌信息
    var deviceManufactureListPromise = rentalService.getDeviceManufactureList();
    deviceManufactureListPromise.then(function (data) {
      vm.deviceManufactureList= data.content;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error(languages.findKey('getVendorFail'));
    })

    //加载高度信息
    var deviceHeightTypeListPromise = rentalService.getDeviceHeightTypeList();
    deviceHeightTypeListPromise.then(function (data) {
      vm.deviceHeightTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getHeFail'));
    })

    //加载车辆类型信息
    var deviceTypeListPromise = rentalService.getDeviceTypeList();
    deviceTypeListPromise.then(function (data) {
      vm.deviceTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getTypeFail'));
    })

    //加载车辆驱动信息
    var devicePowerTypeListPromise = rentalService.getDevicePowerTypeList();
    devicePowerTypeListPromise.then(function (data) {
      vm.devicePowerTypeList= data.content;
    }, function (reason) {
      Notification.error(languages.findKey('getDriFail'));
    })

    var salaryTypePromise = machineService.getSalaryTypeList();
    salaryTypePromise.then(function (data) {
      vm.salaryTypeList= data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error(languages.findKey('getLabourCostTypeFail'));
    })

    var upkeepPriceTypePromise = machineService.getUpkeepPriceTypeList();
    upkeepPriceTypePromise.then(function (data) {
      vm.upkeepPriceTypeList= data;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error(languages.findKey('getMaCostTypeFail'));
    })

    // var fuelTypePromise = machineService.getFuelTypeList();
    // fuelTypePromise.then(function (data) {
    //   vm.fuelConfigList= data.content;
    //       console.log(vm.fuelConfigList);
    // }, function (reason) {
    //   Notification.error('获取燃油类型失败');
    // })

    var machineStatePromise = machineService.getMachineStateList();
    machineStatePromise.then(function (data) {
      vm.machineStateList= data;
      console.log(vm.machineStateList);
    }, function (reason) {
      Notification.error(languages.findKey('getVeStaFail'));
    })





    // 日期控件相关
    // date picker
    vm.buyTimeOpenStatus = {
      opened: false
    };

    vm.buyTimeOpen = function ($event) {
      vm.buyTimeOpenStatus.opened = true;
    };


    //动态查询未使用的本组织的设备
    vm.refreshDeviceList = function(value) {
      vm.deviceinfoList=[];
      if(value==""){
        return;
      }

      var params = {deviceNum: value};
      return $http.get(
        DEIVCIE_FETCH_UNUSED_URL,
        {params: params}
      ).then(function(response) {
        vm.deviceinfoList = response.data

     //   alert( vm.deviceinfoList.length);
      });
    };

    //得到发动机类型集合
    var engineTypeData = serviceResource.restCallService(ENGINE_TYPE_LIST_URL, "QUERY");
    engineTypeData.then(function (data) {
      vm.engineTypeList = data;
    }, function (reason) {
      Notification.error(languages.findKey('getEnTypeFail'));
    })


    //日期控件相关
    //date picker
    vm.installTimeOpenStatus = {
      opened: false
    };

    vm.installTimeOpen = function ($event) {
      vm.installTimeOpenStatus.opened = true;
    };

    vm.buyTimeOpenStatus = {
      opened: false
    };

    vm.buyTimeOpen = function ($event) {
      vm.buyTimeOpenStatus.opened = true;
    };



    vm.ok = function (machine) {

      //alert(machine.deviceinfo.id);
      // if(vm.machine.deviceinfo.deviceNum==""){
      //  if(!confirm("设备号没有输入,请注意")){
      //    return;
      //  }
      // }

      //为了减少请求的参数,重新上设置参数
     // vm.machine.deviceinfoId=vm.machine.deviceinfo.id;
     // vm.machine.orgId=vm.machine.org.id;

    //  alert(vm.machine.deviceinfoId+"   "+vm.machine.orgId);
   //   alert(vm.machine.deviceinfo.deviceNum);

      console.log(machine.engineType);

      var postInfo=machine;
      if (machine.deviceinfo){
        //条码输入
        if (machine.deviceinfo.deviceNum.length == 26 && vm.deviceNumFromScanner == true && vm.deviceNumContentFromScanner != null & vm.deviceNumContentFromScanner !='') {
          machine.deviceinfo.deviceNum = vm.deviceNumContentFromScanner;
        }
        postInfo.deviceinfo={deviceNum:machine.deviceinfo.deviceNum};
      }
      else{
        postInfo.deviceinfo=null;
      }
      postInfo.org={id:machine.org.id};
     // postInfo.engineType={id:machine.engineType};
     // postInfo.fuelConfig={id:machine.fuelConfig};


     var restPromise = serviceResource.restAddRequest(MACHINE_URL, postInfo);
      restPromise.then(function (data) {
        if(data.code===0){
          if (data.content.autoSendSMSResult){
            Notification.warning("新建车辆信息成功!<br>自动发送激活短信: "+ data.content.autoSendSMSResult);
          }else {
            Notification.warning("新建车辆信息成功!");
          }
          $uibModalInstance.close(data.content);
        }else{
          vm.machine = machine;
          Notification.error(data.message);
        }
      }, function (reason) {
       // alert(reason.data.message);
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
      }

      );
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
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


    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.machine.org =selectedItem;
      });
    }

    //load map
    vm.refreshMap= function (mapId,zoomsize,centeraddr) {
      $LAB.script(AMAP_PLACESEARCH_URL).wait(function () {
        //初始化地图对象
        if (!AMap) {
          location.reload(false);
        }
        var amapScale, toolBar,overView;
        var localZoomSize = 1;  //默认缩放级别
        if (zoomsize){
          localZoomSize = zoomsize;
        }
        var localCenterAddr = [118.439,34.995];//设置中心点大概在临工附近
        if (centeraddr){
          localCenterAddr = centeraddr;
        }
        var map = new AMap.Map(mapId, {
          resizeEnable: true,
          center: localCenterAddr,
          zooms: [4, 18],
          scrollWheel:false, // 是否可通过鼠标滚轮缩放浏览
          keyboardEnable: false
        });
        map.setZoom(localZoomSize);
        //加载比例尺插件
        map.plugin(["AMap.Scale"], function () {
          amapScale = new AMap.Scale();
          map.addControl(amapScale);
        });
        //在地图中添加ToolBar插件
        map.plugin(["AMap.ToolBar"], function () {
          toolBar = new AMap.ToolBar();
          map.addControl(toolBar);
        });
        //在地图中添加鹰眼插件
        map.plugin(["AMap.OverView"], function () {
          //加载鹰眼
          overView = new AMap.OverView({
            visible: true //初始化隐藏鹰眼
          });
          map.addControl(overView);
        });
      });
    };

    $timeout(function(){
      vm.refreshMap("machineMap",1,null);
    },50);


    vm.showAddress = function (currentAddress) {
      var map = new AMap.Map("machineMap", {
        zooms: [4, 8],
      });
      map.plugin(["AMap.Geocoder"], function () {
          var geocoder = new AMap.Geocoder({
            resizeEnable: true,
            city:"",
            radius: 500 //范围，默认：500
          });
          //地理编码,返回地理编码结果
            geocoder.getLocation(currentAddress, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
              geocoder_CallBack(result);
            }
          });
        })

        function addMarker(i, d) {
          var marker = new AMap.Marker({
            map: map,
            position: [ d.location.getLng(),  d.location.getLat()]
          });
          var infoWindow = new AMap.InfoWindow({
            content: d.formattedAddress,
            offset: {x: 0, y: -30}
          });
          marker.on("mouseover", function(e) {
            infoWindow.open(map, marker.getPosition());
          });
        }
        //地理编码返回结果展示
        function geocoder_CallBack(data) {
          var resultStr = "";
          //地理编码结果数组
          var geocode = data.geocodes;
          for (var i = 0; i < geocode.length; i++) {
            addMarker(i, geocode[i]);
          }
          map.setFitView();
        }
    }


  }
})();
