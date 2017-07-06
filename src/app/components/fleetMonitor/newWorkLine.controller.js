/**
 * Created by xiaopeng on 17-4-19.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newWorkLineController', newWorkLineController);

  /** @ngInject */
  function newWorkLineController(AMAP_GEO_CODER_URL,$filter, serviceResource, $timeout,languages, Notification, WORK_POINT_URL,WORK_LINE_URL, $uibModalInstance,fleet) {
    var vm = this;
    vm.workLine = {
      fleet: fleet
    }

    vm.startPointQuery = function (fleet) {
      var restCallURL = WORK_POINT_URL;
      //车队下不会有1000个作业点，等于查询所有作业点
      restCallURL += "?page=0&size=1000&sort=id";
      // 装料点
      restCallURL += "&search_EQ_type=" + 1;
      if(fleet!=null){
        restCallURL += "&search_EQ_fleet.id=" + fleet.id;
      }else{
        Notification.error("请先选择车队!");
        return;
      }

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.startPointList = data.content;
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    };

    vm.endPointQuery = function (fleet) {
      var restCallURL = WORK_POINT_URL;
      //车队下不会有1000个作业点，等于查询所有作业点
      restCallURL += "?page=0&size=1000&sort=id";
      // 卸料点
      restCallURL += "&search_EQ_type="  + 2;
      if(fleet!=null){
        restCallURL += "&search_EQ_fleet.id=" + fleet.id;
      }else{
        Notification.error("请先选择车队!");
        return;
      }

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.endPointList = data.content;
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    };



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
          scrollWheel:false, // 是否可通过鼠标滚轮缩放浏览
          zooms: [1, 18]
        });

        map.setZoom(localZoomSize);

        //加载比例尺插件
        map.plugin(["AMap.Scale"], function () {
          amapScale = new AMap.Scale();
          map.addControl(amapScale);
        });
        //在地图中添加ToolBar插件
        map.plugin(["AMap.ToolBar"], function () {
          toolBar = new AMap.ToolBar();
          map.addControl(toolBar);
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

        AMap.service('AMap.Driving',function(){//回调函数
          //实例化Driving
          vm.driving= new AMap.Driving({
            map: map
          });
          // TODO: 使用driving对象调用驾车路径规划相关的功能
        })

        vm.map = map;

      })

    }

    vm.drawLine = function () {
      if(vm.workLine.beginPoint !=null && vm.workLine.endPoint !=null){

        var begin = [Number(vm.workLine.beginPoint.longitude),Number(vm.workLine.beginPoint.latitude)];
        var end = [Number(vm.workLine.endPoint.longitude),Number(vm.workLine.endPoint.latitude)];
        vm.driving.clear();
        vm.driving.search(begin, end, function(status, result) {
          //TODO 解析返回结果，自己生成操作界面和地图展示界面
        });

      }
    }

    vm.ok = function (workLine) {

      var restPromise = serviceResource.restAddRequest(WORK_LINE_URL, workLine);
      restPromise.then(function (data) {

          Notification.success("save success");
          $uibModalInstance.close(data.content);

        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    }

    vm.reset = function () {

    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');

    }

    $timeout(function () {
      vm.initMap("newWorkLineMap", null, null);
    }, 50);


    vm.startPointQuery(vm.workLine.fleet);
    vm.endPointQuery(vm.workLine.fleet);


  }

})();
