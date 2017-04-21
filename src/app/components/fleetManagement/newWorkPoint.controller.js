/**
 * Created by xiaopeng on 17-4-19.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newWorkPointController', newWorkPointController);

  /** @ngInject */
  function newWorkPointController(AMAP_GEO_CODER_URL, serviceResource, $timeout, Notification, WORK_POINT_URL, $uibModalInstance) {
    var vm = this;
    vm.workPoint = {
      longitude: null,
      latitude: null,
      radius: null
    }

    vm.pointTypeList = [{id: 1, name: "装料点"}, {id: 2, name: "卸料点"}];
    //modal打开是否有动画效果
    vm.animationsEnabled = true;
    vm.initMap = function (mapId, zoomsize, centeraddr) {

      $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
        //初始化地图对象
        if (!AMap) {
          location.reload(false);
        }

        var amapScale, toolBar, overView;
        var localZoomSize = 14;  //默认缩放级别
        if (zoomsize) {
          localZoomSize = zoomsize;
        }
        var localCenterAddr = [89.149228, 44.831098];//设置中心点
        if (centeraddr) {
          localCenterAddr = centeraddr;
        }
        var map = new AMap.Map(mapId, {
          resizeEnable: true,
          center: localCenterAddr,
          zooms: [1, 18]
        });

        map.setZoom(localZoomSize);

        //加载比例尺插件
        map.plugin(["AMap.Scale"], function () {
          amapScale = new AMap.Scale();
          map.addControl(amapScale);
        });
        //添加地图类型切换插件
        map.plugin(["AMap.MapType"], function () {
          //地图类型切换
          var mapType = new AMap.MapType({
            defaultType: 0,//默认显示卫星图
            showRoad: false //叠加路网图层
          });
          map.addControl(mapType);
        });
        //在地图中添加ToolBar插件
        map.plugin(['AMap.CircleEditor'], function () {

        });

        map.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch'], function () {
          var autoOptions = {
            city: "北京", //城市，默认全国
            input: "tipinput"//使用联想输入的input的id
          };
          var auto = new AMap.Autocomplete(autoOptions);
          var placeSearch = new AMap.PlaceSearch({
            city: '北京',
            map: map
          });
          AMap.event.addListener(auto, "select", function (e) {
            //TODO 针对选中的poi实现自己的功能
            placeSearch.search(e.poi.name)
          });
        });

        // var clickEventListener = map.on('click', function(e) {
        //   document.getElementById("lnglat").value = e.lnglat.getLng() + ',' + e.lnglat.getLat()
        // });

        vm.map = map;

      })

    }

    vm.showAddress = function (tipinput) {
      var placeSearch = new AMap.PlaceSearch({
        city: '北京',
        map: vm.map
      });

      placeSearch.search(tipinput)

    }

    vm.addPoint = function () {

      var LngLat = vm.map.getCenter();
      if (vm.circle != null) {
        vm.circleEditor.close();
        vm.circle.hide();
      }
      vm.circle = new AMap.Circle({
        center: [LngLat.getLng(), LngLat.getLat()],// 圆心位置
        radius: 100, //半径
        strokeColor: '#6495ED', //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线粗细度
        fillColor: "#A2B5CD", //填充颜色
        fillOpacity: 0.35, //填充透明度
      });


      document.getElementById("longitude").value = LngLat.getLng();
      document.getElementById("latitude").value = LngLat.getLat();
      document.getElementById("radius").value = 100;

      vm.circle.setMap(vm.map);
      vm.circleEditor = new AMap.CircleEditor(vm.map, vm.circle);

      AMap.event.addListener(vm.circleEditor, "move", function (e) {
        document.getElementById("longitude").value = e.lnglat.getLng();
        document.getElementById("latitude").value = e.lnglat.getLat();
      })

      AMap.event.addListener(vm.circleEditor, "adjust", function (e) {
        document.getElementById("radius").value = e.radius;
      })

      vm.circleEditor.open();
    }


    vm.ok = function (workPoint) {

      var lnglat = new AMap.LngLat(document.getElementById("longitude").value, document.getElementById("latitude").value);
      var radius = document.getElementById("radius").value;
      vm.map.setCenter(lnglat);
      vm.circle.setCenter(lnglat);
      vm.circle.setRadius(radius);
      vm.circleEditor.close();

      vm.workPoint.longitude = document.getElementById("longitude").value;
      vm.workPoint.latitude = document.getElementById("latitude").value;
      vm.workPoint.radius = document.getElementById("radius").value;

      var restPromise = serviceResource.restAddRequest(WORK_POINT_URL, vm.workPoint);
      restPromise.then(function (data) {

          Notification.success("save success");
          $uibModalInstance.close(data.content);


        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    }

    vm.remove = function () {
      vm.circleEditor.close();
      vm.circle.hide();
      vm.workPoint = null;
      document.getElementById("longitude").value = null;
      document.getElementById("latitude").value = null;
      document.getElementById("radius").value = null;
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');

    }

    $timeout(function () {
      vm.initMap("newWorkPointMap", null, null);
    }, 50);

  }

})();
