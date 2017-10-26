/**
 * @author riqian.ma
 * @date 1/8/17.
 * @description 围栏更新的controller
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateRentalFenceController', updateRentalFenceController);

  /** @ngInject */
  function updateRentalFenceController($rootScope, $window, $stateParams, $scope, $timeout, $http, $confirm, $uibModal, $location, languages,treeFactory, serviceResource, RENTAL_ORG_FENCE_URL, AMAP_GEO_CODER_URL, AMAP_PLACESEARCH_URL, Notification) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.rentalOrgFence = {};
    vm.rentalOrgFence.radius = 100; //设置的半径,默认100米

    if ($stateParams.id != null) {
      var restCall = RENTAL_ORG_FENCE_URL + "?id=" + $stateParams.id;
      var fencePromis = serviceResource.restCallService(restCall, "GET");
      fencePromis.then(function (data) {
        vm.rentalOrgFence = data.content;
      })
    }

    /**
     * 取消更新
     */
    vm.cancel = function () {
      $location.path("/rental/orgFence");
    };

    vm.ok = function () {
      var rspdata = serviceResource.restUpdateRequest(RENTAL_ORG_FENCE_URL, vm.rentalOrgFence);
      rspdata.then(function (data) {
        Notification.success(languages.findKey('modifyFenceInformation'));
        $location.path("/rental/orgFence");
      }, function (reason) {
        Notification.error(reason.data.message);
      })
    }

    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxMapContainerHeight = windowHeight - 50 - 10 - 5 - 90 - 7;//50 topBar的高,10间距,25面包屑导航,5间距90msgBox高,15间距,8 预留
      //地图的自适应高度
      vm.baseBoxMapContainer = {
        "min-height": baseBoxMapContainerHeight + "px"
      }
    }

    //初始化高度
    vm.adjustWindow($window.innerHeight);

    //全局的圆对象
    var circle = null;

    /**
     * 在地图上画圆
     * @param position
     * @returns {*}
     */
    var createCircle = function (position) {
      return new AMap.Circle({
        center: position,// 圆心位置
        radius: vm.rentalOrgFence.radius, //半径
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
    vm.initMap = function (mapId, zoomsize) {
      $LAB.setGlobalDefaults({AllowDuplicates: true, CacheBust: true});
      $LAB.script({src: AMAP_PLACESEARCH_URL, type: "text/javascript"}).wait(function () {
        //初始化地图对象
        if (!AMap) {
          location.reload(false);
        }
        //插件定义
        var amapScale, toolBar, overView, geocoder, circleEditor;

        var localCenterAddr = [103.39, 36.9];//设置中心点大概在兰州附近

        if (zoomsize == null || zoomsize == undefined) {
          zoomsize = 4;
        }
        //初始化地图对象
        var map = new AMap.Map(mapId, {
          resizeEnable: true,
          scrollWheel: true,
          center: localCenterAddr,
          zooms: [3, 18],
          zoom: zoomsize
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
            radius: 1000,
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
          if (circle != null) {
            vm.initMap("newOrderMap", 4)
          }
          var lnglatXY = [e.lnglat.getLng(), e.lnglat.getLat()];
          vm.rentalOrgFence.longitude = e.lnglat.getLng();
          vm.rentalOrgFence.latitude = e.lnglat.getLat();
          geocoder.getAddress(lnglatXY, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
              var address = result.regeocode.formattedAddress; //返回地址描述
              vm.updateLocationInfo(address, lnglatXY);
            }
          });
          vm.echoFence(map);
        });

        //scope中map对象
        vm.scopeMap = map;

        //调整半径后
        vm.echoFence(map);
      })
    };

    //加载地图
    vm.initMap("newOrderMap", 4);


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
      vm.rentalOrgFence.fenceAddress = address;
      vm.rentalOrgFence.longitude = location[0];//选中的经度
      vm.rentalOrgFence.latitude = location[1];//选中的维度
      $scope.$apply();
    };

    /**
     * 电子围栏设置
     *
     * @param map map
     */
    vm.echoFence = function (map) {
      //回显围栏坐标
      if (vm.rentalOrgFence.longitude != null && vm.rentalOrgFence.latitude != null) {
        var lnglatXY = [vm.rentalOrgFence.longitude, vm.rentalOrgFence.latitude];
        circle = createCircle(lnglatXY, vm.rentalOrgFence.radius);
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
          vm.rentalOrgFence.radius = e.radius;
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
    vm.adjustCircleRadius = function (radius) {
      vm.initMap("initMap", vm.scopeMap.getZoom());
    };

  }
})();
