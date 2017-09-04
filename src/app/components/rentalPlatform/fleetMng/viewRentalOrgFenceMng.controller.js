/**
 * Created by riqian.ma on 1/8/17.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('viewRentalOrgFenceController', viewRentalOrgFenceController);

  /** @ngInject */
  function viewRentalOrgFenceController($rootScope,$window,$scope,$timeout,$stateParams,$http,$confirm,$uibModal,$location,treeFactory,serviceResource,RENTAL_ORG_FENCE_URL,AMAP_GEO_CODER_URL, Notification) {
    var vm = this;
    vm.rentalOrgFence={};


    var path="/rental/orgFence";
    vm.operatorInfo =$rootScope.userInfo;
    vm.cancel = function () {
      $location.path(path);

    };







    vm.rightBoxBottomHeight=20;
    vm.rightBoxTopHeightTemp=20;
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 10 -25 -5 - 90 - 15 - 7;//50 topBar的高,10间距,25面包屑导航,5间距90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      var baseBoxMapContainerHeight = baseBoxContainerHeight - 45;//地图上方的header高度
      //地图的自适应高度
      vm.baseBoxMapContainer = {
        "min-height": baseBoxMapContainerHeight + "px"
      }

      var rightBoxTopHeight=baseBoxContainerHeight/2;
      vm.rightBoxTopHeightTemp=rightBoxTopHeight-20;
      //地图的右边自适应高度
      vm.rightBoxTopHeight = {
        "min-height": vm.rightBoxTopHeightTemp+ "px"
      }
      vm.rightBoxBottomHeight=rightBoxTopHeight;
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);

//=========
    vm.updateLocationInfo=function(address,location){
      vm.selectAddress=address;

      vm.amaplongitudeNum=location[0];//选中的经度
      vm.amaplatitudeNum=location[1];//选中的维度

      //设置订单工作地址信息
      vm.rentalOrgFence.latitude=vm.amaplatitudeNum;
      vm.rentalOrgFence.longitude=vm.amaplongitudeNum;

      $scope.$apply();


    };

    /**
     * 在地图上画圆
     * @param position
     * @returns {*}
     */
    var createCircle = function (position) {
      return new AMap.Circle({
        center: position,// 圆心位置
        radius: vm.radius, //半径
        strokeColor: "#F33", //线颜色
        strokeOpacity: 1, //线透明度
        strokeWeight: 3, //线粗细度
        fillColor: "#ee2200", //填充颜色
        fillOpacity: 0.35 //填充透明度
      });
    };

    //查询设备数据并更新地图 mapid是DOM中地图放置位置的id
    vm.refreshScopeMapWithDeviceInfo=function (mapId,deviceInfo,zoomsize,centeraddr) {

      //保存之前的标注
      var beforMarkers = [];
      $LAB.script(AMAP_GEO_CODER_URL).wait(function () {

        var map=vm.initMap(mapId,zoomsize,centeraddr);

        map.on('click', function(e) {
          var  lnglatXY=[e.lnglat.getLng(), e.lnglat.getLat()];
          vm.amaplongitudeNum = e.lnglat.getLng();
          vm.amaplatitudeNum = e.lnglat.getLat();

          var geocoder = new AMap.Geocoder({
            radius: 100,
            extensions: "all"
          });

          geocoder.getAddress(lnglatXY, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
              var  address= result.regeocode.formattedAddress; //返回地址描述
              vm.updateLocationInfo(address, lnglatXY);
            }
          });

        //  map.clear();
          vm.echoFence(map);

        });



        vm.echoFence(map);



      })
    };

    var circles=[]; //存放生成的圆
    var circleEditorList=[]; //存放生成的圆编辑器

    /**
     * 回显电子围栏
     * @param map map
     */
    vm.echoFence = function(map) {

    //每次操作时候,如果圆的个数大于0,则移除第一个圆和圆编辑器
    if(circleEditorList.length>0){
      map.remove(circles[0]);
      circles.pop();

      circleEditorList[0].close();
      circleEditorList.pop();


    }


   //   map.remove(circles);


     //  if(null!=circleEditor){
     //    //  circleEditor.close();
     //     circleEditor=null;
     //    map.remove(circles);
     // //   map.remove(circleEditor);
     //  }

      //回显围栏坐标
      if(vm.amaplongitudeNum!=null&&vm.amaplatitudeNum!=null){
        var lnglatXY=[vm.amaplongitudeNum, vm.amaplatitudeNum];


        var circle = createCircle(lnglatXY);
        circle.setMap(map);



        // if(null==circleEditor){
        //  circleEditor = new AMap.CircleEditor(map, circle);
        // }

        var  circleEditor = new AMap.CircleEditor(map, circle);

        AMap.event.addListener(circleEditor, "move", function (e) {
          var location = [e.lnglat.lng, e.lnglat.lat];
          var geocoder = new AMap.Geocoder({

          });
          geocoder.getAddress(location, function (status, result) {
            if(status === 'complete' && result.info === 'OK') {
              vm.updateLocationInfo(result.regeocode.formattedAddress, location);
            }
          });
        });

        AMap.event.addListener(circleEditor, "adjust" ,function (e) {
          vm.radius = e.radius;
          $scope.$apply();
        });

        circleEditor.open();

        circles.push(circle);
        circleEditorList.push(circleEditor);
       // circle.hide();


      }
    };



    vm.createContent=function(poi) {  //信息窗体内容

      alert(11);
      var s = [];
      if(null!=poi.name){


        s.push("<b>名称：" + poi.name+"</b>");
      }
      s.push("围栏地址：" + poi.address+"</b>");
      if (null == vm.radius) {
        vm.radius = 0;
      }
      s.push("半径：" + vm.radius + "米</b>");

      return s.join("<br>");
    }

    /*设置电子围栏*/
    vm.updateScopeMap = function () {
      if (null == deviceinfo.machine || null == deviceinfo.machine.id) {
        Notification.error('当前设备未绑定车辆，无法设置电子围栏');
        return false;
      }
      if(!vm.selectAddress&&typeof(vm.selectAddress)=="undefined"){
        Notification.error('无效的地址');
        return false;
      }
      if(!vm.amaplongitudeNum&&typeof(vm.amaplongitudeNum)=="undefined"){
        Notification.error('无效的经度');
        return false;
      }
      if(!vm.amaplatitudeNum&&typeof(vm.amaplatitudeNum)=="undefined"){
        Notification.error('无效的维度');
        return false;
      }
      if(!vm.radius||typeof(vm.radius)=="undefined"||isNaN(vm.radius)){
        Notification.error('无效的半径');
        return false;
      }

      var text="距离: "+vm.radius+"(米),   地址: "+vm.selectAddress+",  坐标: 经度 "+vm.amaplongitudeNum+" 维度 "+vm.amaplatitudeNum +" "
      $confirm({text: text,title: '围栏设置确认', ok: '确定', cancel: '取消'})
        .then(function() {
          var machieId;
          if(deviceinfo.machine.id!=null){
            machieId=deviceinfo.machine.id;
          }else{
            machieId=deviceinfo.machine;
          }
          var fence={
            id:machieId,
            radius:vm.radius,
            selectAddress:vm.selectAddress,
            amaplongitudeNum:vm.amaplongitudeNum,
            amaplatitudeNum:vm.amaplatitudeNum,
            fenceStatus: '1'
          }
          //TODO 保存电子围栏
          var restResult = serviceResource.restAddRequest(MACHINE_FENCE,fence);
          restResult.then(function (data) {
              deviceinfo.machine.fenceStatus = 1;
              Notification.success("设置电子围栏成功!");
              //$uibModalInstance.close();
            },function (reason) {
              vm.errorMsg=reason.data.message;
              Notification.error(reason.data.message);
            }
          );

        });
    };

    /*取消电子围栏*/
    vm.cacheElectronicFence = function() {
      if (null == deviceinfo.machine || null == deviceinfo.machine.id) {
        Notification.error('当前设备未绑定车辆，无法设置电子围栏');
        return false;
      }
      if (deviceinfo.machine.fenceStatus == null) {
        Notification.error('当前车辆未设置围栏，无需取消');
        return false;
      }
      var text = "确认取消：" + deviceinfo.machine.licenseId + " 车的电子围栏功能吗？";
      $confirm({text: text, title: '取消电子围栏', ok: '确定', cancel: '取消'})
        .then(function () {
          var fence = {
            id: deviceinfo.machine.id,
            radius: 0,
            selectAddress: null,
            amaplongitudeNum: null,
            amaplatitudeNum: null
          };
          //取消电子围栏
          var restResult = serviceResource.restUpdateRequest(MACHINE_FENCE_CACHE, fence);
          restResult.then(function (data) {
              deviceinfo.machine.fenceStatus = 0;
              vm.selectAddress = ''; //选中的地址信息
              vm.amaplongitudeNum = null;//选中的经度
              vm.amaplatitudeNum = null;//选中的维度
              vm.radius = null; //设置的半径
              vm.initScopeMapTab(deviceinfo);
              Notification.success("取消电子围栏成功!");
            }, function (reason) {
              vm.errorMsg = reason.data.message;
              Notification.error(reason.data.message);
            }
          );
        });
    };

    //默认显示当前设备的最新地址
    vm.initScopeMapTab = function(rentalOrgFence){

      //第一个标注
      var centerAddr;

      //第一个标注
      vm.refreshScopeMapWithDeviceInfo("newOrderMap",rentalOrgFence,15,centerAddr);
    };



    // $timeout(function () {
    //   vm.initScopeMapTab();
    //   //vm.rentalOrgFence.startDate="11";
    // }, 50);


    /*监听radius变化*/
    vm.changeradius = function (radius) {
      if( "" == vm.selectAddress){
        return;
      }
      vm.initScopeMapTab();
    };
    /*回到以当前车辆为中心点的位置*/
    vm.backCurrentAdd = function () {
      // vm.zoomsize--;
      vm.initScopeMapTab();
    };


    vm.addMarker=function(map, location) {
      alert(33);
      var marker = new AMap.Marker({
        map: map,
        position: location
      });
      var infoWindow = new AMap.InfoWindow({
        content: d.formattedAddress,
        offset: {x: 0, y: -30}
      });
      marker.on("mouseover", function(e) {
        infoWindow.open(map, marker.getPosition());
      });

      AMap.event.addDomListener(marker, 'click', function () {
        infoWindow.open(vm.map, marker.getPosition());
      }, false);

      map.setCenter(location);
    }


    //构造地图对象
    vm.initMap=function(mapId,zoomsize,centeraddr){
      //初始化地图对象
      if (!AMap) {
        location.reload(false);
      }
      var amapRuler, amapScale, toolBar,overView;


      var localZoomSize = 14;  //默认缩放级别
      if (zoomsize){
        localZoomSize = zoomsize;
      }

      var localCenterAddr = [103.39,36.9];//设置中心点大概在兰州附近
      if (centeraddr){
        localCenterAddr = centeraddr;
      }


      var map = new AMap.Map(mapId, {
        resizeEnable: true,
        scrollWheel: false, // 是否可通过鼠标滚轮缩放浏览
        center: localCenterAddr,
        zooms: [4, 18]
      });
      //    alert(555);
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

      //在地图中添加圆编辑插件
      map.plugin(['AMap.CircleEditor'], function () {
      });

      //在地图中添加地理编码插件
      map.plugin(['AMap.Geocoder'], function () {

      });

      map.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch'], function () {
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
          placeSearch.search(e.poi.name,function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
              vm.placeSearch_CallBack(result);
            }
          });
          //回调函数

        });
      });

      vm.scopeMap=map;
      return map;
    };


    vm.placeSearch_CallBack = function (data) {
      var poiArr = data.poiList.pois;

      if(poiArr.length >0){
        var  lnglatXY=[poiArr[0].location.getLng(), poiArr[0].location.getLat()];
        vm.updateLocationInfo(poiArr[0].address, lnglatXY); //更新选中的地址信息

      }

    }


    //查询要修改的客户信息
    vm.getOrgFence=function(){
      var id=$stateParams.id;
      var url=RENTAL_ORG_FENCE_URL+"?id="+id;
      var rspdata = serviceResource.restCallService(url,"GET");

      rspdata.then(function (data) {
        vm.rentalOrgFence=data.content;
        vm.selectAddress=vm.rentalOrgFence.location;
        vm.amaplongitudeNum=vm.rentalOrgFence.longitude;
        vm.amaplatitudeNum=vm.rentalOrgFence.latitude;
        vm.radius=vm.rentalOrgFence.radius;

        vm.refreshScopeMapWithDeviceInfo("newOrderMap",vm.rentalOrgFence,15,null);
      },function (reason) {
        Notification.error(reason.data.message);
      })

    }

    vm.getOrgFence();


  }
})();
