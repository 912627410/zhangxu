/**
 * @author riqian.ma
 * @date 1/8/17.
 * @description 新建围栏controller
 * @updated1 xielong.wang
 * @update_date 2017-09-29
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newRentalFenceController', newRentalFenceController);

  /** @ngInject */
  function newRentalFenceController($rootScope, $uibModalInstance, $scope, languages, serviceResource, RENTAL_ORG_FENCE_URL, AMAP_PLACESEARCH_URL, Notification) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.rentalOrgFence = {};
    vm.rentalOrgFence.radius = 100; //设置的半径,默认100米

    /**
     * 取消新建围栏
     */
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
      // $uibModalInstance.close();
    };

    /**
     * 新增围栏
     */
    vm.ok = function () {
      var rspdata = serviceResource.restAddRequest(RENTAL_ORG_FENCE_URL, vm.rentalOrgFence);
      rspdata.then(function (data) {
        Notification.success(languages.findKey('newFenceSucc'));
        $uibModalInstance.close(data.content);
      }, function (reason) {
        Notification.error(reason.data.message);
      })
    }


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
     * @param zoomsize 缩放级别
     * @param mapId mapId
     * @returns {{geocoder: *, zoomsize: *, map}}
     */
    function initAmapMap(zoomsize, mapId, longitude, latitude) {
      //初始化地图对象
      if (!AMap) {
        location.reload(false);
      }
      //插件定义
      var amapScale, toolBar, overView, geocoder;

      var localCenterAddr = [103.39, 36.9];//设置中心点大概在兰州附近

      if (zoomsize == null || zoomsize == undefined) {
        zoomsize = 14;
      }
      if (longitude == null || longitude == undefined) {
        longitude = 103.39;
        //设置中心点大概在兰州附近
      }
      if (latitude == null || latitude == undefined) {
        latitude = 36.9;
        //设置中心点大概在兰州附近
      }
      localCenterAddr = [longitude, latitude]
      //初始化地图对象
      var map = new AMap.Map(mapId, {
        resizeEnable: true,
        scrollWheel: true,
        center: localCenterAddr,
        zooms: [3, 18],
        zoom: zoomsize
      });

      vm.map = map;

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
        // circleEditor = new AMap.CircleEditor({
        //   visible: true //初始化隐藏鹰眼
        // });
        // map.addControl(circleEditor);
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
        map.addControl(auto,placeSearch);
        AMap.event.addListener(auto, "select", function (e) {
          placeSearch.search(e.poi.name, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
              vm.placeSearchCallBack(result);
            }
          });
        });
      });

      return {geocoder: geocoder, zoomsize: zoomsize, map: map};
    }

    initAmapMap(null,"newOrderMap",null,null);
    /**
     * 初始化地图
     *
     * @param zoomsize
     */
    vm.initMap = function (mapId, zoomsize, radius, longitude, latitude) {
      $LAB.setGlobalDefaults({AllowDuplicates: true, CacheBust: true});
      $LAB.script({src: AMAP_PLACESEARCH_URL, type: "text/javascript"}).wait(function () {
        var __ret = initAmapMap(zoomsize, mapId, longitude, latitude);
        var geocoder = __ret.geocoder;
        zoomsize = __ret.zoomsize;
        var map = __ret.map;

        //当点击地图的时候
        map.on('click', function (e) {
          /*//如果地图上有圆,重新绘制
          if (circle != null) {*/
          vm.initMap("newOrderMap", vm.scopeMap.getZoom(), vm.rentalOrgFence.radius, e.lnglat.getLng(), e.lnglat.getLat())
          // }
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
        map.setFitView();
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
      vm.initMap("newOrderMap", vm.scopeMap.getZoom(), radius, vm.rentalOrgFence.longitude, vm.rentalOrgFence.latitude);
    };

  }
})();
