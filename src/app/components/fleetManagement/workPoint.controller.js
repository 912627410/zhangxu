/**
 * Created by xiaopeng on 17-4-18.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('workPointController', workPointController);

  /** @ngInject */

  function workPointController(WORK_POINT_URL, AMAP_GEO_CODER_URL ,Map , $uibModal,languages,NgTableParams, ngTableDefaults, serviceResource, Notification) {
    var vm = this;
    vm.workPointList = [];

    vm.circleMap = angular.copy(Map);
    vm.markerMap = angular.copy(Map);
    //
    vm.circleEditor = null;

    //
    vm.operWorkPorint = null;

    ngTableDefaults.settings.counts = [];

    // create circle
    var createCircle = function (workPoint) {

      var circle,strokeColor,fillColor;


      if(workPoint.type == '装料点'){
        strokeColor="#6495ED"; //线颜色
        fillColor= "#A2B5CD"; //填充颜色
      }else if(workPoint.type = '卸料点'){
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
        var localZoomSize = 14;  //默认缩放级别
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

        var clickEventListener = map.on('click', function(e) {
          document.getElementById("lnglat").value = e.lnglat.getLng() + ',' + e.lnglat.getLat()
        });

        for( var i=0; i <workPointList.length; i ++){
          var workPoint = workPointList[i];

          var circle = createCircle(workPoint);
          circle.setMap(map);
          vm.circleMap.put(vm.workPointList[i].id, circle);


          var marker = createMarker(workPoint);
          marker.setMap(map);
          vm.markerMap.put(vm.workPointList[i].id, marker);

        }
        vm.map = map;

      })

    }



    vm.setDefaultAddress = function () {
      if (vm.deviceInfoList != null) {
        vm.deviceInfoList.forEach(function (deviceInfo) {
          if (deviceInfo.address === languages.findKey('requestingLocationData')+'...') {
            deviceInfo.address = '--';
          }
        })
      }
    }

    vm.initQuery = function (page, size, sort, workPoint) {
      var restCallURL = WORK_POINT_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 6;
      var sortUrl = sort || 'id';
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.workPointList = data.content;
          for(var i=0;i<vm.workPointList.length; i++){
            (vm.workPointList[i].type ==1) ? vm.workPointList[i].type ='装料点' : vm.workPointList[i].type ='卸料点';
          }

          vm.tableParams = new NgTableParams({},
            {
              dataset: vm.workPointList
            });
          vm.page = data.page;
          vm.pagenumber = data.page.number + 1;

        vm.initMap("workPointMap",null,null, vm.workPointList );
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    };


    vm.update = function (workPoint) {
      if(vm.circleEditor){
        vm.circleEditor.close();
      }



      var _circle = vm.circleMap.get(workPoint.id);
      vm.map.setCenter(_circle.getCenter());
      vm.circleEditor = new AMap.CircleEditor(vm.map, _circle);
      vm.operWorkPorint = workPoint.id;


      var _marker = vm.markerMap.get(workPoint.id);

      AMap.event.addListener(vm.circleEditor, "move", function (e) {

        var _LngLat =  new AMap.LngLat(e.lnglat.lng,  e.lnglat.lat)
        _marker.setPosition(_LngLat);
        document.getElementById("lnglat").value = e.lnglat.lng + ',' + e.lnglat.lat;

      })


      vm.circleEditor.open();

    }


    vm.save = function (workPoint) {


      AMap.event.addListener(vm.circleEditor, "end", function (e) {
        var circle = e.target;
        workPoint.longitude = circle.getCenter().getLng();
        workPoint.latitude = circle.getCenter().getLat();
        workPoint.radius = circle.getRadius();

        var restPromise = serviceResource.restUpdateRequest(WORK_POINT_URL, workPoint);
        restPromise.then(function (data) {
            vm.operWorkPorint = null;
            Notification.success("save success");

          }, function (reason) {
            Notification.error(languages.findKey('failedToGetDeviceInformation'));
          }
        )
      })

      vm.circleEditor.close();


    }


    vm.create = function () {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/newWorkPoint.html',
        controller: 'newWorkPointController as newWorkPointCtrl',
        size: 'lg',
        backdrop: false,
      });

      modalInstance.result.then(function (result) {
        var workPoint = result;
        (workPoint.type ==1) ? workPoint.type ='装料点' : workPoint.type ='卸料点';

        var circle = createCircle(workPoint);
        circle.setMap(vm.map);
        vm.circleMap.put(workPoint.id, circle);

        var marker = createMarker(workPoint);
        marker.setMap(vm.map);
        vm.markerMap.put(workPoint.id, marker);


        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });

    }

    vm.initQuery();


  }
})();
