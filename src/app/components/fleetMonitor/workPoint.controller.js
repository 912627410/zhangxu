/**
 * Created by xiaopeng on 17-4-18.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('workPointController', workPointController);

  /** @ngInject */

  function workPointController($state,WORK_POINT_URL, WORK_LINE_URL, AMAP_GEO_CODER_URL ,Map ,fleetTreeFactory, $uibModal,languages,NgTableParams, ngTableDefaults, serviceResource, Notification) {
    var vm = this;
    vm.workPointList = [];

    vm.circleMap = angular.copy(Map);
    vm.markerMap = angular.copy(Map);
    vm.circleEditor = null;
    vm.operWorkPorint = null;


    vm.openFleetTree = function () {
      fleetTreeFactory.treeShow(function (selectedItem) {
        vm.fleet =selectedItem;

        vm.initPointQuery(null,null,null,vm.fleet);
      });
    }


    ngTableDefaults.settings.counts = [];

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

    vm.initMap = function (mapId, centeraddr, workPointList, workLineList) {

      $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
        //初始化地图对象
        if (!AMap) {
          location.reload(false);
        }

        var amapScale, toolBar, overView;
        var localZoomSize = 14;  //默认缩放级别

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

        AMap.service('AMap.Driving',function(){//回调函数
          //实例化Driving
          // TODO: 使用driving对象调用驾车路径规划相关的功能
        })

        var clickEventListener = map.on('click', function(e) {
          document.getElementById("lnglat").value = e.lnglat.getLng() + ',' + e.lnglat.getLat()
        });

        if(workPointList!=null && workPointList.length > 0){
          for( var i=0; i <workPointList.length; i ++){
            var workPoint = workPointList[i];

            var circle = createCircle(workPoint);
            circle.setMap(map);
            vm.circleMap.put(vm.workPointList[i].id, circle);


            var marker = createMarker(workPoint);
            marker.setMap(map);
            vm.markerMap.put(vm.workPointList[i].id, marker);

          }
        }

        if(workLineList !=null && workLineList.length > 0 ){
          for( var i=0; i <workLineList.length; i ++){

            var driving= new AMap.Driving({
              map: map
            });

            var begin = [Number(workLineList[i].beginPoint.longitude),Number(workLineList[i].beginPoint.latitude)];
            var end = [Number(workLineList[i].endPoint.longitude),Number(workLineList[i].endPoint.latitude)];
            driving.clear();
            driving.search(begin, end, function(status, result) {
              //TODO 解析返回结果，自己生成操作界面和地图展示界面
            });

          }
        }

        vm.map = map;

      })

    }


    vm.initPointQuery = function (page, size, sort, fleet) {
      var restCallURL = WORK_POINT_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 6;
      var sortUrl = sort || 'id';
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if(fleet!=null){
        restCallURL += "&search_EQ_fleet.id=" + fleet.id;
      }

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.workPointList = data.content;

          vm.tableParams = new NgTableParams({},
            {
              dataset: vm.workPointList
            });
          vm.page = data.page;
          vm.pagenumber = data.page.number + 1;

        vm.initMap("workPointMap",null, vm.workPointList, null );
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    };

    vm.initLineQuery = function (page, size, sort, fleet) {
      var restCallURL = WORK_LINE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 6;
      var sortUrl = sort || 'id';
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      //只显示启用的路线
      restCallURL += "&search_EQ_status=" + 1;

      if(fleet!=null){
        restCallURL += "&search_EQ_fleet.id=" + fleet.id;
      }

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.workLineList = data.content;

          vm.lineTableParams = new NgTableParams({},
            {
              dataset: vm.workLineList
            });
          vm.linePage = data.page;
          vm.linePagenumber = data.page.number + 1;

          vm.initMap("workPointMap",null,null, vm.workLineList );

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
      if(vm.fleet ==null){
        Notification.warning("请先选择车队!");
        return
      }

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetMonitor/newWorkPoint.html',
        controller: 'newWorkPointController as newWorkPointCtrl',
        size: 'lg',
        backdrop: false,
        resolve: {
          fleet: vm.fleet
        }
      });

      modalInstance.result.then(function (result) {
        var workPoint = result;

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

    vm.createLine = function () {
      if(vm.fleet ==null){
        Notification.warning("请先选择车队!");
        return
      }

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetMonitor/newWorkLine.html',
        controller: 'newWorkLineController as newWorkLineCtrl',
        size: 'lg',
        backdrop: false,
        resolve: {
          fleet: vm.fleet
        }
      });

      modalInstance.result.then(function (result) {

        vm.initLineQuery(null,null,null,vm.fleet);

      }, function () {
        //取消
      });

    }


    vm.remove = function (workLine) {
      workLine.status = 0;
      vm.updateLine(workLine);
    }

    vm.openMonitor = function (workLine) {
      workLine.ifMonitor = 1;
      vm.updateLine(workLine);
    }

    vm.closeMonitor = function (workLine) {
      workLine.ifMonitor = 0;
      vm.updateLine(workLine);
    }

    vm.updateLine = function (workLine) {
      var restPromise = serviceResource.restUpdateRequest(WORK_LINE_URL, workLine);
      restPromise.then(function (data) {
        Notification.success('更新工作路线状态成功');
        vm.initLineQuery(null,null,null,vm.fleet);

        }, function (reason) {
          Notification.error('更新工作路线失败');
        }
      )
    }

  }
})();
