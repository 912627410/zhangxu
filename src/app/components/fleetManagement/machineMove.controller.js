/**
 * Created by develop on 6/29/16.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMoveController', machineMoveController);

  /** @ngInject */
  function machineMoveController($rootScope,$scope,$filter,$interval,$timeout,treeFactory, Notification,serviceResource,languages,AMAP_GEO_CODER_URL,DEVCE_DISTANCE_TOFLEET_PAGE,DEIVCIE_MOVE_ORG_URL,WORKPLANE_LIST,FLEET_MAPDATA,FLEET_CHARTDATA) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //组织树的显示
    vm.openTreeInfo= function(type) {
      treeFactory.treeShow(type);
    }

    //选中组织模型赋值
    $rootScope.$on('orgSelected', function (event, data) {
      vm.org = data;
    });

    /*
     * Map对象，实现Map功能
     * size() 获取Map元素个数
     * isEmpty() 判断Map是否为空
     * clear() 删除Map所有元素
     * put(key, value) 向Map中增加元素（key, value)
     * remove(key) 删除指定key的元素，成功返回true，失败返回false
     * get(key) 获取指定key的元素值value，失败返回null
     * element(index) 获取指定索引的元素（使用element.key，element.value获取key和value），失败返回null
     * containsKey(key) 判断Map中是否含有指定key的元素
     * containsValue(value) 判断Map中是否含有指定value的元素
     * keys() 获取Map中所有key的数组（array）
     * values() 获取Map中所有value的数组（array）
     *
     */
    function Map(){
      this.elements = new Array();

      //获取Map元素个数
      this.size = function() {
        return this.elements.length;
      },

        //判断Map是否为空
        this.isEmpty = function() {
          return (this.elements.length < 1);
        },

        //删除Map所有元素
        this.clear = function() {
          this.elements = new Array();
        },

        //向Map中增加元素（key, value)
        this.put = function(_key, _value) {
          if (this.containsKey(_key) == true) {
            if(this.containsValue(_value)){
              if(this.remove(_key) == true){
                this.elements.push( {
                  key : _key,
                  value : _value
                });
              }
            }else{
              this.elements.push( {
                key : _key,
                value : _value
              });
            }
          } else {
            this.elements.push( {
              key : _key,
              value : _value
            });
          }
        },

        //删除指定key的元素，成功返回true，失败返回false
        this.remove = function(_key) {
          var bln = false;
          try {
            for (i = 0; i < this.elements.length; i++) {
              if (this.elements[i].key == _key){
                this.elements.splice(i, 1);
                return true;
              }
            }
          }catch(e){
            bln = false;
          }
          return bln;
        },

        //获取指定key的元素值value，失败返回null
        this.get = function(_key) {
          try{
            for (var i = 0; i < this.elements.length; i++) {
              if (this.elements[i].key == _key) {
                return this.elements[i].value;
              }
            }
          }catch(e) {
            return null;
          }
        },

        //获取指定索引的元素（使用element.key，element.value获取key和value），失败返回null
        this.element = function(_index) {
          if (_index < 0 || _index >= this.elements.length){
            return null;
          }
          return this.elements[_index];
        },

        //判断Map中是否含有指定key的元素
        this.containsKey = function(_key) {
          var bln = false;
          try {
            for (i = 0; i < this.elements.length; i++) {
              if (this.elements[i].key == _key){
                bln = true;
              }
            }
          }catch(e) {
            bln = false;
          }
          return bln;
        },

        //判断Map中是否含有指定value的元素
        this.containsValue = function(_value) {
          var bln = false;
          try {
            for (i = 0; i < this.elements.length; i++) {
              if (this.elements[i].value == _value){
                bln = true;
              }
            }
          }catch(e) {
            bln = false;
          }
          return bln;
        },

        //获取Map中所有key的数组（array）
        this.keys = function() {
          var arr = new Array();
          for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].key);
          }
          return arr;
        },

        //获取Map中所有value的数组（array）
        this.values = function() {
          var arr = new Array();
          for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].value);
          }
          return arr;
        };
    }

    //查询设备数据并更新地图 mapid 是DOM中地图放置位置的id
    vm.refreshMap= function (mapId,org,zoomsize,centeraddr) {

      $scope.$emit("$destroy");

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
        var localCenterAddr = [118.439,34.995];//设置中心点大概在临工附近
        if (centeraddr){
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
        $scope.$on("$destroy",function () {
          console.log("--取消刷新--");
          $interval.cancel(ajaxRequest);
        })
        var icons = [];
        icons[0] = "assets/images/orangeMarker.png";
        icons[1] = "assets/images/greenMarker.png";
        icons[2] = "assets/images/lightgreenMarker.png";
        icons[3] = "assets/images/highgreenMarker.png";
        icons[4] = "assets/images/yellowMarker.png";
        icons[5] = "assets/images/redMarker.png";
        icons[6] = "assets/images/lightblueMarker.png";
        icons[7] = "assets/images/pinkMarker.png";
        icons[8] = "assets/images/purpleMarker.png";
        icons[9] = "assets/images/highblueMarker.png";
        icons[10] = "assets/images/blueMarker.png";
        icons[11] = "assets/images/grayMarker.png";

        var curMarkers = new AMap.Marker();
        var markersMap=new Map();

        if ($rootScope.userInfo ){
          if(org != null && org !=""){
            FLEET_MAPDATA = FLEET_MAPDATA + "?orgLabel=" +org.label;
          }
          var rspdata = serviceResource.restCallService(FLEET_MAPDATA, "QUERY");
          rspdata.then(function (data) {
            var fleetList =data;  //返回的List
            var marker = "assets/images/car_03.png";
            for(var i = 0;i < fleetList.length; i++){
              if(fleetList[i].amaplongitudeNum != null && fleetList[i].amaplatitudeNum != null){
                curMarkers = addMarkerModel(map,fleetList[i],marker);
                markersMap.put(fleetList[i].deviceNum,curMarkers);
              }
            }
          }, function (reason) {
            map.clearMap();
          });

          //10S 刷新一次
          var ajaxRequest= $interval(function () {
            if ($rootScope.userInfo ){
              var rspdata = serviceResource.restCallService(FLEET_MAPDATA, "QUERY");
              rspdata.then(function (data) {
                var fleetList =data;  //返回的List
                for(var i = 0;i < fleetList.length; i++){
                  var marker = new AMap.Marker();
                  marker = markersMap.get(fleetList[i].deviceNum);

                  var newPoint = new AMap.LngLat(fleetList[i].amaplongitudeNum,fleetList[i].amaplatitudeNum);
                  marker.moveTo(newPoint,500);

                }
              }, function (reason) {

              });

            }

          },10000);

          //workplane  读取所有 工作面信息 供map使用
          var workplaneData = serviceResource.restCallService(WORKPLANE_LIST, "QUERY");
          workplaneData.then(function (data) {
            var workplaneList = data;
            var startMarker = "assets/images/blueMarker.png";
            var endMarker = "assets/images/grayMarker.png";
            for(var i = 0; i <workplaneList.length; i++){
              if(workplaneList[i].startLongitude!=null&&workplaneList[i].endLatitude!=null){
                var path = [];
                path.push([workplaneList[i].startLongitude,workplaneList[i].startLatitude]);
                path.push([workplaneList[i].endLongitude,workplaneList[i].endLatitude]);
                map.plugin("AMap.DragRoute", function() {
                  var route = new AMap.DragRoute(map, path, AMap.DrivingPolicy.LEAST_FEE); //构造拖拽导航类
                  route.search(); //查询导航路径并开启拖拽导航
                });

                var startCircle = new AMap.Circle({
                  center: [workplaneList[i].startLongitude,workplaneList[i].startLatitude],// 圆心位置
                  radius: workplaneList[i].startRadius, //半径
                  strokeColor: "#6495ED", //线颜色
                  strokeOpacity: 1, //线透明度
                  strokeWeight: 3, //线粗细度
                  fillColor: "#A2B5CD", //填充颜色
                  fillOpacity: 0.35//填充透明度
                });

                var endCircle = new AMap.Circle({
                  center: [workplaneList[i].endLongitude,workplaneList[i].endLatitude],// 圆心位置
                  radius: workplaneList[i].endRadius, //半径
                  strokeColor: "#F33", //线颜色
                  strokeOpacity: 1, //线透明度
                  strokeWeight: 3, //线粗细度
                  fillColor: "#ee2200", //填充颜色
                  fillOpacity: 0.35//填充透明度
                });

                startCircle.setMap(map);
                endCircle.setMap(map);
              }
            }
          },function (reason) {

          })
        }

      })
    }

    //添加车辆marker
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
        icon:icon,
        offset: new AMap.Pixel(-26, -15),
        autoRotation: true
      });

      // 设置label标签
      marker.setLabel({
        offset: new AMap.Pixel(10, -22),//修改label相对于maker的位置
        content: item.orgLabel
      });

      // marker.setMap(mapObj);  //在地图上添加点
      AMap.event.addListener(marker, 'click', function () { //鼠标点击marker弹出自定义的信息窗体
        infoWindow.open(mapObj, marker.getPosition());
        var title = item.licenseId;
        var contentInfo="";
        contentInfo += "所属车队：" + item.orgLabel +"<br/>";
        contentInfo += "设备编号：" + item.deviceNum +"<br/>";
        contentInfo += languages.findKey('workingHours')+": "+(item.totalDuration==null ?'':$filter('convertToMins')(item.totalDuration))+ "<br/>";
        contentInfo += languages.findKey('currentPosition')+":" +(item.address==null ?'':item.address) + "<br/>";
        contentInfo += languages.findKey('updateTime')+": " +(item.lastDataUploadTime==null ?'':$filter('date')(item.lastDataUploadTime,'yyyy-MM-dd HH:mm:ss'))  + "<br/>";
        contentInfo += "<div class='box-footer'></div>"
        var info = createInfoWindow(AMap,title, contentInfo,mapObj);

        //设置窗体内容
        infoWindow.setContent(info);

      });

      //构建自定义信息窗体
      function createInfoWindow(AMap,title, content,mapObj) {

        var fleetMap = document.getElementById("fleetMap");
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
        btn.appendChild(document.createTextNode("调拨"));
        middle.appendChild(btn);
        btn.onclick=function moveOrg() {
          //弹出调拨panel
          //车队列表panel begin
          if(document.getElementById("panel")){
            var panel =document.getElementById("panel");
            panel.parentNode.removeChild(panel);
          }

          var pageIndex = 0;
          function queryDistanceToOrg(page,size,sort,orgLabel,item,tbody,table) {
            var defaultUrl = DEVCE_DISTANCE_TOFLEET_PAGE;
            var pageUrl = page||0;
            var sizeUrl = size||5;
            var sortUrl = sort||'id,desc';
            defaultUrl += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
            defaultUrl += '&deviceNum='+item.deviceNum;
            defaultUrl += '&search_NEQ_id='+item.orgId;

            if(null !=orgLabel && orgLabel!=''){
              defaultUrl += "&search_LIKE_label=" +orgLabel;
            }

            var rspdata = serviceResource.restCallService(defaultUrl, "GET");
            rspdata.then(function (data) {

              var rowNum=table.rows.length;
              for (var i=1;i<rowNum;i++)
              {
                table.deleteRow(i);
                rowNum=rowNum-1;
                i=i-1;
              }
              pageIndex = data.page.number;
              var orgList = data.content;
              angular.forEach(orgList,function (data) {
                var tr = document.createElement("TR");
                tr.style.height='35px';
                tr.onclick= function () {
                  var oObj = window.event.srcElement;
                  if(oObj.tagName.toLowerCase() == "td"){
                    var oTr = oObj.parentNode;
                    for(var i=0; i<table.rows.length; i++)   {
                      table.rows[i].style.backgroundColor   =   "";
                      table.rows[i].selected = false;
                    }
                    oTr.style.backgroundColor = "#CCCCFF";
                    oTr.selected = true;
                    input.value=oTr.firstChild.innerHTML;
                  }
                }
                var td1 = document.createElement("TD");
                //td1.className="text-nowrap";
                td1.appendChild(document.createTextNode(data.label));

                var td2 = document.createElement("TD");
                td2.className="text-nowrap";
                td2.appendChild(document.createTextNode(Math.round(data.distance*100)/100+" 米"));

                var td3 = document.createElement("TD");
                td3.style.display = 'none';
                td3.appendChild(document.createTextNode(data.id));
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tbody.appendChild(tr);
              });
            },function (reason) {

            })
          }

          if(!document.getElementById("panel")){
            var panel = document.createElement("div");
            panel.id="panel";
            panel.className = "info";
            panel.style.width = "300px";
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
            closeX.onclick = function () {
              panel.style.display='none';
            };
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
            middle.appendChild(row);

            var input = document.createElement("INPUT");
            input.style.marginRight='8px';
            input.placeholder='支持模糊查询';
            row.appendChild(input);
            //搜索fleet
            var btn = document.createElement("BUTTON");
            btn.appendChild(document.createTextNode("搜索"));
            btn.className='btn btn-default btn-sm';
            btn.style.marginRight='8px';
            row.appendChild(btn);

            btn.onclick = function queryOrg() {

              queryDistanceToOrg(null,null,null,input.value,item,tbody,table);

            };

            var mBtn = document.createElement("BUTTON");
            mBtn.appendChild(document.createTextNode("调拨"));
            mBtn.className = 'btn btn-warning btn-sm';
            row.appendChild(mBtn);
            mBtn.onclick =function () {
              for(var i = 0;i < table.rows.length;i++){
                if(table.rows[i].selected == true){
                  var moveOrg ={ids: [item.deviceId], "orgId": table.rows[i].lastChild.innerHTML}
                }
              }
              if(moveOrg != null){
                var restPromise = serviceResource.restUpdateRequest(DEIVCIE_MOVE_ORG_URL, moveOrg);
                restPromise.then(function (data) {
                  //刷新页面
                  vm.refreshMap("fleetMap",null,13,null);
                  Notification.success("调拨设备成功!");
                }, function (reason) {
                  Notification.error("调拨设备出错!");
                });
              }else{
                Notification.error("请在列表中选择车队!");
              }

            }

            //默认查询所有车队
            var table= document.createElement("TABLE");
            table.className='table';
            var thead  =document.createElement("THEAD");
            var thtr = document.createElement("TR");
            var th1 = document.createElement("TH");
            var th2 = document.createElement("TH");
            th1.appendChild(document.createTextNode("车队名称"));
            th2.appendChild(document.createTextNode("距离当前车辆"));
            thtr.appendChild(th1);
            thtr.appendChild(th2);
            thead.appendChild(thtr);
            table.appendChild(thead);

            var tbody = document.createElement("TBODY");
            table.appendChild(tbody);
            middle.appendChild(table);
            panel.appendChild(middle);

            queryDistanceToOrg(null,null,null,null,item,tbody,table);


            var footer = document.createElement("div");
            footer.className = 'box-footer';
            //var uib = document.createElement("uib-pagination");
            var btRow = document.createElement("div");
            btRow.className='row';
            btRow.style.margin='5px';
            var bt1 = document.createElement("BUTTON");
            bt1.appendChild(document.createTextNode("上一页"));
            bt1.style.marginRight = '80xp';
            bt1.onclick = function(){
              queryDistanceToOrg(pageIndex-1,null,null,null,item,tbody,table);
            };
            var bt2 = document.createElement("BUTTON");
            bt2.appendChild(document.createTextNode("下一页"));
            bt2.onclick = function(){
              queryDistanceToOrg(pageIndex+1,null,null,null,item,tbody,table);
            };
            btRow.appendChild(bt1)
            btRow.appendChild(bt2);
            footer.appendChild(btRow);
            panel.appendChild(footer);
            fleetMap.appendChild(panel);


          }
        };


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

      return marker;
    };

    vm.rightList = [];
    vm.leftList=[];
    vm.baseList =[];

    vm.loadFleetChart = function () {
      $scope.$emit("$destroy");

      $scope.$on("$destroy",function () {
        console.log("--取消刷新chart--");
        $interval.cancel(ajaxRequest);
      })
      var workplaneMap = new Map();
      var workplaneIndexMap = new Map();


      //workplane  读取所有 工作面信息 供map使用
      var workplaneData = serviceResource.restCallService(WORKPLANE_LIST, "QUERY");
      workplaneData.then(function (data) {
        var workplaneList = data;
        vm.plotLines = [];
        vm.baseList.push([0,0]);
        vm.baseList.push([1,workplaneList.length+1]);
        for(var i = 0; i <workplaneList.length; i++){

          var plotLine = {
            color: '#FF0000',
            width: 2,
            value: i+1,
            label:{
              text:workplaneList[i].startPoint+",路程:" +workplaneList[i].totalLength+"KM",
              align:'left',
              y: 16
            }
          };

          workplaneIndexMap.put(workplaneList[i].id,i+1);
          workplaneMap.put(workplaneList[i].id,workplaneList[i]);

          vm.plotLines.push(plotLine);
          vm.fleetChart.yAxis[0].plotLines = vm.plotLines;


        }
      },function (reason) {

      })

      //读取车队下的车辆信息，并关联工作面信息   计算当前位置
      var fleetChartData = serviceResource.restCallService(FLEET_CHARTDATA,"QUERY");
      fleetChartData.then(function (data) {
        var deviceList = data;
        for(var i =0;i< deviceList.length;i++) {
          if (deviceList[i].duration != null) {

            var workplaneId = deviceList[i].workplaneId;
            if (deviceList[i].direction == '前往卸料点途中') {
              var x = deviceList[i].duration * workplaneMap.get(workplaneId).averageSpeed / workplaneMap.get(workplaneId).totalLength ;

            } else if (deviceList[i].direction == '前往装料点途中') {
              var x = 1 -deviceList[i].duration * workplaneMap.get(workplaneId).averageSpeed / workplaneMap.get(workplaneId).totalLength ;
            }

            var y = workplaneIndexMap.get(workplaneId);
            var ramainTime = workplaneMap.get(workplaneId).totalLength / workplaneMap.get(workplaneId).averageSpeed -deviceList[i].duration;
            var ramainDistance = workplaneMap.get(workplaneId).totalLength - workplaneMap.get(workplaneId).averageSpeed *deviceList[i].duration;
            var data = {
              x:x,
              y:y,
              deviceNum:deviceList[i].deviceNum,
              orgLabel:deviceList[i].orgLabel,
              orgId:deviceList[i].orgId,
              address:deviceList[i].address,
              deviceId:deviceList[i].deviceId,
              totalDuration:deviceList[i].totalDuration,
              lastDataUploadTime:deviceList[i].lastDataUploadTime,
              remainDistance: ramainDistance,
              remainTime: ramainTime
            };

            if (deviceList[i].direction == '前往卸料点途中') {
              vm.rightList.push(data);

            } else if (deviceList[i].direction == '前往装料点途中') {
              vm.leftList.push(data);

            }
          }
        }

        vm.fleetChart.series[0].data =vm.rightList;
        vm.fleetChart.series[1].data =vm.leftList;

      },function (reason) {

      })



      //10S 刷新一次
      var ajaxRequest= $interval(function () {
        if ($rootScope.userInfo ){
          var fleetChartData = serviceResource.restCallService(FLEET_CHARTDATA,"QUERY");
          fleetChartData.then(function (data) {
            vm.rightList =[];
            vm.leftList =[];
            var deviceList = data;
            for(var i =0;i< deviceList.length;i++) {
              if (deviceList[i].duration != null) {
                var workplaneId = deviceList[i].workplaneId;
                if (deviceList[i].direction == '前往卸料点途中') {
                  var x = deviceList[i].duration * workplaneMap.get(workplaneId).averageSpeed / workplaneMap.get(workplaneId).totalLength ;

                } else if (deviceList[i].direction == '前往装料点途中') {
                  var x = 1 -deviceList[i].duration * workplaneMap.get(workplaneId).averageSpeed / workplaneMap.get(workplaneId).totalLength ;
                }
                var y = workplaneIndexMap.get(workplaneId);
                var ramainTime = workplaneMap.get(workplaneId).totalLength / workplaneMap.get(workplaneId).averageSpeed -deviceList[i].duration;
                var ramainDistance = workplaneMap.get(workplaneId).totalLength - workplaneMap.get(workplaneId).averageSpeed *deviceList[i].duration;
                var data = {
                  x:x,
                  y:y,
                  deviceNum:deviceList[i].deviceNum,
                  orgLabel:deviceList[i].orgLabel,
                  orgId:deviceList[i].orgId,
                  address:deviceList[i].address,
                  deviceId:deviceList[i].deviceId,
                  totalDuration:deviceList[i].totalDuration,
                  lastDataUploadTime:deviceList[i].lastDataUploadTime,
                  remainDistance: ramainDistance,
                  remainTime: ramainTime
                };

                if (deviceList[i].direction == '前往卸料点途中') {
                  vm.rightList.push(data);

                } else if (deviceList[i].direction == '前往装料点途中') {
                  vm.leftList.push(data);

                }
              }
            }

            vm.fleetChart.series[0].data =vm.rightList;
            vm.fleetChart.series[1].data =vm.leftList;

          },function (reason) {

          });

        }

      },5000);
    }
    vm.fleetChart = {
      options: {
        chart: {
          type : 'scatter',
          zoomType: 'xy',
          width: 1120
        },
        title :false,
        exporting :false,
        legend: {
          enabled: false
        },
        tooltip :{
          enabled: false
        },
        plotOptions: {
          series: {
            cursor: 'pointer',
            point:{
              events: {
                click:function () {
                  if(document.getElementById("menu")){
                    var menu =document.getElementById("menu");
                    menu.parentNode.removeChild(menu);
                  }

                  var fleetChart = document.getElementById('fleetChart');

                  var evt = window.event || arguments[0];

                  /*获取当前鼠标右键按下后的位置，据此定义菜单显示的位置*/
                  var rightedge = fleetChart.clientWidth - evt.clientX;
                  var bottomedge = fleetChart.clientHeight - evt.clientY;

                  var menu = document.createElement("div");
                  menu.id = "menu";
                  menu.className = "info";
                  menu.style.width = "180px";
                  menu.position = 'absolute';
                  //menu.style.left = rightedge +"px";
                  menu.style.left = evt.clientX - 300 + "px";
                  menu.style.top = evt.clientY - 320 + "px";

                  menu.border = 'solid 1px silver';
                  menu.style.visibility = "visible";


                  // 定义顶部标题
                  var top = document.createElement("div");
                  var titleD = document.createElement("div");
                  var closeX = document.createElement("img");
                  top.className = "info-top";
                  titleD.innerHTML = '车辆信息';
                  closeX.src = "http://webapi.amap.com/images/close2.gif";
                  closeX.onclick = function () {
                    menu.style.display = 'none';
                  };
                  top.appendChild(titleD);
                  top.appendChild(closeX);
                  menu.appendChild(top);

                  // 定义中部内容
                  var middle = document.createElement("div");
                  middle.className = "info-middle";
                  middle.style.backgroundColor = 'white';
                  var contentInfo="";
                  contentInfo += "所属车队：" + this.orgLabel +"<br/>";
                  contentInfo += "设备编号：" + this.deviceNum +"<br/>";
                  contentInfo += languages.findKey('workingHours')+": "+(this.totalDuration==null ?'':$filter('convertToMins')(this.totalDuration))+ "<br/>";
                  //contentInfo += languages.findKey('updateTime')+": " +(this.lastDataUploadTime==null ?'':$filter('date')(this.lastDataUploadTime,'yyyy-MM-dd HH:mm:ss'))  + "<br/>";
                  //contentInfo += "<div class='box-footer'></div>";
                  middle.innerHTML = contentInfo;

                  var btn = document.createElement("BUTTON");
                  btn.className='btn btn-warning btn-xs';
                  //btn.style.float='right';
                  btn.appendChild(document.createTextNode("调拨"));
                  var item = {
                    x:this.x,
                    y:this.y,
                    deviceNum:this.deviceNum,
                    orgLabel:this.orgLabel,
                    orgId:this.orgId,
                    address:this.address,
                    deviceId:this.deviceId,
                    totalDuration:this.totalDuration,
                    lastDataUploadTime:this.lastDataUploadTime,
                    remainDistance: this.ramainDistance,
                    remainTime: this.ramainTime
                  };

                  btn.onclick=function moveOrg() {
                    //弹出调拨panel
                    //车队列表panel begin
                    if(document.getElementById("panel")){
                      var panel =document.getElementById("panel");
                      panel.parentNode.removeChild(panel);
                    }

                    var pageIndex = 0;
                    function queryDistanceToOrg(page,size,sort,orgLabel,item,tbody,table) {
                      var defaultUrl = DEVCE_DISTANCE_TOFLEET_PAGE;
                      var pageUrl = page||0;
                      var sizeUrl = size||5;
                      var sortUrl = sort||'id,desc';
                      defaultUrl += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
                      defaultUrl += '&deviceNum='+item.deviceNum;
                      defaultUrl += '&search_NEQ_id='+item.orgId;

                      if(null !=orgLabel && orgLabel!=''){
                        defaultUrl += "&search_LIKE_label=" +orgLabel;
                      }

                      var rspdata = serviceResource.restCallService(defaultUrl, "GET");
                      rspdata.then(function (data) {

                        var rowNum=table.rows.length;
                        for (var i=1;i<rowNum;i++)
                        {
                          table.deleteRow(i);
                          rowNum=rowNum-1;
                          i=i-1;
                        }
                        pageIndex = data.page.number;
                        var orgList = data.content;
                        angular.forEach(orgList,function (data) {
                          var tr = document.createElement("TR");
                          tr.style.height='35px';
                          tr.onclick= function () {
                            var oObj = window.event.srcElement;
                            if(oObj.tagName.toLowerCase() == "td"){
                              var oTr = oObj.parentNode;
                              for(var i=0; i<table.rows.length; i++)   {
                                table.rows[i].style.backgroundColor   =   "";
                                table.rows[i].selected = false;
                              }
                              oTr.style.backgroundColor = "#CCCCFF";
                              oTr.selected = true;
                              input.value=oTr.firstChild.innerHTML;
                            }
                          }
                          var td1 = document.createElement("TD");
                          //td1.className="text-nowrap";
                          td1.appendChild(document.createTextNode(data.label));

                          var td2 = document.createElement("TD");
                          td2.className="text-nowrap";
                          td2.appendChild(document.createTextNode(Math.round(data.distance*100)/100+" 米"));

                          var td3 = document.createElement("TD");
                          td3.style.display = 'none';
                          td3.appendChild(document.createTextNode(data.id));
                          tr.appendChild(td1);
                          tr.appendChild(td2);
                          tr.appendChild(td3);
                          tbody.appendChild(tr);
                        });
                      },function (reason) {

                      })
                    }

                    if(!document.getElementById("panel")){
                      var panel = document.createElement("div");
                      panel.id ="panel";
                      panel.className = "info";
                      panel.style.width = "300px";
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
                      closeX.onclick = function () {
                        panel.style.display='none';
                      };
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
                      middle.appendChild(row);

                      var input = document.createElement("INPUT");
                      input.style.marginRight='8px';
                      input.placeholder='支持模糊查询';
                      row.appendChild(input);
                      //搜索fleet
                      var btn = document.createElement("BUTTON");
                      btn.appendChild(document.createTextNode("搜索"));
                      btn.className='btn btn-default btn-sm';
                      btn.style.marginRight='8px';
                      row.appendChild(btn);

                      btn.onclick = function queryOrg() {

                        queryDistanceToOrg(null,null,null,input.value,item,tbody,table);

                      };

                      var mBtn = document.createElement("BUTTON");
                      mBtn.appendChild(document.createTextNode("调拨"));
                      mBtn.className = 'btn btn-warning btn-sm';
                      row.appendChild(mBtn);
                      mBtn.onclick =function () {
                        for(var i = 0;i < table.rows.length;i++){
                          if(table.rows[i].selected == true){
                            var moveOrg ={ids: [item.deviceId], "orgId": table.rows[i].lastChild.innerHTML}
                          }
                        }
                        if(moveOrg != null){
                          var restPromise = serviceResource.restUpdateRequest(DEIVCIE_MOVE_ORG_URL, moveOrg);
                          restPromise.then(function (data) {
                            //刷新页面
                            vm.loadFleetChart();
                            Notification.success("调拨设备成功!");
                            //close plane
                            panel.style.display='none';
                          }, function (reason) {
                            Notification.error("调拨设备出错!");
                          });
                        }else{
                          Notification.error("请在列表中选择车队!");
                        }

                      }

                      //默认查询所有车队
                      var table= document.createElement("TABLE");
                      table.className='table';
                      var thead  =document.createElement("THEAD");
                      var thtr = document.createElement("TR");
                      var th1 = document.createElement("TH");
                      var th2 = document.createElement("TH");
                      th1.appendChild(document.createTextNode("车队名称"));
                      th2.appendChild(document.createTextNode("距离当前车辆"));
                      thtr.appendChild(th1);
                      thtr.appendChild(th2);
                      thead.appendChild(thtr);
                      table.appendChild(thead);

                      var tbody = document.createElement("TBODY");
                      table.appendChild(tbody);
                      middle.appendChild(table);
                      panel.appendChild(middle);

                      queryDistanceToOrg(null,null,null,null,item,tbody,table);


                      var footer = document.createElement("div");
                      footer.className = 'box-footer';
                      //var uib = document.createElement("uib-pagination");
                      var btRow = document.createElement("div");
                      btRow.className='row';
                      btRow.style.margin='5px';
                      var bt1 = document.createElement("BUTTON");
                      bt1.appendChild(document.createTextNode("上一页"));
                      bt1.style.marginRight = '80xp';
                      bt1.onclick = function(){
                        queryDistanceToOrg(pageIndex-1,null,null,null,item,tbody,table);
                      };
                      var bt2 = document.createElement("BUTTON");
                      bt2.appendChild(document.createTextNode("下一页"));
                      bt2.onclick = function(){
                        queryDistanceToOrg(pageIndex+1,null,null,null,item,tbody,table);
                      };
                      btRow.appendChild(bt1)
                      btRow.appendChild(bt2);
                      footer.appendChild(btRow);
                      panel.appendChild(footer);
                      fleetChart.appendChild(panel);


                    }
                  };

                  middle.appendChild(btn);

                  menu.appendChild(middle);

                  // 定义底部内容
                  var bottom = document.createElement("div");
                  bottom.className = "info-bottom";
                  bottom.style.position = 'relative';
                  bottom.style.top = '0px';
                  bottom.style.margin = '0 auto';
                  var sharp = document.createElement("img");
                  sharp.src = "http://webapi.amap.com/images/sharp.png";
                  bottom.appendChild(sharp);
                  menu.appendChild(bottom);


                  fleetChart.appendChild(menu);

                }
              }
            }
          },
          scatter: {
            marker: {
              radius: 5,
              states: {
                hover: {
                  enabled: true,
                  lineColor: 'rgb(100,100,100)'
                }
              },
              label: 11
            },
            states: {
              hover: {
                marker: {
                  enabled: false
                }
              }
            },
            tooltip: {
              enabled: false
              // headerFormat: '<b>车号:</b><br>',
              // pointFormatter: function(){
              //
              //   return "所属车队:"+"<br>" +"设备编号:"+"<br>" +"剩余距离:" +"<br>"+"预计剩余时间:" + this.x.toFixed(2)+"小时<br>" ;
              // }
            }
          }
        }
      },
      xAxis: {
        title: {
          enabled: false
        },
        labels: {
          enabled: false
        }
      },
      yAxis: [{
        title: {
          text: '装料点',
          margin: 30,
          rotation: 0
        },
        offset: 70,
        labels: {
          enabled: false
        },
        plotLines: vm.plotLines
      },{
        title: {
          text: '卸料点',
          rotation: 0
        },
        offset: 70,
        labels: {
          enabled: false
        },
        opposite: true
      }],
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 100,
        y: 70,
        floating: true,
        backgroundColor: '#FFFFFF',
        borderWidth: 1
      },
      series: [{
          data: vm.rightList,
          marker: {
            symbol: 'url(assets/images/car_right5_2.png)'
          },
          dataLabels: {
            enabled: true,
            borderRadius: 5,
            backgroundColor: 'rgba(252, 255, 197, 0.7)',
            borderWidth: 1,
            borderColor: '#AAA',
            y: -35,
            formatter: function () {
              return "所属车队:"+ this.point.orgLabel+"<br>" +"设备编号:"+this.point.deviceNum+"<br>";
            }
          }

        },{
          data: vm.leftListd,
          marker: {
            symbol: 'url(assets/images/car_left5.png)'
          },
          dataLabels: {
            enabled: true,
            borderRadius: 5,
            backgroundColor: 'rgba(252, 255, 197, 0.7)',
            borderWidth: 1,
            borderColor: '#AAA',
            y: -35,
            formatter: function () {
              return "所属车队:"+ this.point.orgLabel+"<br>" +"设备编号:"+this.point.deviceNum+"<br>"+"剩余路程:"+this.point.remainDistance.toFixed(2)+"KM<br>"+"剩余时间:"+this.point.remainTime.toFixed(2)+"H<br>";
            }
          }
        },{
          data: vm.baseList,
          marker:{
            enabled:false
          }
        }
      ]
    }

    //默认查询一次
    vm.refreshMap("fleetMap",null,13,null);

    //根据orgLabel 查询
    vm.query = function () {
      if(vm.org.label != null ){
        vm.refreshMap("fleetMap",vm.org,13,null);
      }
    }
  }
})();


