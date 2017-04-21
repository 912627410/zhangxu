/**
 * Created by xiaopeng on 17-4-19.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('workRecordDetailController', workRecordDetailController);

  /** @ngInject */
  function workRecordDetailController(AMAP_GEO_CODER_URL,WORK_POINT_RECORD_URL,serviceResource,$timeout,$filter,languages, Notification, DRIVER_RECORD_URL,$uibModalInstance,workRecord,NgTableParams ) {
    var vm = this;

    //modal打开是否有动画效果
    vm.animationsEnabled = true;


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
          zooms: [4, 18]
        });

        map.setZoom(localZoomSize);

        /*工具条，比例尺，预览插件*/
        AMap.plugin(['AMap.Scale'], function () {
            map.addControl(new AMap.Scale());
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

              }
            })
            for (var i = 0; i < lineArr.length; i++) {
              if(i == 0 || lineArr[i].lat != lineArr[i - 1].lat || lineArr[i].lng != lineArr[i - 1].lng) {
                lineArr2.push(lineArr[i]);
              }
            }
            vm.refreshMapTab(lineArr2);
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
    vm.refreshMapTab = function (lineAttr) {


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



      var carPostion = lineAttr[0];


      var map = new AMap.Map("workRecordDetailMap", {
        resizeEnable: true,
        center: carPostion,
        zooms: [4, 18]
      });

      map.setZoom(14);

      /*工具条，比例尺，预览插件*/
      AMap.plugin(['AMap.Scale'], function () {
        map.addControl(new AMap.Scale());
      });

      AMap.plugin(["AMap.RangingTool"], function () {
      });



      //小车
      marker = new AMap.Marker({
        map: map,
        position: carPostion,
        icon: "assets/images/car_03.png",
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true
      });
      marker.setLabel({
        offset: new AMap.Pixel(-10, -25),//修改label相对于maker的位置
        content: "行使了 0 米"
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

      //map.setFitView();

      var markerMovingControl = new MarkerMovingControl(map, marker, lineAttr);
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
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + lastDistabce + "&nbsp&nbsp" + "米"
        });
        startLat = new AMap.LngLat(marker.getPosition().lng, marker.getPosition().lat);
      })
      /*小车每一移动一部就会触发事件*/
      AMap.event.addListener(marker, "moving", function () {

      })
      /*开始事件*/
      AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
        lastDistabce = 0;
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + lastDistabce + "&nbsp&nbsp" + "米"
        });
        startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
        markerMovingControl._currentIndex = 0;
        markerMovingControl._marker.moveAlong(lineAttr, 1500);
      }, false);
      /*暂停事件*/
      AMap.event.addDomListener(document.getElementById('stop'), 'click', function () {
        markerMovingControl._marker.stopMove();
        var distabcess2 = lastDistabce;
        var distances = parseInt(startLat.distance(markerMovingControl._marker.getPosition()).toString().split('.')[0]);
        distabcess2 += distances;
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + distabcess2 + "&nbsp&nbsp" + "米"
        });
      }, false);
      /*继续移动事件*/
      AMap.event.addDomListener(document.getElementById('move'), 'click', function () {
        var lineArr2 = lineAttr.slice(markerMovingControl._currentIndex + 1)
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

