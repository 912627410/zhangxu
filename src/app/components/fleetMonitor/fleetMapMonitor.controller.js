/**
 * Created by xiaopeng on 17-5-23.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('fleetMapMonitorController', fleetMapMonitorController);

  /** @ngInject */

  function fleetMapMonitorController(WORK_POINT_URL,$scope,$rootScope,$timeout,fleetTreeFactory, Map, AMAP_GEO_CODER_URL,languages,WEBSOCKET_URL,DEVCE_PAGED_QUERY, serviceResource, Notification) {
    var vm = this;
    vm.workPointList = [];
    vm.fleet = $rootScope.fleetChart[0];
    vm.operatorInfo = $rootScope.userInfo;
    var fleetMonitorUrl;
    vm.markerMap = angular.copy(Map);


    vm.openFleetTree = function () {
      fleetTreeFactory.treeShow(function (selectedItem) {
        vm.fleet =selectedItem;
        if(fleetMonitorUrl){fleetMonitorUrl.close();}

        vm.initQuery(vm.fleet);
      });
    }


    //添加车辆marker
    var addDeviceMarker = function(item) {

      var icon = "assets/images/car_right5_1.png";

      var marker = new AMap.Marker({
        position: new AMap.LngLat(item.amaplongitudeNum, item.amaplatitudeNum), //基点位置
        icon: icon,
        offset: new AMap.Pixel(-26, -15),
        autoRotation: true
      });

      // 设置label标签
      marker.setLabel({
        offset: new AMap.Pixel(10, -22),//修改label相对于maker的位置
        content: item.deviceNum
      });


      return marker;

    }



    // create circle
    var createCircle = function (workPoint) {

      var circle,strokeColor,fillColor;


      if(workPoint.type == 1){
        strokeColor="#6495ED"; //线颜色
        fillColor= "#A2B5CD"; //填充颜色
      }else if(workPoint.type = 2){
        strokeColor= "#F33"; //线颜色
        fillColor="#ee2200"; //填充颜色
      }

      circle = new AMap.Circle({
        center: [workPoint.longitude, workPoint.latitude],// 圆心位置
        radius: workPoint.radius, //半径
        strokeColor: strokeColor, //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线粗细度
        fillColor: fillColor, //填充颜色
        fillOpacity: 0.35, //填充透明度
        extData: workPoint.id
      });

      return circle;

    }


    // create circle
    var createMarker = function (workPoint) {

      var marker = new AMap.Marker({
        position: [workPoint.longitude, workPoint.latitude],
        title: workPoint.name,
        draggable: true,
        cursor: 'move',
        raiseOnDrag: true
      });

      // 设置label标签
      marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
        offset: new AMap.Pixel(20, 20),//修改label相对于maker的位置
        content: workPoint.name
      });
      return marker;

    }

    //modal打开是否有动画效果
    vm.animationsEnabled = true;

    vm.initMap = function (mapId, zoomsize, centeraddr, workPointList) {

      $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
        //初始化地图对象
        if (!AMap) {
          location.reload(false);
        }

        var amapScale, toolBar, overView;
        var localZoomSize = 15;  //默认缩放级别
        if (zoomsize) {
          localZoomSize = zoomsize;
        }
        var localCenterAddr = [89.149228, 44.831098];//设置中心点大概在兰州附近
        if (centeraddr) {
          localCenterAddr = centeraddr;
        }
        var map = new AMap.Map(mapId, {
          resizeEnable: true,
          center: localCenterAddr,
          scrollWheel:false, // 是否可通过鼠标滚轮缩放浏览
          zooms: [4, 18]
        });
        map.setZoom(localZoomSize);
        map.plugin(['AMap.ToolBar'], function () {
          map.addControl(new AMap.ToolBar());
        });
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
        map.plugin(["AMap.ToolBar",'AMap.CircleEditor'], function () {
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

        map.plugin(['AMap.Autocomplete','AMap.PlaceSearch'],function(){
          var autoOptions = {
            city: "北京", //城市，默认全国
            input: "tipinput"//使用联想输入的input的id
          };
          var auto= new AMap.Autocomplete(autoOptions);
          var placeSearch = new AMap.PlaceSearch({
            city:'北京',
            map:map
          });
          AMap.event.addListener(auto, "select", function(e){
            //TODO 针对选中的poi实现自己的功能
            placeSearch.search(e.poi.name)
          });
        });


        for( var i=0; i <workPointList.length; i ++){
          var workPoint = workPointList[i];

          var circle = createCircle(workPoint);
          circle.setMap(map);


          var marker = createMarker(workPoint);
          marker.setMap(map);

        }
        vm.map = map;

      })

    }


    vm.initQuery = function (fleet) {
      if(fleet == null){
        Notification.warning("请选择车队");
        return;
      }
      var restCallURL = WORK_POINT_URL;
      restCallURL += "?page=0&size=1000&sort=id";
      restCallURL += "&search_EQ_fleet.id=" + fleet.id;


      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.workPointList = data.content;

          vm.initMap("fleetMonitorMap",null,null, vm.workPointList );

          $timeout(function () {
            vm.queryDeviceList(fleet);

          },500)
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    };

    vm.queryDeviceList = function (fleet) {
      var restCallURL = DEVCE_PAGED_QUERY;
      var pageUrl =  0;
      var sizeUrl =  1000;
      var sortUrl =  'id';
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      restCallURL += "&search_EQ_fleet.id=" + fleet.id;
      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.deviceList = data.content;

          for(var n =0; n <vm.deviceList.length;n++) {
            var device = vm.deviceList[n];
            if(device.amaplongitudeNum!=null && device.amaplatitudeNum!=null){

              var deviceMarker = addDeviceMarker(device);
              vm.markerMap.put(device.deviceNum, deviceMarker);

              deviceMarker.setMap(vm.map);
            }

          }

          vm.openMonitor();

        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
    }


    // open
    vm.openMonitor = function () {

      // websocket monitor
      fleetMonitorUrl = new WebSocket(WEBSOCKET_URL + "webSocketServer/fleetRealTimeMonitor?token=" + vm.operatorInfo.authtoken);

      fleetMonitorUrl.onerror = function (evt) {
        Notification.error("WebSocket Error!");
      };

      fleetMonitorUrl.onmessage = function (evt) {
        var monitorVo = JSON.parse(evt.data);
        var newPoint = new AMap.LngLat(monitorVo.longitude, monitorVo.latitude);

        if(vm.markerMap.containsKey(monitorVo.deviceNum)){
          var marker = vm.markerMap.get(monitorVo.deviceNum);
          marker.moveTo(newPoint, 500);
          vm.markerMap.put(monitorVo.deviceNum, marker);
        }

      };

    }

    vm.closeMonitor = function () {
      if(fleetMonitorUrl){fleetMonitorUrl.close();}

    }


    vm.initQuery(vm.fleet);

    $scope.$on("$destroy",function () {
      //vm.closeMonitor();
      fleetMonitorUrl.close();
    });

  }
})();

