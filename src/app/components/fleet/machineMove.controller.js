/**
 * Created by develop on 6/29/16.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMoveController', machineMoveController);

  /** @ngInject */
  function machineMoveController($rootScope, $scope, $uibModal,$filter, Notification,serviceResource,languages,AMAP_GEO_CODER_URL,DEVCE_GPSDATA_BYORG,DEVCE_DISTANCE_TOORG) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.org = {label: ""};    //调拨组织
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id
    vm.moveOrg = function (device) {
      console.log(123);
    }
    //查询设备数据并更新地图 mapid 是DOM中地图放置位置的id
    vm.refreshMapWithDeviceInfo= function (mapId,deviceList,zoomsize,centeraddr) {
      $LAB.script(AMAP_GEO_CODER_URL).wait(function () {
        //初始化地图对象
        if (!AMap) {
          location.reload(false);
        }
        var amapRuler, amapScale, toolBar,overView;
        var localZoomSize = 4;  //默认缩放级别
        if (zoomsize){
          localZoomSize = zoomsize;
        }
        var localCenterAddr = [103.39,36.9];//设置中心点大概在兰州附近
        if (centeraddr){
          localCenterAddr = centeraddr;
        }
        var map = new AMap.Map(mapId, {
          resizeEnable: true,
          center: localCenterAddr,
          zooms: [localZoomSize, 18]
        });
        map.setZoom(1);
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

        //按org=9 读取 machine信息  ,fleet map使用
        if ($rootScope.userInfo ) {
          var rspdata = serviceResource.restCallService(DEVCE_GPSDATA_BYORG, "GET");
          rspdata.then(function (data) {
            var deviceGPSMap =data;  //返回的Map
            for(var key in deviceGPSMap){
              var deviceGPSList = deviceGPSMap[key];
              for (var i = 0; i < deviceGPSList.length; i++) {
                var longitude = deviceGPSList[i].amaplongitudeNum;   //经度
                var latitude = deviceGPSList[i].amaplatitudeNum;     //纬度
                if (latitude != null && longitude != null) {
                  // addMarkerModel(map,deviceGPSInfo[i],"http://webapi.amap.com/images/marker_sprite.png");
                  var marker="assets/images/orangeMarker.png";
                  if(deviceGPSList[i].accStatus=='01'){
                    marker="assets/images/greenMarker.png";
                  }
                  addMarkerModel(map,deviceGPSList[i],marker);
                }
              }
            }
          }, function (reason) {
            map.clearMap();
            Notification.error(languages.findKey('failedToGetDeviceInformation'));
          })
        }
      })
    }

    //添加带文本的点标记覆盖物
    var addMarkerModel = function(mapObj,item, icon) {
      var mapObj = mapObj;
      //实例化信息窗体
      var infoWindow = new AMap.InfoWindow({
        isCustom: true,  //使用自定义窗体
        offset: new AMap.Pixel(15, -43)//-113, -140
      });
      var marker = new AMap.Marker({
        map: mapObj,
        position: new AMap.LngLat(item.amaplongitudeNum, item.amaplatitudeNum), //基点位置
        icon:new AMap.Icon({
          image: icon,
          imageOffset: new AMap.Pixel(-15, -10)
        })
      });

      // marker.setMap(mapObj);  //在地图上添加点
      AMap.event.addListener(marker, 'click', function () { //鼠标点击marker弹出自定义的信息窗体
        infoWindow.open(mapObj, marker.getPosition());
        var title = item.organization.label;
        var contentInfo="";
        contentInfo += languages.findKey('terminalNumber')+"：" + item.deviceNum +"<br/>";
        contentInfo += languages.findKey('workingHours')+": "+(item.totalDuration==null ?'':$filter('number')(item.totalDuration,2))+ "<br/>";
        contentInfo += languages.findKey('longitude')+": "+(item.amaplongitudeNum==null ?'':$filter('number')(item.amaplongitudeNum,2))+"<br/>";
        contentInfo += languages.findKey('latitude')+": "+(item.amaplatitudeNum==null ?'':$filter('number')(item.amaplatitudeNum,2))+"<br/>";
        contentInfo += languages.findKey('currentPosition')+":" +(item.address==null ?'':item.address) + "<br/>";
        contentInfo += languages.findKey('updateTime')+": " +(item.lastDataUploadTime==null ?'':$filter('date')(item.lastDataUploadTime,'yyyy-MM-dd HH:mm:ss'))  + "<br/>";
        contentInfo += "<div class='box-footer'></div>"
        var info = createInfoWindow(AMap,title, contentInfo,mapObj);

        //设置窗体内容
        infoWindow.setContent(info);

        var fleetMap = document.getElementById("fleetMap");
        var panel = document.createElement("div");
        panel.className = "info";
        panel.style.width = "260px";
        panel.position ='absolute';
        panel.style.left = '80px';
        panel.border= 'solid 1px silver';

        // 定义顶部标题
        var top = document.createElement("div");
        var titleD = document.createElement("div");
        var closeX = document.createElement("img");
        top.className = "info-top";
        titleD.innerHTML = '车队列表';
        closeX.src = "http://webapi.amap.com/images/close2.gif";
        closeX.onclick = closeInfoWindow;
        top.appendChild(titleD);
        top.appendChild(closeX);
        panel.appendChild(top);

        // 定义中部内容
        var middle = document.createElement("div");
        middle.className = "info-middle";
        middle.style.backgroundColor = 'white';
        var row = document.createElement("div");
        row.className='row';
        row.style.margin='5px';
        var input = document.createElement("INPUT");
        input.style.marginRight='8px';
        input.placeholder='可根据编号或名称查询';
        row.appendChild(input);
        var btn = document.createElement("BUTTON");
        btn.onclick=function queryOrg() {
          console.log(input.value);
          var rowNum=table.rows.length;
          for (var i=0;i<rowNum;i++)
          {
            table.deleteRow(i);
            rowNum=rowNum-1;
            i=i-1;
          }

          if(null != input.value){
            DEVCE_DISTANCE_TOORG +="?orgNoOrLabel=" +input.value;
          }
          var rspdata = serviceResource.restCallService(DEVCE_DISTANCE_TOORG, "GET");
          rspdata.then(function (data) {
            var orgList = data;
            angular.forEach(orgList,function (data) {
              var tr = document.createElement("TR");
              tr.style.height='35px';
              var td1 = document.createElement("TD");
              td1.appendChild(document.createTextNode(data.label));

              var td2 = document.createElement("TD");
              td2.appendChild(document.createTextNode("距离："+data.id+" 米"));

              var btn = document.createElement("BUTTON");
              btn.className='btn btn-warning btn-xs';
              btn.style.float='right';
              btn.onclick=function moveOrg(device,org) {
                //弹出调拨panel
                console.log("moveOrg");
              };
              var t = document.createTextNode("调拨");
              btn.appendChild(t);

              var td3 = document.createElement("TD");
              td3.appendChild(btn);

              tr.appendChild(td1);
              tr.appendChild(td2);
              tr.appendChild(td3);
              table.appendChild(tr)
            });
          },function (reason) {

          })

        };
        var t = document.createTextNode("搜索");
        btn.appendChild(t);
        row.appendChild(btn);
        middle.appendChild(row);

        //默认查询5个最近的车队
        var table= document.createElement("TABLE");
        if(null != input.value){
          DEVCE_DISTANCE_TOORG +="?orgLabel=" +input.value;
        }
        var rspdata = serviceResource.restCallService(DEVCE_DISTANCE_TOORG, "QUERY");
        rspdata.then(function (data) {
          console.log(12345);
          var orgList = data;
          angular.forEach(orgList,function (data) {
            var tr = document.createElement("TR");
            tr.style.height='35px';
            var td1 = document.createElement("TD");
            td1.appendChild(document.createTextNode(data.label));

            var td2 = document.createElement("TD");
            td2.appendChild(document.createTextNode("距离："+data.id+" 米"));

            var btn = document.createElement("BUTTON");
            btn.className='btn btn-warning btn-xs';
            btn.style.float='right';
            btn.onclick=function moveOrg(device,org) {
              //弹出调拨panel
              console.log("moveOrg");
            };
            var t = document.createTextNode("调拨");
            btn.appendChild(t);

            var td3 = document.createElement("TD");
            td3.appendChild(btn);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            table.appendChild(tr)
          });
        },function (reason) {

        })

        middle.appendChild(table);

        panel.appendChild(middle);

        fleetMap.appendChild(panel);

      });

      //构建自定义信息窗体
      function createInfoWindow(AMap,title, content,mapObj) {

        var info = document.createElement("div");
        info.className = "info";
        //可以通过下面的方式修改自定义窗体的宽高
        info.style.width = "220px";

        // 定义顶部标题
        var top = document.createElement("div");
        var titleD = document.createElement("div");
        var closeX = document.createElement("img");
        top.className = "info-top";
        titleD.innerHTML = title;
        closeX.src = "http://webapi.amap.com/images/close2.gif";
        closeX.onclick = closeInfoWindow;


        top.appendChild(titleD);
        top.appendChild(closeX);
        info.appendChild(top);

        // 定义中部内容
        var middle = document.createElement("div");
        middle.className = "info-middle";
        middle.style.backgroundColor = 'white';
        middle.innerHTML = content;
        info.appendChild(middle);
        var btn = document.createElement("BUTTON");
        btn.className='btn btn-warning btn-xs';
        btn.style.float='right';
        btn.onclick=function moveOrg(mapObj) {
          //弹出调拨panel
          console.log(123);
        };
        var t = document.createTextNode("调拨");
        btn.appendChild(t);
        middle.appendChild(btn);

        // 定义底部内容
        var bottom = document.createElement("div");
        bottom.className = "info-bottom";
        bottom.style.position = 'relative';
        bottom.style.top = '0px';
        bottom.style.margin = '0 auto';
        var sharp = document.createElement("img");
        sharp.src = "http://webapi.amap.com/images/sharp.png";
        bottom.appendChild(sharp);
        info.appendChild(bottom);
        return info;
      };

      function closeInfoWindow() {
        mapObj.clearInfoWindow();

      };

    };

    vm.refreshMapWithDeviceInfo("fleetMap",null,4);

  }
})();


