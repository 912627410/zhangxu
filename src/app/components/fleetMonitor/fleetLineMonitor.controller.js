/**
 * Created by xiaopeng on 17-5-23.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('fleetLineMonitorController', fleetLineMonitorController);

  /** @ngInject */
  function fleetLineMonitorController($rootScope,$scope,$filter,WORK_LINE_URL,WORK_INITIAL_MONITOR,Map,fleetTreeFactory, WEBSOCKET_URL,Notification,serviceResource,languages) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    var fleetMonitorUrl;
    vm.fleet = $rootScope.fleetChart[0];

    vm.lineColor = [];
    for(var i = 0;i < 21;i++) {
      if(i%10 == 0 ) {
        vm.lineColor.push("#ff0000");
      } else {
        vm.lineColor.push("#999");
      }
    }

    vm.openFleetTree = function () {
      fleetTreeFactory.treeShow(function (selectedItem) {
        vm.fleet =selectedItem;
        if(fleetMonitorUrl){fleetMonitorUrl.close();}
        vm.initMonitorQuery();
      });
    }

    vm.initLineQuery = function (fleet) {
      var restCallURL = WORK_LINE_URL;

      restCallURL += "?page=0&size=1000&sort=id";
      //只显示启用的路线
      restCallURL += "&search_EQ_status=" + 1;
      restCallURL += "&search_EQ_ifMonitor=" + 1;

      if(fleet!=null){
        restCallURL += "&search_EQ_fleet.id=" + fleet.id;
      }

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
          vm.workLineList = data.content;

          var lineLength = vm.workLineList.length;
          if(lineLength>0) {
            vm.chartTop = [];
            for(var i = 0 ;i < lineLength;i++){
              vm.chartTop.push(380*i +20);
            }
          }
          vm.chartsH = parseInt(vm.chartTop[lineLength-1] + 400);
          document.getElementById("fleetChart").style.height = vm.chartsH+'px';

          vm.refreshChart("fleetChart", vm.workLineList);

        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )

    };

    /**
     * 初始化数据
     */
    vm.initMonitorQuery = function () {
      var restCallURL = WORK_INITIAL_MONITOR + "?fleetId=" + vm.fleet.id;
      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
        vm.initMonitorList = data.content;
        var listLength = vm.initMonitorList.length;
        for(var n = 0;n < listLength; n++){
          var monitorVo = vm.initMonitorList[n];
          vm.updateChart(monitorVo);
        }
      });
    };
    vm.initMonitorQuery();

    vm.refreshChart = function (chartId, lineList) {

      vm.fleetChart = echarts.init(document.getElementById(chartId));

       vm.option = {
        tooltip: {
          position: 'top'
        },
        title: [],
        singleAxis: [],
        series: []
      };

      vm.mapList = [];

      if(lineList.length > 0 ){
        echarts.util.each(lineList, function (line, idx) {
          //料点标题位置
          vm.option.title.push({
            textBaseline: 'middle',
            top: vm.chartTop[idx]+ 120,
            text: line.beginPoint.name,
            left: '1%'
          },{
            textBaseline: 'middle',
            left: '48%',
            top: vm.chartTop[idx]+ 120,
            text: line.endPoint.name
          },{
            textBaseline: 'middle',
            right: '0',
            top: vm.chartTop[idx]+ 120,
            text: line.beginPoint.name
          });
          //x轴刻度尺
          vm.option.singleAxis.push({
            left: 100,
            type: 'value',
            boundaryGap: false,
            splitLine:{
              show:true,
              lineStyle:{
                width: 2,
                type:'dotted',
                color: vm.lineColor
              }
            },
            min: -1,
            max: 1,
            interval: 0.1,
            top: vm.chartTop[idx],
            height: 300
          });
          vm.option.series.push({
            singleAxisIndex: idx,
            coordinateSystem: 'singleAxis',
            type: 'scatter',
            label: {
              normal: {
                show: true,
                position: 'top',
                formatter: '{b}'
              }
            },
            tooltip : {
              formatter:  function (params) {
                return params.name + '<br>' + params.data.content;
              }
            },
            data: [],
            symbolSize: function (dataItem) {
              return dataItem[1] * 4;
            }
          });

          vm.mapList.push(angular.copy(Map));

        });

      } else {
        Notification.warning("请先维护车队作业路线!");

      }

      vm.fleetChart.setOption(vm.option);

      vm.openMonitor(lineList);
      vm.initMonitorQuery();
    };



    // 使用刚指定的配置项和数据显示图表。


    // open
    vm.openMonitor = function (lineList) {

      if(lineList ==null || lineList.length < 1){
        return ;
      }

      // websocket monitor
      fleetMonitorUrl = new WebSocket(WEBSOCKET_URL + "webSocketServer/fleetRealTimeMonitor?token=" + vm.operatorInfo.authtoken);

      fleetMonitorUrl.onerror = function (evt) {
        Notification.error("WebSocket Error!");
      };


      fleetMonitorUrl.onmessage = function (evt) {
        var monitorVo = JSON.parse(evt.data);
        if(monitorVo.fleet != vm.fleet.id ){
          return;
        }

        vm.updateChart(monitorVo);
      };

    };

    /**
     * 更新图表
     * @param monitorVo
       */
    vm.updateChart = function (monitorVo) {
      if(monitorVo.pointType ==2){
        for(var i =0 ;i < vm.workLineList.length; i++){
          //在料点装料
          if(monitorVo.inPoint == vm.workLineList[i].beginPoint.id ){
            var map = angular.copy(Map);
            map = vm.mapList[i];

            var value = {
              symbol: 'image://assets/images/car_right5_2.png',
              symbolOffset: [0,150 - 50*(map.getIndex(monitorVo.deviceNum)%6)],
              name: monitorVo.deviceNum,
              value: [-1, 12],
              content: "在" + vm.workLineList[i].beginPoint.name
            };

            map.put(monitorVo.deviceNum, value);
            removeFromOtherMap(vm.mapList, i, monitorVo.deviceNum);
            break;
          }

          //在料点卸料
          if(monitorVo.inPoint == vm.workLineList[i].endPoint.id){
            var map = angular.copy(Map);
            map = vm.mapList[i];
            var value = {
              symbol: 'image://assets/images/car_right5_1.png',
              symbolOffset: [0,150 - 50*(map.getIndex(monitorVo.deviceNum)%6)],
              name: monitorVo.deviceNum,
              value: [0, 12],
              content: "在" + vm.workLineList[i].endPoint.name
            };
            map.put(monitorVo.deviceNum, value);
            removeFromOtherMap(vm.mapList, i, monitorVo.deviceNum);
            break;
          }

        }
      }

      //从料点出来  必须有里程
      if(monitorVo.pointType==1 && monitorVo.mileage !=null ){
        for(var i =0 ;i < vm.workLineList.length; i++){
          if(monitorVo.outPoint != null){
            if(monitorVo.outPoint == vm.workLineList[i].beginPoint.id ){
              var map = angular.copy(Map);
              map = vm.mapList[i];
              var percent = monitorVo.mileage/10*1000/vm.workLineList[i].distance > 1 ? 1 : monitorVo.mileage/10*1000/vm.workLineList[i].distance;

              var value = {
                symbol: 'image://assets/images/car_right5_2.png',
                symbolOffset: [0,150 - 50*(map.getIndex(monitorVo.deviceNum)%6)],
                name: monitorVo.deviceNum,
                value: [percent -1, 12],
                content: "离开" + vm.workLineList[i].beginPoint.name + monitorVo.mileage/10 + "km"
              };

              map.put(monitorVo.deviceNum, value);
              removeFromOtherMap(vm.mapList, i, monitorVo.deviceNum);
              break;
            }

            // form out
            if(monitorVo.outPoint == vm.workLineList[i].endPoint.id){
              var map = angular.copy(Map);
              map = vm.mapList[i];
              var percent = monitorVo.mileage/10*1000/vm.workLineList[i].distance >= 1 ? 1 : monitorVo.mileage/10*1000/vm.workLineList[i].distance;

              var value = {
                symbol: 'image://assets/images/car_right5_1.png',
                symbolOffset: [0,150 - 50*(map.getIndex(monitorVo.deviceNum)%6)],
                name: monitorVo.deviceNum,
                value: [percent, 12],
                content: "离开" + vm.workLineList[i].endPoint.name + monitorVo.mileage/10 + "km"

              };
              map.put(monitorVo.deviceNum, value);
              removeFromOtherMap(vm.mapList, i, monitorVo.deviceNum);
              break;
            }
          }
        }
      }
      for(var i=0; i < vm.mapList.length; i++){
        vm.option.series[i].data = vm.mapList[i].values();

      }

      vm.fleetChart.setOption(vm.option);
    };

    var removeFromOtherMap = function (list, inMapIndex, key) {

      for(var i =0;i < list.length; i++){
        if(inMapIndex!= i){
          var map = list[i];
          map.remove(key)
        }
      }

    };


    $scope.$on("$destroy",function () {
      if(fleetMonitorUrl){fleetMonitorUrl.close();}
    });

    vm.initLineQuery(vm.fleet);

  }
})();