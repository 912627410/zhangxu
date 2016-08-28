/**
 * Created by develop on 7/21/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateWorkplaneController', updateWorkplaneController);

  /** @ngInject */
  function updateWorkplaneController($rootScope,$scope,$timeout,$confirm,$uibModalInstance,AMAP_GEO_CODER_URL,WORKPLANE_URL,ENGINE_TYPE_LIST_URL,serviceResource, Notification,workplane) {
    var vm = this;
    vm.workplane = workplane;
    vm.operatorInfo =$rootScope.userInfo;

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');

    };

    vm.ok = function (workplane) {

      if(workplane.startLongitude==null||workplane.startLatitude==null){
        Notification.error("请选择装料点");
        return;
      }

      if(workplane.endLongitude==null||workplane.endLatitude==null){
        Notification.error("请选择卸料点");
        return;
      }

      var rspdata = serviceResource.restUpdateRequest(WORKPLANE_URL,workplane);
      rspdata.then(function (data) {
        if(data.code===0){
          Notification.success("新建作业面成功!");
          $uibModalInstance.close(data.content);
        }else{
          Notification.error(data.message);
        }

      },function (reason) {
        vm.errorMsg = reason.data.message;
        Notification.error(reason.data.message);
      });
    };

    //load map
    vm.refreshMap= function (mapId,workplane,zoomsize) {
      $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
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
        if (null!=workplane){
          if(null!=workplane.startLatitude&&null!=workplane.startLongitude)
          localCenterAddr = new AMap.LngLat(workplane.startLongitude, workplane.startLatitude);
          else  if(null!=workplane.endLongitude&&null!=workplane.endLatitude){
            localCenterAddr = new AMap.LngLat(workplane.endLongitude, workplane.endLatitude);
          }else{
            localZoomSize=1;
          }
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


        var startMarkers = [];
        var endMarkers = [];

        //初始化装料点button

        if(null!=workplane.startLongitude&&null!= workplane.startLatitude){
          vm.addStartMarkers(map,new AMap.LngLat(workplane.startLongitude, workplane.startLatitude),startMarkers);
        }


        //初始化鞋料点button
        if(null!=workplane.endLongitude&&null !=workplane.endLatitude){
        vm.addEndMarkers(map,new AMap.LngLat(workplane.endLongitude, workplane.endLatitude),endMarkers);
      }

        //地图click事件获取鼠标点击出的经纬度坐标
        AMap.event.addDomListener(document.getElementById('addStartPoint'), 'click', function() {

          vm.addStartMarkers(map,map.getCenter(),startMarkers);


        }, false);

        //addEndPoint
        AMap.event.addDomListener(document.getElementById('addEndPoint'), 'click', function() {
          vm.addEndMarkers(map,map.getCenter(),endMarkers);
        }, false);

        //addEndPoint
        AMap.event.addDomListener(document.getElementById('removeAllPoint'), 'click', function() {
          map.remove(startMarkers);
          map.remove(endMarkers);
          document.getElementById("endLongitude").value = '';
          document.getElementById("endLatitude").value = '';
          document.getElementById("startLongitude").value = '';
          document.getElementById("startLatitude").value = '';

        }, false);
      });
    };


    vm.addStartMarkers=function(map,location,markers){
      map.remove(markers);
      var startMarker = new AMap.Marker({
        icon:"assets/images/start_2.png" ,
        position: location,
        draggable: true,
        cursor: 'move',
        raiseOnDrag: true
      });
      startMarker.setMap(map);
      markers.push(startMarker);

      vm.updateStartLocationInfo(startMarker.getPosition());

      AMap.event.addListener(startMarker, 'dragend', function() {
        vm.updateStartLocationInfo(startMarker.getPosition());
      }, false);
    }

    vm.addEndMarkers=function(map,location,markers){
      map.remove(markers);
      var marker = new AMap.Marker({
        icon:"assets/images/end_2.png" ,
        position: location,
        draggable: true,
        cursor: 'move',
        raiseOnDrag: true
      });
      marker.setMap(map);
      markers.push(marker);

      vm.updateEndLocationInfo(marker.getPosition());

      AMap.event.addListener(marker, 'dragend', function() {
        vm.updateEndLocationInfo(marker.getPosition());
      }, false);
    }

    $timeout(function(){
      vm.refreshMap("workplaneMap",vm.workplane,13);
    },50);



    vm.updateEndLocationInfo=function(location){
      vm.workplane.endLongitude=location.getLng();//选中的经度
      vm.workplane.endLatitude=location.getLat();//选中的维度

      $scope.$apply();


    };


    vm.updateStartLocationInfo=function(location){
      vm.workplane.startLongitude=location.getLng();//选中的经度
      vm.workplane.startLatitude=location.getLat();//选中的维度

      $scope.$apply();


    };


  }
})();
