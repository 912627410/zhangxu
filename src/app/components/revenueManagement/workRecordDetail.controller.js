/**
 * Created by xiaopeng on 17-4-19.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('workRecordDetailController', workRecordDetailController);

  /** @ngInject */
  function workRecordDetailController($scope, AMAP_GEO_CODER_URL,WORK_POINT_RECORD_URL,serviceResource,$timeout,$filter,languages, Notification, DRIVER_RECORD_URL,$uibModalInstance,workRecord,NgTableParams ) {
    var vm = this;

    //modal打开是否有动画效果
    vm.animationsEnabled = true;
    vm.trackMileage = 0;

    vm.initMap = function (mapId, zoomsize, centeraddr) {

      $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
        //初始化地图对象
        if (!AMap) {
          location.reload(false);
        }

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
          scrollWheel:false, // 是否可通过鼠标滚轮缩放浏览
          zooms: [4, 18]
        });

        map.setZoom(localZoomSize);

        /*工具条，比例尺，预览插件*/
        AMap.plugin(['AMap.Scale','AMap.ToolBar'], function () {
          map.addControl(new AMap.Scale());
          map.addControl(new AMap.ToolBar());
        });

        AMap.plugin(["AMap.RangingTool"], function () {
        });


        vm.map = map;


      });


    }

    vm.buildUrl = function (url, workRecord) {
      var filterTerm = url;

      if (null != workRecord) {
        if (null != workRecord.deviceNum&&workRecord.deviceNum!="") {
          filterTerm += "?search_deviceNum=" +$filter('uppercase')(workRecord.deviceNum);
        }else {
          Notification.warning("请输入设备编号");
          return;
        }

      }

      var endDate = new Date(workRecord.recordDate);
      endDate.setDate(endDate.getDate()+1);

      filterTerm+="&search_startDate="+ $filter('date')(workRecord.recordDate, 'yyyy-MM-dd');
      filterTerm+="&search_endDate="+ $filter('date')(endDate, 'yyyy-MM-dd');

      return filterTerm;
    }

    vm.getMapData = function (workRecord) {

      var filterTerm = vm.buildUrl(DRIVER_RECORD_URL, workRecord);

      var lineArr = [];
      var lineArr2 = [];
      var position = [];
      var markerName = [];
      var recordPromis = serviceResource.restCallService(filterTerm, "GET");
      recordPromis.then(function (data) {
          if (data.content.length == 0) {
            Notification.warning(languages.findKey('deviceIsNotHistoricalDataForThisTimePeriodPleaseReselect'));
          }
          else {
            vm.driverRecords = _.sortBy(data.content, "recordTime");
            vm.driverRecords.forEach(function (record) {
              if(record.longitude!=null && record.latitude!=null ){
                lineArr.push(new AMap.LngLat(record.longitude, record.latitude));
                lineArr2.push(record.workPoint);
              }
            })
            for (var i = 0; i < lineArr.length; i++) {
              if(i == 0 || lineArr[i].lat != lineArr[i - 1].lat || lineArr[i].lng != lineArr[i - 1].lng) {
                position.push(lineArr[i]);
                markerName.push(lineArr2[i]);
              }
            }
            vm.refreshMapTab(position, markerName);
          }
        }, function (reason) {
          Notification.error(languages.findKey('historicalDataAcquisitionDeviceFailure'));
        }
      )
    }


    vm.getTableData = function (workRecord) {

      var filterTerm = vm.buildUrl(WORK_POINT_RECORD_URL, workRecord);

      var recordPromis = serviceResource.restCallService(filterTerm, "GET");
      recordPromis.then(function (data) {

          vm.tableParams = new NgTableParams({
            count: 10
          }, {
            dataset: data.content
          });

        }, function (reason) {
          Notification.error(languages.findKey('historicalDataAcquisitionDeviceFailure'));
        }
      )


    }



    //参数: 地图轨迹gps 数据
    vm.refreshMapTab = function (position, markerName) {


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
      var marker;



      var carPostion = position[0];


      var map = new AMap.Map("workRecordDetailMap", {
        resizeEnable: true,
        scrollWheel:false, // 是否可通过鼠标滚轮缩放浏览
        center: carPostion,
        zooms: [4, 18]
      });

      map.setZoom(14);

      /*工具条，比例尺，预览插件*/
      AMap.plugin(['AMap.Scale','AMap.ToolBar'], function () {
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar());
      });

      AMap.plugin(["AMap.RangingTool"], function () {
      });

      /*在地图中增加装料点丶卸料点的描述*/
      var len = position.length;
      for(var i = 0;i<len;i++) {
        var m = new AMap.Marker({
          map: map,
          position: position[i],
          offset: new AMap.Pixel(-15, -5),
          content: markerName[i]
        });
      }


      //小车
      marker = new AMap.Marker({
        map: map,
        position: carPostion,
        icon: "assets/images/mine_car1.png",
        offset: new AMap.Pixel(-26, -18),
        autoRotation: true
      });
      // 绘制轨迹
      var polyline = new AMap.Polyline({
        map: map,
        path: position,
        strokeColor: "#00A",  //线颜色
        strokeOpacity: 1,     //线透明度
        strokeWeight: 3,      //线宽
        strokeStyle: "solid"  //线样式
      });

      //map.setFitView();

      var markerMovingControl = new MarkerMovingControl(map, marker, position);
      var startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
      var lastDistabce = 0;
      /*移动完成触发事件*/
      AMap.event.addListener(marker, "movealong", function () {
        markerMovingControl._currentIndex = 0;
      })
      /*每一步移动完成触发事件*/
      AMap.event.addListener(marker, "moveend", function () {
        markerMovingControl._currentIndex++;
        var distances = parseInt(startLat.distance(marker.getPosition()).toString().split('.')[0]);
        lastDistabce += distances;
        vm.trackMileage = lastDistabce;
        $scope.$apply();
        startLat = new AMap.LngLat(marker.getPosition().lng, marker.getPosition().lat);
      })
      /*小车每一移动一部就会触发事件*/
      AMap.event.addListener(marker, "moving", function () {

      })
      /*开始事件*/
      AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
        vm.trackMileage = 0;
        $scope.$apply();
        startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
        markerMovingControl._currentIndex = 0;
        markerMovingControl._marker.moveAlong(position, 1500);
      }, false);
      /*暂停事件*/
      AMap.event.addDomListener(document.getElementById('stop'), 'click', function () {
        markerMovingControl._marker.stopMove();
        var distabcess2 = lastDistabce;
        var distances = parseInt(startLat.distance(markerMovingControl._marker.getPosition()).toString().split('.')[0]);
        distabcess2 += distances;
        vm.trackMileage = distabcess2;
        $scope.$apply();
      }, false);
      /*继续移动事件*/
      AMap.event.addDomListener(document.getElementById('move'), 'click', function () {
        var lineArr2 = position.slice(markerMovingControl._currentIndex + 1);
        lineArr2.unshift(marker.getPosition());
        markerMovingControl._marker.moveAlong(lineArr2, 1500);
      }, false);
    };




    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');

    }



    vm.initMap("workRecordDetailMap", null, null);


    vm.getTableData(workRecord);


    $timeout(function () {
      vm.getMapData(workRecord);

    },500)

  }

})();

