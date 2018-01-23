/**
 * @author xielongwang
 * @date 2017/8/17.
 * @description 车辆地图轨迹controller
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorMapController', machineMonitorMapController);

  /** @ngInject */
  function machineMonitorMapController($rootScope, $window, $scope, $http, $location, $timeout, $filter, languages, Notification, sharedDeviceInfoFactory, machineMapFactory, serviceResource, AMAP_GEO_CODER_URL, RENTAL_TRAJECTORY_DATA,DEFAULT_MINSIZE_PER_PAGE) {
    var vm = this;
    vm.deviceInfo = sharedDeviceInfoFactory.getSharedDeviceInfo(); //获取共享数据deviceinfo
    vm.pageSize = DEFAULT_MINSIZE_PER_PAGE; //分页大小
    vm.maps;//地图对象
    vm.mapFaster = false; //地图轨迹加减速初始状态
    vm.mapSlower = true; //地图轨迹加减速初始状态
    var date = new Date();
    //查询开始时间默认为昨天
    date.setDate(date.getDate() - 1);
    vm.queryStartDate = date;
    //结束时间
    vm.queryEndDate = new Date();
    //初始化地图
    serviceResource.refreshMapWithDeviceInfo("trackDetailMap", [vm.deviceInfo], 4, $rootScope.langkey, [104.06, 30.83], false, function () {}, true, true);

    /**
     * 地图轨迹
     * @param mapId id
     * @param zoomSize 缩放级别
     * @param lineAttr 轨迹数据
     */
    vm.trackDrawing = function (mapId, zoomSize, dataContent) {
      $LAB.setGlobalDefaults({AllowDuplicates: true, CacheBust: true});
      $LAB.script({src: AMAP_GEO_CODER_URL, type: "text/javascript"}).wait(function () {
        var centeradd = [dataContent[0].amaplongitudeNum, dataContent[0].amaplatitudeNum]
        var lineAttr = [];
        dataContent.forEach(function (deviceData) {
          lineAttr.push(new AMap.LngLat(deviceData.amaplongitudeNum, deviceData.amaplatitudeNum));
        });
        vm.lnglatShow = true;
        vm.markerSpeed = 500; // 小车移动速度

        var carPostion = lineAttr[0];
        /*****************     第一部分，动画暂停、继续的实现 通过自定义一个控件对象来控制位置变化    ********************/
        /**
         * Marker移动控件
         * @param {Map} map    地图对象
         * @param {Marker} marker Marker对象
         * @param {Array} path   移动的路径，以坐标数组表示
         */
        var MarkerMovingControl = function (map, marker, path) {
          this._map = map;
          this._marker = marker;
          this._path = path;
          this._currentIndex = 0;
          marker.setMap(map);
          marker.setPosition(path[0]);
        }
        /**************************************结束 ***********************************************************/

          //构造地图对象
        var map = new AMap.Map(mapId, {
            resizeEnable: true,
            scrollWheel: true,
            center: centeradd,
            zooms: [4, 18]
          });

        vm.maps = map;

        //加载比例尺插件
        map.plugin(["AMap.Scale"], function () {
          var amapScale = new AMap.Scale();
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
          var toolBar = new AMap.ToolBar();
          map.addControl(toolBar);
        });

        //小车
        var marker = new AMap.Marker({
          map: map,
          position: carPostion,
          icon: "http://webapi.amap.com/images/car.png",
          offset: new AMap.Pixel(-26, -18),
          autoRotation: true
        });

        // 绘制轨迹
        var polyline = new AMap.Polyline({
          map: map,
          path: lineAttr,
          strokeColor: "#00A",  //线颜色
          strokeOpacity: 1,     //线透明度
          strokeWeight: 3,      //线宽
          strokeStyle: "solid"  //线样式
        });

        map.setFitView();

        //初始化
        var markerMovingControl = new MarkerMovingControl(map, marker, lineAttr);
        //设置开始的点
        var startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
        //移动了多少米
        var lastDistabce = 0;

        //移动完成触发事件
        AMap.event.addListener(marker, "movealong", function () {
          markerMovingControl._currentIndex = 0;
        })

        //每一步移动完成触发事件
        AMap.event.addListener(marker, "moveend", function () {
          markerMovingControl._currentIndex++;
          var distances = parseInt(startLat.distance(marker.getPosition()).toString().split('.')[0]);
          lastDistabce += distances;
          vm.trackMileage = lastDistabce.toFixed(1);
          $scope.$apply();
          startLat = new AMap.LngLat(marker.getPosition().lng, marker.getPosition().lat);
        })

        //小车每一移动一部就会触发事件
        AMap.event.addListener(marker, "moving", function () {
        })

        //开始事件
        AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
          lastDistabce = 0;
          vm.trackMileage = 0;
          $scope.$apply();
          startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
          markerMovingControl._currentIndex = 0;
          markerMovingControl._marker.moveAlong(lineAttr, vm.markerSpeed);
        }, false);

        //暂停事件
        AMap.event.addDomListener(document.getElementById('stop'), 'click', function () {
          markerMovingControl._marker.stopMove();
          var distabcess2 = lastDistabce;
          var distances = parseInt(startLat.distance(markerMovingControl._marker.getPosition()).toString().split('.')[0]);
          distabcess2 += distances;
          vm.trackMileage = distabcess2;
          $scope.$apply();
        }, false);

        //继续移动事件
        AMap.event.addDomListener(document.getElementById('move'), 'click', function () {
          var lineArr2 = lineAttr.slice(markerMovingControl._currentIndex + 1);
          lineArr2.unshift(marker.getPosition());
          markerMovingControl._marker.moveAlong(lineArr2, vm.markerSpeed);
        }, false);

        //加速移动事件
        AMap.event.addDomListener(document.getElementById('faster'), 'click', function () {
          if (vm.markerSpeed < 3000) {
            vm.markerSpeed += 1000;
          }
          if (vm.markerSpeed > 3000) {
            vm.mapFaster = true;
          }
          vm.mapSlower = false;
          var lineArr3 = lineAttr.slice(markerMovingControl._currentIndex + 1);
          lineArr3.unshift(marker.getPosition());
          markerMovingControl._marker.moveAlong(lineArr3, vm.markerSpeed);
        }, false);

        //减速移动事件
        AMap.event.addDomListener(document.getElementById('slower'), 'click', function () {
          if (vm.markerSpeed > 1000) {
            vm.markerSpeed -= 1000;
          }
          if (vm.markerSpeed < 1000) {
            vm.mapSlower = true;
          }
          vm.mapFaster = false;
          var lineArr4 = lineAttr.slice(markerMovingControl._currentIndex + 1);
          lineArr4.unshift(marker.getPosition());
          markerMovingControl._marker.moveAlong(lineArr4, vm.markerSpeed);
        }, false);
      })
      //end
    }


    vm.drawMaps = function (sort, deviceNum, queryStartDate, queryEndDate) {
      var restCallURL = RENTAL_TRAJECTORY_DATA + "?device_num=" + deviceNum;
      //时间参数
      if (queryStartDate && queryEndDate) {
        //开始时间
        var formatDate = $filter('date')(queryStartDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "&query_start_date=" + formatDate;

        //结束时间
        var formatEndDate = $filter('date')(queryEndDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "&query_end_date=" + formatEndDate;
      } else {
        Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }
      var trajectoryPromise = serviceResource.restCallService(restCallURL, "GET");
      trajectoryPromise.then(function (data) {
        if (data.content.length <= 0) {
          Notification.warning(languages.findKey('noData'));
          return;
        }
        vm.trackDrawing("trackDetailMap", 4, data.content);

      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })

    }


  }
})();
