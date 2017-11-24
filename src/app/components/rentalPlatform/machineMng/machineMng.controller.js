/**
 * @author xielongwang
 * @date 2017/8/17.
 * @description 车辆管理controller
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMngControllerRental', machineMngControllerRental);

  /** @ngInject */
  function machineMngControllerRental($scope,$rootScope,$uibModalInstance,machine,serviceResource,languages,machineService,rentalService, AMAP_PLACESEARCH_URL,USER_MACHINE_TYPE_URL,ENGINE_TYPE_LIST_URL,RENTAL_MACHINE_NEW,MACHINE_DEVICETYPE_URL,DEVCE_HIGHTTYPE) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //定义machine对象
    vm.machine=machine;
    //围栏默认半径
    vm.machine.radius=1000;

    /**
     * 关闭模态框
     */
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    /**
     * 更新车辆
     */
    vm.updateMachine=function () {
      var machinePromis = serviceResource.restCallService(RENTAL_MACHINE_NEW, "UPDATE", vm.machine);
      machinePromis.then(function (data) {
        console.log(data)
        $uibModalInstance.close(data.content);

      }, function (reason) {
        Notification.error(languages.findKey('rentalGetDataError'));
      })
    };

    //全局的圆对象
    var circle=null;

    /**
     * 得到机器类型集合
     */
    vm.getDeviceType = function () {
      var engineTypeData = serviceResource.restCallService(MACHINE_DEVICETYPE_URL, "GET");
      engineTypeData.then(function (data) {
        vm.machineTypeList = data.content;

        angular.forEach(vm.machineTypeList ,function (data,index,array) {
          vm.machineTypeList[index].name=languages.findKey(data.name);
        })

      }, function (reason) {
        Notification.error(languages.findKey('rentalGetDataError'));
      })
    };

    /**
     * 得到发动机类型集合
     */
    vm.getMachinePowerType=function () {
      var engineTypeData = serviceResource.restCallService(ENGINE_TYPE_LIST_URL, "QUERY");
      engineTypeData.then(function (data) {
        vm.engineTypeList = data;
      }, function (reason) {
        Notification.error(languages.findKey('getEnTypeFail'));
      })
    };

    /**
     * 获取车辆状态集合
     */
    vm.getMachineStatus=function () {
      var machineStatePromise = machineService.getMachineStateList();
      machineStatePromise.then(function (data) {
        vm.machineStateList = data;
      }, function (reason) {
        Notification.error(languages.findKey('getVeStaFail'));
      })
    };

    // 车辆品牌
    vm.getDeviceManufacture=function () {
      var deviceManufacturePromise=rentalService.getDeviceManufactureList();
      deviceManufacturePromise.then(function (data) {
        vm.machineManufacture = data.content;
      }, function (reason) {
        Notification.error(languages.findKey('rentalGetDataError'));
      })
    }

    /**
     * 车辆高度类型
     */
   vm.getHeightType=function () {
     var machineHeightType = serviceResource.restCallService(DEVCE_HIGHTTYPE, "GET");
     machineHeightType.then(function (data) {
       vm.machineHeightType = data.content;
     }, function (reason) {
       Notification.error(languages.findKey('getVeHeiFail'));
     })
   }
    //加载车辆驱动信息
    var devicePowerTypeListPromise = rentalService.getDevicePowerTypeList();
    devicePowerTypeListPromise.then(function (data) {
      vm.devicePowerTypeList= data.content;
    }, function (reason) {
      Notification.error('获取驱动类型失败');
    })

    // 日期控件相关
    // date picker
    vm.buyTimeOpenStatus = {
      opened: false
    };

    vm.buyTimeOpen = function ($event) {
      vm.buyTimeOpenStatus.opened = true;
    };



    vm.getDeviceType();
    vm.getMachineStatus();
    vm.getMachinePowerType();
    vm.getHeightType();
    vm.getDeviceManufacture();

    /**
     * 在地图上画圆
     *
     * @param position
     * @returns {*}
     */
    var createCircle = function (position,radius) {
      return new AMap.Circle({
        center: position,// 圆心位置
        radius: radius, //半径
        strokeColor: "#F33", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线粗细度
        fillColor: "#ee2200", //填充颜色
        fillOpacity: 0.35 //填充透明度
      });
    };

    /**
     * 初始化地图
     *
     * @param zoomsize
     */
    vm.initMap = function (zoomsize) {
      $LAB.setGlobalDefaults({AllowDuplicates: true, CacheBust: true});
      $LAB.script({src: AMAP_PLACESEARCH_URL, type: "text/javascript"}).wait(function () {
        //初始化地图对象
        if (!AMap) {
          location.reload(false);
        }
        //插件定义
        var amapScale, toolBar, overView, geocoder,circleEditor;

        var localCenterAddr = [103.39,36.9];//设置中心点大概在兰州附近

        if (zoomsize ==null || zoomsize==undefined){
          zoomsize = 4;
        }
        //初始化地图对象
        var map = new AMap.Map("newMachineMap", {
          resizeEnable: true,
          scrollWheel: true,
          center: localCenterAddr,
          zooms: [3, 18],
          zoom:zoomsize
        });

        map.setLang($rootScope.langkey);

        //加载比例尺插件
        map.plugin(["AMap.Scale"], function () {
          amapScale = new AMap.Scale();
          map.addControl(amapScale);
        });

        //添加地图类型切换插件
        map.plugin(["AMap.MapType"], function () {
          var mapType = new AMap.MapType({
            defaultType: 0,//默认显示卫星图
            showRoad: false //叠加路网图层
          });
          map.addControl(mapType);
        });

        //在地图中添加ToolBar插件
        map.plugin(["AMap.ToolBar"], function () {
          toolBar = new AMap.ToolBar();
          map.addControl(toolBar);
        });

        //在地图中添加鹰眼插件
        map.plugin(["AMap.OverView"], function () {
          overView = new AMap.OverView({
            visible: true //初始化隐藏鹰眼
          });
          map.addControl(overView);
        });

        //在地图中添加坐标-地址插件
        map.plugin(["AMap.Geocoder"], function () {
          geocoder = new AMap.Geocoder({
            visible: true //初始化隐藏鹰眼
          });
          map.addControl(geocoder);
        });

        //在地图中画圆的插件
        map.plugin(["AMap.CircleEditor"], function () {
          circleEditor = new AMap.CircleEditor({
            visible: true //初始化隐藏鹰眼
          });
          map.addControl(circleEditor);
        });


        //构造地点查询类
        map.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch'], function () {
          var autoOptions = {
            city: "北京",
            input: "tipinput"
          };
          var auto = new AMap.Autocomplete(autoOptions);
          var placeSearch = new AMap.PlaceSearch({
            city: '北京',
            map: map
          });
          AMap.event.addListener(auto, "select", function (e) {
            placeSearch.search(e.poi.name, function (status, result) {
              if (status === 'complete' && result.info === 'OK') {
                vm.placeSearchCallBack(result);
              }
            });
          });
        });

        //当点击地图的时候
        map.on('click', function (e) {
          //如果地图上有圆,重新绘制
          if (circle!=null){
            vm.initMap(vm.scopeMap.getZoom())
          }
          var lnglatXY = [e.lnglat.getLng(), e.lnglat.getLat()];
          vm.machine.amaplongitudeNum = e.lnglat.getLng();
          vm.machine.amaplatitudeNum = e.lnglat.getLat();
          geocoder.getAddress(lnglatXY, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
              var address = result.regeocode.formattedAddress; //返回地址描述
              vm.updateLocationInfo(address, lnglatXY);
            }
          });
          vm.echoFence(map);
        });

        //scope中map对象
        vm.scopeMap=map;

        //调整半径后
        vm.echoFence(map);
      })
    };

    //加载地图
    vm.initMap(4);

    /**
     * 回调函数,默认选中第一个地址
     *
     * @param data
     */
    vm.placeSearchCallBack = function (data) {
      var poiArr = data.poiList.pois;
      if (poiArr.length > 0) {
        var lnglatXY = [poiArr[0].location.getLng(), poiArr[0].location.getLat()];
        vm.updateLocationInfo(poiArr[0].address, lnglatXY);
      }
    };

    /**
     * 电子围栏地址,经纬度值设置
     *
     * @param address
     * @param location
     */
    vm.updateLocationInfo = function (address, location) {
      vm.machine.fenceAddress = address;
      vm.machine.amaplongitudeNum = location[0];//选中的经度
      vm.machine.amaplatitudeNum = location[1];//选中的维度
      $scope.$apply();
    };

    /**
     * 电子围栏设置
     *
     * @param map map
     */
    vm.echoFence = function (map) {
      //回显围栏坐标
      if (vm.machine.amaplongitudeNum != null && vm.machine.amaplatitudeNum != null) {
        var lnglatXY = [vm.machine.amaplongitudeNum, vm.machine.amaplatitudeNum];
        circle = createCircle(lnglatXY, vm.machine.radius);
        circle.setMap(map);
        var circleEditor = new AMap.CircleEditor(map, circle);
        //监听圆移动
        AMap.event.addListener(circleEditor, "move", function (e) {
          var location = [e.lnglat.lng, e.lnglat.lat];
          var geocoder = new AMap.Geocoder({});
          geocoder.getAddress(location, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
              vm.updateLocationInfo(result.regeocode.formattedAddress, location);
            }
          });
        });
        //圆半径改变
        AMap.event.addListener(circleEditor, "adjust", function (e) {
          vm.machine.radius = e.radius;
          $scope.$apply();
        });

        circleEditor.open();
      }
    };

    /**
     * 调整半径大小
     *
     * @param radius
     */
    vm.changeRadius = function (radius) {
      vm.adjustCircleRadius(radius);
    };

    /**
     * 调整半径
     *
     * @param radius
     */
    vm.adjustCircleRadius=function (radius) {
      vm.initMap(vm.scopeMap.getZoom());
    }

  }
})();
