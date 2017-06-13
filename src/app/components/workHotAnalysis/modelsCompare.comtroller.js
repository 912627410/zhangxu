/**
 * Created by songyutao on 17-6-5.
 */
(function(){
  'use strict';

  angular
    .module('GPSCloud')
    .controller('modelsCompareController',modelsCompareController);

  function modelsCompareController($scope,$http,Notification,GET_MACHINE_TYPE_URL,START_HEAT_QUERY,SALES_HEAT_QUERY,serviceResource,AVG_WORK_HOUR_QUERY_MONTH,
                                   AVG_WORK_HOUR_QUERY_QUARTER,AVG_WORK_HOUR_QUERY_DATE){

    var vm = this;

    vm.quarterQuery=true;
    vm.monthQuery = false;
    vm.dayQuery = false;
    vm.hidden = true;
    vm.comparedQuery = true;
    vm.singleQuery = false;
    vm.comparedType = false;
    vm.heatType1 = "1";

    vm.dateType1 = "1";
    vm.dateType2 = "201702";
    vm.hours=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    vm.hour="2";
    //获取车型种类
    // $http.get(GET_MACHINE_TYPE_URL).then(function (type) {
    //   vm.machineType=type.data;
    // });
    //装载机型号
    $http.get(GET_MACHINE_TYPE_URL+'?type=1').then(function (type1) {
      vm.models1=type1.data;
      vm.vehicleType1 = vm.models1[0].name;
      vm.vehicleType2 = vm.models1[0].name;
      //页面初始化默认查询2017年第二季度热度范围为2小时的装载机某型号的开工热度分布
      vm.query(null,null,1,201702,null,2,1,vm.vehicleType1,1);
    });
    //挖掘机型号
    $http.get(GET_MACHINE_TYPE_URL+'?type=2').then(function (type2) {
      vm.models2=type2.data;
    });
    //重机型号
    // $http.get(GET_MACHINE_TYPE_URL+'?type=3').then(function (type3) {
    //   vm.models3=type3.data;
    // });
    vm.machineType1 = "1";
    vm.machineType2 = "1";
    vm.option1=true;
    vm.option3=true;
    //触发选择车辆类型对应的型号--上
    vm.change1 = function(machineType1){
      if(machineType1==1){
        vm.option1=true;
        vm.option2=false;
        vm.option3=false;
        vm.vehicleType1 = vm.models1[0].name;
      } else if(machineType1==2){
        vm.option1=false;
        vm.option2=true;
        vm.option3=false;
        vm.vehicleType1 = vm.models2[0].name;
      }else if(machineType1==3){
        vm.option1=false;
        vm.option2=false;
        vm.option3=true;
        vm.vehicleType1 = vm.models3[0].name;
      }
    }
    //触发选择车辆类型对应的型号--下
    vm.change2 = function(machineType1){
      if(machineType1==1){
        vm.option3=true;
        vm.option4=false;
        vm.option5=false;
        vm.vehicleType2 = vm.models1[0].name;
      } else if(machineType1==2){
        vm.option3=false;
        vm.option4=true;
        vm.option5=false;
        vm.vehicleType2 = vm.models2[0].name;
      }else if(machineType1==3){
        vm.option3=false;
        vm.option4=false;
        vm.option5=true;
        vm.vehicleType2 = vm.models3[0].name;
      }
    }
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);
    vm.startDate = startDate;
    //触发选择查询周期显示对应的周期数据
    vm.change=function(dateType1){
      if(dateType1==2){
        vm.quarterQuery=false;
        vm.monthQuery = true;
        vm.dayQuery = false;
        vm.hidden = true;
        vm.startDateDeviceData = null;
        vm.endDateDeviceData = null;
        vm.dateType2 = null;
        vm.monthDateDeviceData = new Date();
      }else if(dateType1==3){
        vm.quarterQuery=false;
        vm.monthQuery = false;
        vm.dayQuery = true;
        vm.hidden = false;
        vm.dateType2 = null;
        vm.startDateDeviceData = startDate;
        vm.endDateDeviceData = new Date();
        vm.monthDateDeviceData = null;
      }else if(dateType1==1){
        vm.quarterQuery=true;
        vm.monthQuery = false;
        vm.dayQuery = false;
        vm.hidden = true;
        vm.dateType2 = "201702";
        vm.startDateDeviceData = null;
        vm.endDateDeviceData = null;
        vm.monthDateDeviceData = null;
      }
    }
    //单一和对比车型的触发切换
    vm.toggle = function () {
      vm.comparedQuery=!vm.comparedQuery;
      vm.singleQuery=!vm.singleQuery;
      vm.comparedType = !vm.comparedType;
      vm.reset();
    }

    //date picker
    vm.monthDateOpenStatusDeviceData = {
      opened: false
    };
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.endDateOpenStatusDeviceData = {
      opened: false
    };
    vm.monthDateOpenDeviceData = function ($event) {
      vm.monthDateOpenStatusDeviceData.opened = true;
    };
    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.endDateOpenDeviceData = function ($event) {
      vm.endDateOpenStatusDeviceData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };
    vm.dateOptions1 = {
      formatYear: 'yyyy',
      startingDay: 1,
      minMode: 'month'
    };
    //初始化图表
    vm.echartsInit = function (id) {
      var item = echarts.init(document.getElementById(id));
      return item;
    }
    //开工热度地图
    var chinaOption1 = {
      title: {
        text: '车辆开工热度分布',
        textStyle:{
          fontSize: 26,
        },
        subtext: '全国',
        subtextStyle:{
          fontSize: 17,
        },
        top:'3%',
        left: 'center'
      },
      tooltip: [
        {
          trigger: 'item',
          backgroundColor: 'rgba(219,219,216,0.8)',
          textStyle: {
            color: '#333333'
          },
          formatter: function(params) {
            if(params.componentSubType == 'map') {
              var unit =  '%' ;
              var name = '开工率';

              if(params.value) {
                return params.data.name + '<br />'
                  + name + '：' +  params.data.value + unit +  '<br />'
                  + '车辆数量：' + params.data.count + ' 台/天';
              }
              return params.name + '<br />'
                + name + '：' + 0 + unit +  '<br />'
                + '车辆数量：' + 0 + ' 台/天';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        orient: 'vertical',
        // top: 'bottom',
        bottom:20,
        right: 20,
        itemGap: 30,
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max:100,
        left: 10,

        calculable: true,
        precision: 2,
        seriesIndex: [0],
        // color: ['#075e89','#FFFFFF'],
        color: ['#075e89','#f6f3d2'],
        text: ['高', '低']
      },
      geo: {
        map: 'china',
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: true
          }
        },
        roam:true,
        scaleLimit: {
          min: 1
        }
      },
      series: [
        {
          name: '开工热度',
          type: 'map',
          map: 'china',
          roam:true,
          scaleLimit: {
            min: 1
          },
          showLegendSymbol: false,
          label: {
            // normal: {
            //   show: true
            // },
            emphasis: {
              show: true
            }
          },
          data:[
            {
              "name": "湖北省",
              "value": 70.662,
              "count": 144
            },
            {
              "name": "河北省",
              "value": 80.745,
              "count": 544
            },
            {
              "name": "海南省",
              "value": 82.887,
              "count": 58
            },
            {
              "name": "黑龙江省",
              "value": 75.943,
              "count": 69
            },
            {
              "name": "吉林省",
              "value": 62.647,
              "count": 61
            },
            {
              "name": "辽宁省",
              "value": 67.775,
              "count": 151
            },
            {
              "name": "广东省",
              "value": 76.916,
              "count": 187
            },
            {
              "name": "四川省",
              "value": 70.114,
              "count": 138
            },
            {
              "name": "安徽省",
              "value": 72.144,
              "count": 258
            },
            {
              "name": "甘肃省",
              "value": 55.917,
              "count": 124
            },
            {
              "name": "湖南省",
              "value": 61.84,
              "count": 107
            },
            {
              "name": "云南省",
              "value": 70.934,
              "count": 422
            },
            {
              "name": "河南省",
              "value": 76.429,
              "count": 349
            },
            {
              "name": "江苏省",
              "value": 77.98,
              "count": 150
            },
            {
              "name": "天津市",
              "value": 62.743,
              "count": 7
            },
            {
              "name": "澳門特別行政區",
              "value": 100,
              "count": 1
            },
            {
              "name": "山西省",
              "value": 69.343,
              "count": 412
            },
            {
              "name": "陕西省",
              "value": 70.046,
              "count": 133
            },
            {
              "name": "山东省",
              "value": 48.265,
              "count": 908
            },
            {
              "name": "上海市",
              "value": 90.217,
              "count": 2
            },
            {
              "name": "西藏自治区",
              "value": 67.736,
              "count": 261
            },
            {
              "name": "宁夏回族自治区",
              "value": 64.619,
              "count": 51
            },
            {
              "name": "北京市",
              "value": 67.644,
              "count": 29
            },
            {
              "name": "江西省",
              "value": 68.092,
              "count": 143
            },
            {
              "name": "浙江省",
              "value": 74.838,
              "count": 81
            },
            {
              "name": "青海省",
              "value": 51.224,
              "count": 34
            },
            {
              "name": "贵州省",
              "value": 68.675,
              "count": 204
            },
            {
              "name": "重庆市",
              "value": 70.31,
              "count": 30
            },
            {
              "name": "内蒙古自治区",
              "value": 63.199,
              "count": 184
            },
            {
              "name": "新疆维吾尔自治区",
              "value": 69.107,
              "count": 41
            },
            {
              "name": "福建省",
              "value": 69.255,
              "count": 88
            },
            {
              "name": "广西壮族自治区",
              "value": 71.892,
              "count": 93
            }
          ]
        }
      ]
    };
    //销售热度地图
    var chinaOption2 = {
      title: {
        text: '车辆销售热度分布',
        textStyle:{
          fontSize: 21,
        },
        subtext: '全国',
        subtextStyle:{
          fontSize: 12,
        },
        top:'3%',
        left: 'left'
      },
      tooltip: [
        {
          trigger: 'item',
          backgroundColor: 'rgba(219,219,216,0.8)',
          textStyle: {
            color: '#333333'
          },
          formatter: function(params) {
            if(params.componentSubType == 'map') {
              if(params.value) {
                return params.data.name + '<br />'
                  + '车辆数量：' + params.data.value + ' 台';
              }
              return params.name + '<br />'
                + '车辆数量：' + 0 + ' 台';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        orient: 'vertical',
        // top: 'bottom',
        bottom:20,
        right: 20,
        itemGap: 30,
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max:100,
        left: 10,

        calculable: true,
        precision: 2,
        seriesIndex: [0],
        color: ['orangered','yellow','lightskyblue'],
        text: ['高', '低']
      },
      geo: {
        map: 'china',
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: true
          }
        },
        roam:true,
        scaleLimit: {
          min: 1
        }
      },
      series: [
        {
          name: '销售热度',
          type: 'map',
          map: 'china',
          roam:true,
          scaleLimit: {
            min: 1
          },
          showLegendSymbol: false,
          label: {
            emphasis: {
              show: true
            }
          },
          data:[
            {
              "name": "山西省",
              "value": 174,
              "count": null
            },
            {
              "name": "陕西省",
              "value": 90,
              "count": null
            },
            {
              "name": "山东省",
              "value": 406,
              "count": null
            },
            {
              "name": "湖北省",
              "value": 66,
              "count": null
            },
            {
              "name": "河北省",
              "value": 201,
              "count": null
            },
            {
              "name": "海南省",
              "value": 23,
              "count": null
            },
            {
              "name": "黑龙江省",
              "value": 37,
              "count": null
            },
            {
              "name": "吉林省",
              "value": 43,
              "count": null
            },
            {
              "name": "辽宁省",
              "value": 73,
              "count": null
            },
            {
              "name": "广东省",
              "value": 56,
              "count": null
            },
            {
              "name": "上海市",
              "value": 1,
              "count": null
            },
            {
              "name": "西藏自治区",
              "value": 200,
              "count": null
            },
            {
              "name": "宁夏回族自治区",
              "value": 27,
              "count": null
            },
            {
              "name": "北京市",
              "value": 15,
              "count": null
            },
            {
              "name": "四川省",
              "value": 61,
              "count": null
            },
            {
              "name": "安徽省",
              "value": 118,
              "count": null
            },
            {
              "name": "甘肃省",
              "value": 85,
              "count": null
            },
            {
              "name": "湖南省",
              "value": 65,
              "count": null
            },
            {
              "name": "云南省",
              "value": 135,
              "count": null
            },
            {
              "name": "河南省",
              "value": 215,
              "count": null
            },
            {
              "name": "江苏省",
              "value": 59,
              "count": null
            },
            {
              "name": "天津市",
              "value": 2,
              "count": null
            },
            {
              "name": "贵州省",
              "value": 93,
              "count": null
            },
            {
              "name": "重庆市",
              "value": 11,
              "count": null
            },
            {
              "name": "江西省",
              "value": 66,
              "count": null
            },
            {
              "name": "浙江省",
              "value": 31,
              "count": null
            },
            {
              "name": "青海省",
              "value": 23,
              "count": null
            },
            {
              "name": "内蒙古自治区",
              "value": 90,
              "count": null
            },
            {
              "name": "新疆维吾尔自治区",
              "value": 20,
              "count": null
            },
            {
              "name": "福建省",
              "value": 66,
              "count": null
            },
            {
              "name": "广西壮族自治区",
              "value": 37,
              "count": null
            }
          ]
        }
      ]
    };
    //开工热度城市地图
    var cityOption1 = {
      title: {
        text: '开工热度省级地图',
        left: 'center',
        top:'3%',
        textStyle:{
          color:'#000',
          fontSize: 20,
        }
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max: 200,
        left: 20,
        bottom: 15,
        calculable: true,
        precision: 2,
        seriesIndex: [0],
        color: ['#075e89','#f6f3d2'],
        text: ['高', '低']
      },
      tooltip: [
        {
          trigger: 'item',
          backgroundColor: 'rgba(219,219,216,0.8)',
          textStyle: {
            color: '#333333'
          },
          formatter: function(params) {
            if(params.componentSubType == 'map') {
              var unit =  '%' ;
              var name = '开工率';

              if(params.value) {
                return params.data.name + '<br />'
                  + name + '：' +  params.data.value + unit +  '<br />'
                  + '车辆数量：' + params.data.count + ' 台/天';
              }
              return params.name + '<br />'
                + name + '：' + 0 + unit +  '<br />'
                + '车辆数量：' + 0 + ' 台/天';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        itemSize: 20,
        itemGap: 30,
        top: 'bottom',
        feature: {
          saveAsImage: {}
        }
      },
      series: [
        {
          type: 'map',
          mapType: 'china',
          label: {
            emphasis: {
              show: true
            }
          },
          roam:true,
          scaleLimit: {
            min: 1
          },
          itemStyle: {
            normal: {
            },
            emphasis: {
              areaColor: '#389BB7',
              borderWidth: 0
            }
          },
          animation: false,
          data:''
        }
      ]
    };
    //销售热度城市地图
    var cityOption2 = {
      title: {
        text: '销售热度省级地图',
        left: 'center',
        top:'3%',
        textStyle:{
          fontSize: 20,
          color:'#000'
        }
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max: 200,
        left: 20,
        bottom: 15,
        calculable: true,
        precision: 2,
        seriesIndex: [0],
        color: ['orangered','yellow','lightskyblue'],
        text: ['高', '低']
      },
      tooltip: [
        {
          trigger: 'item',
          backgroundColor: 'rgba(219,219,216,0.8)',
          textStyle: {
            color: '#333333'
          },
          formatter: function(params) {
            if(params.componentSubType == 'map') {
              if(params.value) {
                return params.data.name + '<br />'
                  + '车辆数量：' + params.data.value + ' 台';
              }
              return params.name + '<br />'
                + '车辆数量：' + 0 + ' 台';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        itemSize: 20,
        itemGap: 30,
        top: 'bottom',
        feature: {
          saveAsImage: {}
        }
      },
      series: [
        {
          type: 'map',
          mapType: 'china',
          label: {
            emphasis: {
              show: true
            }
          },
          roam:true,
          scaleLimit: {
            min: 1
          },
          itemStyle: {
            normal: {
            },
            emphasis: {
              areaColor: '#389BB7',
              borderWidth: 0
            }
          },
          animation: false,
          data:''
        }
      ]
    };
    //单一车型查询
    vm.query = function(startDate,endDate,dateType1,dateType2,monthDate,hours,machineType1,vehicleType1,heatType1){
      if(null==heatType1) {
        Notification.warning({message: '请选择单一车型状态下查询相关参数'});
        return;
      }
      //转换月份和日期格式
      if(monthDate){
        var month = monthDate.getMonth() +1;
        if(month<10){
          var monthDateFormated = monthDate.getFullYear() +'0'+ month;
        }else{
          monthDateFormated = ''+monthDate.getFullYear() + month;
        }
      }
      if(startDate && endDate){
        var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
        var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
        var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
        var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
        //计算查询日期时上周期的起止时间
        var beforeEndDate = startDate;//上周期的结束时间
        var beforeStartDate = endDate;//上周期的开始时间
        var n = beforeStartDate.getDate()-beforeEndDate.getDate();
        beforeStartDate.setDate(beforeEndDate.getDate()-n);
        var beforeStartDateFormated = beforeStartDate.getFullYear() + '-' + (beforeStartDate.getMonth() + 1) + '-' + beforeStartDate.getDate();
        var beforeEndDateFormated = beforeEndDate.getFullYear() + '-' + (beforeEndDate.getMonth() + 1) + '-' + beforeEndDate.getDate();
      }

      if(heatType1==1){//开工
        var mapOption1= chinaOption1;
        var restCallURL = START_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?workRateQuarter=" + dateType2 + '&machineType=' + machineType1 + '&modelType=' + vehicleType1 + '&hourScope=' + hours;
        }
        if(dateType1==2){
          restCallURL += "month?workRateMonth=" + monthDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1 + '&hourScope=' + hours;
        }
        if(dateType1==3){
          restCallURL += "date?startDate=" + startDateFormated + "&endDate=" + endDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1 + '&hourScope=' + hours;
        }
      }else if(heatType1==0){//销售
        var mapOption1= chinaOption2;
        var restCallURL = SALES_HEAT_QUERY
        var beforeRestCallURL = SALES_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?salesHeatQuarter=" + dateType2 + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
          if(dateType2=='201701'){
            beforeRestCallURL += "quarter?salesHeatQuarter=" + 201604 + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
          }else {
            beforeRestCallURL += "quarter?salesHeatQuarter=" + (dateType2-1) + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
          }
        }
        if(dateType1==2){
          restCallURL += "month?salesHeatMonth=" + monthDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
          if(monthDateFormated==201701){
            beforeRestCallURL += "month?salesHeatMonth=" + 201612 + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
          }else{
            beforeRestCallURL += "month?salesHeatMonth=" + (monthDateFormated-1) + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
          }
        }
        if(dateType1==3) {
          restCallURL += "date?startDate=" + startDateFormated + "&endDate=" + endDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
          beforeRestCallURL += "date?startDate=" + beforeStartDateFormated + "&endDate=" + beforeEndDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
        }
      }
      // var beforeRestCallURLProvince = beforeRestCallURL;//提供给省份下钻的时候调用
      var totalData;//总销售额
      var beforeTotalData;//上周期总销售额
      // var mapContainerList = document.getElementsByClassName("mapContainer");
      // mapContainerList[0].style.width = "100%";
      // mapContainerList[1].style.width = "100%";

      var mapContainerBoxList = document.getElementsByClassName("mapContainerBox");
      mapContainerBoxList[0].style.width = "100%";
      // mapContainerBoxList[1].style.width = "0%";
      var mapContainerBox = document.getElementById("mapContainerBox");
      mapContainerBox.style.display = "none";
      $http.get(restCallURL).success(function (data){
        var max =100;
        if(!data.length>0){
          mapOption1.series[0].data=null;
        } else {
          max = data[0].value;
          for(var i=1;i<data.length;i++){
            if(max<data[i].value){
              max=data[i].value
            }
          }
        }
        //计算该查询周期的销售总和
        if(heatType1==0){
          vm.avgHours1 = false;
          vm.avgHours3 = true;
          var total1 = 0;
          for(var a=0;a<data.length;a++){
            total1 += data[a].value;
          }
          totalData = data;
          vm.totalSales=total1;
          vm.national = true;
          vm.allProvince = false;
          //查询上周期的销售总额
          var rspData1 = serviceResource.restCallService(beforeRestCallURL, 'QUERY');
          rspData1.then(function (data1) {
            beforeTotalData = data1;
            var total2 = 0;
            for(var b=0;b<data1.length;b++){
              total2 += data1[b].value;
            }
            vm.beforeTotalSales = total2;
          });
        }
        //查询开工热度信息的平均开工时长
        if(heatType1==1){
          //调用封装好的查询平均时间功能--开工热度
          avgWorkHoursQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1);
          vm.avgHours1 = true;
          vm.avgHours3 = false;
          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational = true;
          vm.avgHoursProvince = false;
        }
        var mapChart1 = vm.echartsInit('mapContainer1');
        mapOption1.series[0].data=data;
        mapOption1.visualMap.max=max;
        mapOption1.title.left = "center";
        mapOption1.title. textStyle={fontSize: 26};
        mapOption1.title. subtextStyle={fontSize: 17};
        if(machineType1=="2"){
          if(heatType1==1){
            mapOption1.title.text = "挖掘机"+vehicleType1+"开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "挖掘机"+vehicleType1+"销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        if(machineType1=="1"){
          if(heatType1==1){
            mapOption1.title.text = "装载机"+vehicleType1+"开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "装载机"+vehicleType1+"销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        if(machineType1=="3"){
          if(heatType1==1){
            mapOption1.title.text = "重机"+vehicleType1+"开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "重机"+vehicleType1+"销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        mapChart1.setOption(mapOption1);
        var backButtons = document.getElementsByClassName("backChina");
        backButtons[0].style.display = "none";
        //地图下钻
        mapChart1.on("click", function (param){
          if(heatType1==1){
            var cityMap = cityOption1;
          } else if(heatType1==0) {
            var cityMap = cityOption2;
          }
          backButtons[0].style.display = "block";
          var n = getindex(param.name,provincesText);
          var Cname = provinces[n];
          cityMap.title.text=param.name;
          cityMap.series[0].mapType=Cname;
          var cityChart = vm.echartsInit('mapContainer1');
          $http.get('assets/json/province/'+Cname+'.json').success(function (geoJson){
            echarts.registerMap(Cname, geoJson);
          });
          var restCallURLProvince = restCallURL;
          restCallURLProvince += "&provinces=" + param.name;
          var rspDataCity = serviceResource.restCallService(restCallURLProvince, 'QUERY');
          rspDataCity.then(function (cityData) {
            var cityMax =100;
            if(!cityData.length>0){
              cityMap.series[0].data=null;
            } else {
              cityMax = cityData[0].value;
              for(var i=1;i<cityData.length;i++){
                if(cityMax<cityData[i].value){
                  cityMax=cityData[i].value
                }
              }
            }
            if(heatType1==0){
              for(var i=0;i<totalData.length;i++){
                if(param.name==totalData[i].name){
                  vm.provinceSales = totalData[i].value;
                }
              }
              vm.beforeProvinceSales = 0;
              for(var q=0;q<beforeTotalData.length;q++){
                if(param.name==beforeTotalData[q].name){
                  vm.beforeProvinceSales= beforeTotalData[q].value;
                }
              }
              //悬浮框的的隐藏和显示-sales
              vm.national = false;
              vm.allProvince = true;
            } else if(heatType1==1){
              avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,param.name);
              // 悬浮框的的隐藏和显示-work
              vm.avgHoursNational = false;
              vm.avgHoursProvince = true;
            }

            cityMap.visualMap.max=cityMax;
            cityMap.series[0].data=cityData;
            cityChart.setOption(cityMap);
          }, function (reason) {
            Notification.error("获取数据失败");
          });
        })
        //省级地图返回到中国地图
        vm.backChina1 = function () {
          mapChart1 = vm.echartsInit("mapContainer1");
          vm.national = true;
          vm.allProvince = false;
          vm.avgHoursNational = true;
          vm.avgHoursProvince = false;
          mapChart1.setOption(mapOption1);
          backButtons[0].style.display = "none";
          //省级地图返回到中国地图再次点击地图下钻
          mapChart1.on("click", function (param){
            if(heatType1==1){
              var cityMap = cityOption1;
            } else if(heatType1==0) {
              var cityMap = cityOption2;
            }
            backButtons[0].style.display = "block";
            var n = getindex(param.name,provincesText);
            var Cname = provinces[n];
            cityMap.title.text=param.name;
            cityMap.series[0].mapType=Cname;
            var cityChart = vm.echartsInit('mapContainer1');
            $http.get('assets/json/province/'+Cname+'.json').success(function (geoJson){
              echarts.registerMap(Cname, geoJson);
            });
            var restCallURLProvince = restCallURL;
            restCallURLProvince += "&provinces=" + param.name;
            var rspDataCity = serviceResource.restCallService(restCallURLProvince, 'QUERY');
            rspDataCity.then(function (cityData) {
              var cityMax =100;
              if(!cityData.length>0){
                cityMap.series[0].data=null;
              } else {
                cityMax = cityData[0].value;
                for(var i=1;i<cityData.length;i++){
                  if(cityMax<cityData[i].value){
                    cityMax=cityData[i].value
                  }
                }
              }
              if(heatType1==0){
                for(var i=0;i<totalData.length;i++){
                  if(param.name==totalData[i].name){
                    vm.provinceSales = totalData[i].value;
                  }
                }
                vm.beforeProvinceSales = 0;
                for(var q=0;q<beforeTotalData.length;q++){
                  if(param.name==beforeTotalData[q].name){
                    vm.beforeProvinceSales= beforeTotalData[q].value;
                  }
                }
                //悬浮框的的隐藏和显示-sales
                vm.national = false;
                vm.allProvince = true;
              }else if(heatType1==1){
                avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,param.name);
                // 悬浮框的的隐藏和显示-work
                vm.avgHoursNational = false;
                vm.avgHoursProvince = true;
              }
              cityMap.visualMap.max=cityMax;
              cityMap.series[0].data=cityData;
              cityChart.setOption(cityMap);
            }, function (reason) {
              Notification.error("获取数据失败");
            });
          })
        }

      }, function (reason) {
        Notification.error("获取数据失败");
      });

    }
    //封装查询各种车型的开工平均时长--左图和大地图调用
    function avgWorkHoursQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1){

      if(dateType1==1){
        var restCallURL1 = AVG_WORK_HOUR_QUERY_QUARTER;//装载机
        var restCallURL2 = AVG_WORK_HOUR_QUERY_QUARTER;//挖掘机
        var restCallURL3 = AVG_WORK_HOUR_QUERY_QUARTER;//重机
        var beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_QUARTER;
        var beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_QUARTER;
        var beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_QUARTER;
        if(dateType2==201701){
          var dateQuarter = 201604;
        } else {
          dateQuarter = dateType2-1;
        }
        restCallURL1 += dateType2 + '&machineType=1&modelType=' + vehicleType1;
        restCallURL2 += dateType2 + '&machineType=2&modelType=' + vehicleType1;
        restCallURL3 += dateType2 + '&machineType=3&modelType=' + vehicleType1;
        beforeRestCallURL1 += dateQuarter + '&machineType=1&modelType=' + vehicleType1;
        beforeRestCallURL2 += dateQuarter + '&machineType=2&modelType=' + vehicleType1;
        beforeRestCallURL3 += dateQuarter + '&machineType=3&modelType=' + vehicleType1;
      }
      if(dateType1==2){
        restCallURL1 = AVG_WORK_HOUR_QUERY_MONTH;
        restCallURL2 = AVG_WORK_HOUR_QUERY_MONTH;
        restCallURL3 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_MONTH;
        if(monthDateFormated==201701){
          var beforeMonthDate=201612;
        } else {
          beforeMonthDate=monthDateFormated;
        }
        restCallURL1 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=1&modelType=' + vehicleType1;
        restCallURL2 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=2&modelType=' + vehicleType1;
        restCallURL3 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=3&modelType=' + vehicleType1;
        beforeRestCallURL1 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=1&modelType=' + vehicleType1;
        beforeRestCallURL2 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=2&modelType=' + vehicleType1;
        beforeRestCallURL3 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=3&modelType=' + vehicleType1;
      }

      if(dateType1==3){
        restCallURL1 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL2 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL3 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL1 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=1&modelType=' + vehicleType1;
        restCallURL2 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=2&modelType=' + vehicleType1;
        restCallURL3 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=3&modelType=' + vehicleType1;
        beforeRestCallURL1 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=1&modelType=' + vehicleType1;
        beforeRestCallURL2 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=2&modelType=' + vehicleType1;
        beforeRestCallURL3 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=3&modelType=' + vehicleType1;
      }
      //请求平均开工市场数据
      vm.loaderHours = 0;
      vm.beforeLoaderHours = 0;
      vm.excavatorHours = 0;
      vm.beforeExcavatorHours = 0;
      vm.heavyHours = 0;
      vm.beforeHeavyHours = 0;
      $http.get(restCallURL1).then(function (data1){//装载机
        if(data1.data.avgHours){
          vm.loaderHours = data1.data.avgHours;
        }
      });
      $http.get(beforeRestCallURL1).then(function (beforeData1){
        if(beforeData1.data.avgHours) {
          vm.beforeLoaderHours = beforeData1.data.avgHours;
        }
      });
      $http.get(restCallURL2).then(function (data2){//挖掘机
        if(data2.data.avgHours){
          vm.excavatorHours = data2.data.avgHours;
        }
      });
      $http.get(beforeRestCallURL2).then(function (beforeData2){
        if(beforeData2.data.avgHours){
          vm.beforeExcavatorHours = beforeData2.data.avgHours;
        }
      });
      // $http.get(restCallURL3).success(function (data3){//重机
      //     if(data3.data.avgHours){
      //       vm.heavyHours = data3.data.avgHours;
      //     }
      // });
      // $http.get(beforeRestCallURL3).success(function (beforeData3){
      //   vm.beforeHeavyHours = beforeData3.data.avgHours;
      // });
    }
    //封装查询各种车型的开工平均时长--右图调用
    function avgWorkHoursQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2){

      if(dateType1==1){
        var restCallURL1 = AVG_WORK_HOUR_QUERY_QUARTER;//装载机
        var restCallURL2 = AVG_WORK_HOUR_QUERY_QUARTER;//挖掘机
        var restCallURL3 = AVG_WORK_HOUR_QUERY_QUARTER;//重机
        var beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_QUARTER;
        var beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_QUARTER;
        var beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_QUARTER;
        if(dateType2==201701){
          var dateQuarter = 201604;
        } else {
          dateQuarter = dateType2-1;
        }
        restCallURL1 += dateType2 + '&machineType=1&modelType=' + vehicleType2;
        restCallURL2 += dateType2 + '&machineType=2&modelType=' + vehicleType2;
        restCallURL3 += dateType2 + '&machineType=3&modelType=' + vehicleType2;
        beforeRestCallURL1 += dateQuarter + '&machineType=1&modelType=' + vehicleType2;
        beforeRestCallURL2 += dateQuarter + '&machineType=2&modelType=' + vehicleType2;
        beforeRestCallURL3 += dateQuarter + '&machineType=3&modelType=' + vehicleType2;
      }
      if(dateType1==2){
        restCallURL1 = AVG_WORK_HOUR_QUERY_MONTH;
        restCallURL2 = AVG_WORK_HOUR_QUERY_MONTH;
        restCallURL3 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_MONTH;
        if(monthDateFormated==201701){
          var beforeMonthDate=201612;
        } else {
          beforeMonthDate=monthDateFormated;
        }
        restCallURL1 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=1&modelType=' + vehicleType2;
        restCallURL2 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=2&modelType=' + vehicleType2;
        restCallURL3 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=3&modelType=' + vehicleType2;
        beforeRestCallURL1 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=1&modelType=' + vehicleType2;
        beforeRestCallURL2 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=2&modelType=' + vehicleType2;
        beforeRestCallURL3 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=3&modelType=' + vehicleType2;
      }

      if(dateType1==3){
        restCallURL1 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL2 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL3 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL1 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=1&modelType=' + vehicleType2;
        restCallURL2 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=2&modelType=' + vehicleType2;
        restCallURL3 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=3&modelType=' + vehicleType2;
        beforeRestCallURL1 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=1&modelType=' + vehicleType2;
        beforeRestCallURL2 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=2&modelType=' + vehicleType2;
        beforeRestCallURL3 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=3&modelType=' + vehicleType2;
      }

      //请求平均开工市场数据
      vm.loaderHours2 = 0;
      vm.beforeLoaderHours2 = 0;
      vm.excavatorHours2 = 0;
      vm.beforeExcavatorHours2 = 0;
      vm.heavyHours2 = 0;
      vm.beforeHeavyHours2 = 0;
      $http.get(restCallURL1).then(function (data1){//装载机
        if(data1.data.avgHours){
          vm.loaderHours2 = data1.data.avgHours;
        }
      });
      $http.get(beforeRestCallURL1).then(function (beforeData1){
        if(beforeData1.data.avgHours){
          vm.beforeLoaderHours2 = beforeData1.data.avgHours;
        }
      });
      $http.get(restCallURL2).then(function (data2){//挖掘机
        if(data2.data.avgHours){
          vm.excavatorHours2 = data2.data.avgHours;
        }
      });
      $http.get(beforeRestCallURL2).then(function (beforeData2){
        if(beforeData2.data.avgHours){
          vm.beforeExcavatorHours2 = beforeData2.data.avgHours;
        }
      });
      // $http.get(restCallURL3).success(function (data3){//重机
      //   vm.heavyHours2 = data3.data.avgHours;
      // });
      // $http.get(beforeRestCallURL3).success(function (beforeData3){
      //   vm.beforeHeavyHours2 = beforeData3.data.avgHours;
      // });
    }

    //封装查询各种车型的开工平均时长--左图和大地图调用
    function avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,nameProvince){

      if(dateType1==1){
        var restCallURL1 = AVG_WORK_HOUR_QUERY_QUARTER;//装载机
        var restCallURL2 = AVG_WORK_HOUR_QUERY_QUARTER;//挖掘机
        var restCallURL3 = AVG_WORK_HOUR_QUERY_QUARTER;//重机
        var beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_QUARTER;
        var beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_QUARTER;
        var beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_QUARTER;
        if(dateType2==201701){
          var dateQuarter = 201604;
        } else {
          dateQuarter = dateType2-1;
        }
        restCallURL1 += dateType2 + '&machineType=1&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        restCallURL2 += dateType2 + '&machineType=2&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        restCallURL3 += dateType2 + '&machineType=3&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL1 += dateQuarter + '&machineType=1&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL2 += dateQuarter + '&machineType=2&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL3 += dateQuarter + '&machineType=3&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
      }
      if(dateType1==2){
        restCallURL1 = AVG_WORK_HOUR_QUERY_MONTH;
        restCallURL2 = AVG_WORK_HOUR_QUERY_MONTH;
        restCallURL3 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_MONTH;
        if(monthDateFormated==201701){
          var beforeMonthDate=201612;
        } else {
          beforeMonthDate=monthDateFormated;
        }
        restCallURL1 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=1&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        restCallURL2 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=2&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        restCallURL3 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=3&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL1 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=1&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL2 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=2&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL3 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=3&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
      }
      if(dateType1==3){
        restCallURL1 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL2 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL3 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL1 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=1&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        restCallURL2 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=2&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        restCallURL3 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=3&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL1 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=1&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL2 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=2&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
        beforeRestCallURL3 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=3&modelType=' + vehicleType1 + '&provinces=' + nameProvince;
      }
      //请求平均开工市场数据
      vm.loaderHoursProvince = 0;
      vm.beforeLoaderHoursProvince = 0;
      vm.excavatorHoursProvince = 0;
      vm.beforeExcavatorHoursProvince = 0;
      vm.heavyHoursProvince = 0;
      vm.beforeHeavyHoursProvince = 0;
      $http.get(restCallURL1).then(function (data1){//装载机
        if(data1.data.avgHours){
          vm.loaderHoursProvince = data1.data.avgHours;
        }
      });
      $http.get(beforeRestCallURL1).then(function (beforeData1){
        if(beforeData1.data.avgHours){
          vm.beforeLoaderHoursProvince = beforeData1.data.avgHours;
        }
      });
      $http.get(restCallURL2).then(function (data2){//挖掘机
        if(data2.data.avgHours){
          vm.excavatorHoursProvince = data2.data.avgHours;
        }
      });
      $http.get(beforeRestCallURL2).then(function (beforeData2){
        if(beforeData2.data.avgHours){
          vm.beforeExcavatorHoursProvince = beforeData2.data.avgHours;
        }
      });
      // $http.get(restCallURL3).then(function (data3){//重机
      //   vm.heavyHoursProvince = data3.data.avgHours;
      // });
      // $http.get(beforeRestCallURL3).then(function (beforeData3){
      //   vm.beforeHeavyHoursProvince = beforeData3.data.avgHours;
      // });
    }
    //封装查询各种车型的开工平均时长--右图调用
    function avgWorkHoursProvinceQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2,nameProvince){

      if(dateType1==1){
        var restCallURL1 = AVG_WORK_HOUR_QUERY_QUARTER;//装载机
        var restCallURL2 = AVG_WORK_HOUR_QUERY_QUARTER;//挖掘机
        var restCallURL3 = AVG_WORK_HOUR_QUERY_QUARTER;//重机
        var beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_QUARTER;
        var beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_QUARTER;
        var beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_QUARTER;
        if(dateType2==201701){
          var dateQuarter = 201604;
        } else {
          dateQuarter = dateType2-1;
        }
        restCallURL1 += dateType2 + '&machineType=1&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        restCallURL2 += dateType2 + '&machineType=2&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        restCallURL3 += dateType2 + '&machineType=3&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL1 += dateQuarter + '&machineType=1&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL2 += dateQuarter + '&machineType=2&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL3 += dateQuarter + '&machineType=3&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
      }
      if(dateType1==2){
        restCallURL1 = AVG_WORK_HOUR_QUERY_MONTH;
        restCallURL2 = AVG_WORK_HOUR_QUERY_MONTH;
        restCallURL3 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_MONTH;
        beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_MONTH;
        if(monthDateFormated==201701){
          var beforeMonthDate=201612;
        } else {
          beforeMonthDate=monthDateFormated;
        }
        restCallURL1 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=1&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        restCallURL2 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=2&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        restCallURL3 += "quarter?workRateMonth=" + monthDateFormated + '&machineType=3&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL1 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=1&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL2 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=2&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL3 += "quarter?workRateMonth=" + beforeMonthDate + '&machineType=3&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
      }

      if(dateType1==3){
        restCallURL1 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL2 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL3 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL1 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL2 = AVG_WORK_HOUR_QUERY_DATE;
        beforeRestCallURL3 = AVG_WORK_HOUR_QUERY_DATE;
        restCallURL1 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=1&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        restCallURL2 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=2&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        restCallURL3 += "startDate=" + startDateFormated + '&endDate='+ endDateFormated + '&machineType=3&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL1 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=1&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL2 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=2&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
        beforeRestCallURL3 += "startDate=" + beforeStartDateFormated + '&endDate='+ beforeEndDateFormated + '&machineType=3&modelType=' + vehicleType2 + '&provinces=' + nameProvince;
      }
      //请求平均开工市场数据
      vm.loaderHoursProvince2 = 0;
      vm.beforeLoaderHoursProvince2 = 0;
      vm.excavatorHoursProvince2 = 0;
      vm.beforeExcavatorHoursProvince2 = 0;
      vm.heavyHoursProvince2 = 0;
      vm.beforeHeavyHoursProvince2 = 0;
      $http.get(restCallURL1).then(function (data1){//装载机
        if(data1.data.avgHours){
          vm.loaderHoursProvince2 = data1.data.avgHours;
        }
      });
      $http.get(beforeRestCallURL1).then(function (beforeData1){
        if(beforeData1.data.avgHours){
          vm.beforeLoaderHoursProvince2 = beforeData1.data.avgHours;
        }
      });
     $http.get(restCallURL2).then(function (data2){//挖掘机
       if(data2.data.avgHours){
         vm.excavatorHoursProvince2 = data2.data.avgHours;
       }
      });
      $http.get(beforeRestCallURL2).then(function (beforeData2){
        if(beforeData2.data.avgHours){
          vm.beforeExcavatorHoursProvince2 = beforeData2.data.avgHours;
        }
      });
      // $http.get(restCallURL3).then(function (data3){//重机
      //   vm.heavyHoursProvince2 = data3.data.avgHours;
      // });
      // $http.get(beforeRestCallURL3).then(function (beforeData3){
      //   vm.beforeHeavyHoursProvince2 = beforeData3.data.avgHours;
      // });
    }

    //车型对比查询
    vm.viewResults = function(startDate,endDate,dateType1,dateType2,monthDate,hours,machineType1,machineType2,vehicleType1,vehicleType2,heatType1,heatType2){
      if(null==machineType1||null==machineType2||null==heatType1||null==heatType2||null==vehicleType1||null==vehicleType2){
        Notification.warning({message: '请选择相关参数'});
      }else if(machineType1 == machineType2&&heatType1==heatType2&&vehicleType1==vehicleType2){
        Notification.warning({message: "相同参数类型的数据没有对比意义，请重新选择参数!"});
      }else {

        //转换月份和日期格式
        if(monthDate){
          var month = monthDate.getMonth() +1;
          if(month<10){
            var monthDateFormated = monthDate.getFullYear() +'0'+ month;
          }else{
            monthDateFormated = ''+monthDate.getFullYear() + month;
          }
        }
        if(startDate && endDate){
          var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
          var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
          var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
          var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
          //计算查询日期时上周期的起止时间
          var beforeEndDate = startDate;//上周期的结束时间
          var beforeStartDate = endDate;//上周期的开始时间
          var n = beforeStartDate.getDate()-beforeEndDate.getDate();
          beforeStartDate.setDate(beforeEndDate.getDate()-n);
          var beforeStartDateFormated = beforeStartDate.getFullYear() + '-' + (beforeStartDate.getMonth() + 1) + '-' + beforeStartDate.getDate();
          var beforeEndDateFormated = beforeEndDate.getFullYear() + '-' + (beforeEndDate.getMonth() + 1) + '-' + beforeEndDate.getDate();
        }

        //开工热度查询判断按某种周期--左图
        if(heatType1==1){//开工
          var mapOption1= chinaOption1;
          var restCallURL1 = START_HEAT_QUERY;
          if(dateType1==1){
            restCallURL1 += "quarter?workRateQuarter=" + dateType2 + '&machineType=' + machineType1 + '&modelType=' + vehicleType1 + '&hourScope=' + hours;
          }
          if(dateType1==2){
            restCallURL1 += "month?workRateMonth=" + monthDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1 + '&hourScope=' + hours;
          }
          if(dateType1==3){
            restCallURL1 += "date?startDate=" + startDateFormated + "&endDate=" + endDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1 + '&hourScope=' + hours;
          }

        }else if(heatType1==0){//销售
          var mapOption1= chinaOption2;
          var restCallURL1 = SALES_HEAT_QUERY;
          var beforeRestCallURL1 = SALES_HEAT_QUERY;
          if(dateType1==1){
            restCallURL1 += "quarter?salesHeatQuarter=" + dateType2 + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
            if(dateType2=='201701'){
              beforeRestCallURL1 += "quarter?salesHeatQuarter=" + 201604 + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
            }else {
              beforeRestCallURL1 += "quarter?salesHeatQuarter=" + (dateType2-1) + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
            }
          }
          if(dateType1==2){
            restCallURL1 += "month?salesHeatMonth=" + monthDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
            if(monthDateFormated==201701){
              beforeRestCallURL1 += "month?salesHeatMonth=" + 201612 + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
            }else{
              beforeRestCallURL1 += "month?salesHeatMonth=" + (monthDateFormated-1) + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
            }
          }
          if(dateType1==3) {
            restCallURL1 += "date?startDate=" + startDateFormated + "&endDate=" + endDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
            beforeRestCallURL1 += "date?startDate=" + beforeStartDateFormated + "&endDate=" + beforeEndDateFormated + '&machineType=' + machineType1 + '&modelType=' + vehicleType1;
          }
        }
        //开工热度查询判断按某种周期--右图
        if(heatType2==1){//开工
          var mapOption2= chinaOption1;
          var restCallURL2 = START_HEAT_QUERY;
          if(dateType1==1){
            restCallURL2 += "quarter?workRateQuarter=" + dateType2 + '&machineType=' + machineType2 + '&modelType=' + vehicleType2 + '&hourScope=' + hours;
          }
          if(dateType1==2){
            var month = monthDate.getMonth() +1;
            restCallURL2 += "month?workRateMonth=" + monthDateFormated + '&machineType=' + machineType2 + '&modelType=' + vehicleType2 + '&hourScope=' + hours;
          }
          if(dateType1==3){
            restCallURL2 += "date?startDate=" + startDateFormated + "&endDate=" + endDateFormated + '&machineType=' + machineType2 + '&modelType=' + vehicleType2 + '&hourScope=' + hours;
          }

        }else if(heatType2==0){//销售
          var mapOption2= chinaOption2;
          var restCallURL2 = SALES_HEAT_QUERY;
          var beforeRestCallURL2 = SALES_HEAT_QUERY;
          if(dateType1==1){
            restCallURL2 += "quarter?salesHeatQuarter=" + dateType2 + '&machineType=' + machineType2 + '&modelType=' + vehicleType2;
            if(dateType2=='201701'){
              beforeRestCallURL2 += "quarter?salesHeatQuarter=" + 201604 + '&machineType=' + machineType2 + '&modelType=' + vehicleType2;
            }else {
              beforeRestCallURL2 += "quarter?salesHeatQuarter=" + (dateType2-1) + '&machineType=' + machineType2 + '&modelType=' + vehicleType2;
            }
          }
          if(dateType1==2){
            restCallURL2 += "month?salesHeatMonth=" + monthDateFormated + '&machineType=' + machineType2 + '&modelType=' + vehicleType2;
            if(monthDateFormated==201701){
              beforeRestCallURL2 += "month?salesHeatMonth=" + 201612 + '&machineType=' + machineType2 + '&modelType=' + vehicleType2;
            }else{
              beforeRestCallURL2 += "month?salesHeatMonth=" + (monthDateFormated-1) + '&machineType=' + machineType2 + '&modelType=' + vehicleType2;
            }
          }
          if(dateType1==3) {
            restCallURL2 += "date?startDate=" + startDateFormated + "&endDate=" + endDateFormated + '&machineType=' + machineType2 + '&modelType=' + vehicleType2;
            beforeRestCallURL2 += "date?startDate=" + beforeStartDateFormated + "&endDate=" + beforeEndDateFormated + '&machineType=' + machineType2 + '&modelType=' + vehicleType2;
          }
        }
        var totalData1;//总销售额--左图
        var beforeTotalData1;//上周期总销售额--左图
        var totalData2;//总销售额--右图
        var beforeTotalData2;//上周期总销售额-右图

        //热度对比显示格局样式
        var mapContainerBoxList = document.getElementsByClassName("mapContainerBox");
        mapContainerBoxList[0].style.width = "50%";
        mapContainerBoxList[1].style.width = "50%";

        var mapContainerList = document.getElementsByClassName("mapContainer");
        mapContainerList[0].style.width = "100%";
        mapContainerList[1].style.width = "100%";

        var mapContainerQushi2 = document.getElementById("mapContainerQushi2");
        mapContainerQushi2.style.display = "block";
        var mapContainerBox = document.getElementById("mapContainerBox");
        mapContainerBox.style.display = "block";
        //在省份城市情况下直接点击对比查询，隐藏返回箭头
        var backButtons = document.getElementsByClassName("backChina");
        backButtons[0].style.display = "none";
        backButtons[1].style.display = "none";

        var mapChart1 = vm.echartsInit('mapContainer1');
        var mapChart2 = vm.echartsInit('mapContainer2');
        var max1 =100;
        var max2 =100;
        var max3 =100;
        var zData;
        var yData;
        $http.get(restCallURL1).success(function (data1){

          if(!data1.length>0){
            mapOption1.series[0].data=null;
          } else {
            max1 = data1[0].value;
            for(var i=1;i<data1.length;i++){
              if(max1<data1[i].value){
                max1=data1[i].value
              }
            }
          }
          zData = data1;
          //计算该查询周期的销售总和--左图
          if(heatType1==0){
            vm.avgHours1 = false;
            vm.avgHours3 = true;
            vm.national = true;
            vm.allProvince = false;
            // vm.national1 = true;
            // vm.allProvince1 = false;
            totalData1 = data1;
            var total1 = 0;
            for(var a=0;a<data1.length;a++){
              total1 += data1[a].value;
            }
            vm.totalSales=total1;
            //查询上周期的销售总额--左图
            var rspData3 = serviceResource.restCallService(beforeRestCallURL1, 'QUERY');
            rspData3.then(function (data3) {
              beforeTotalData1 = data3;
              var total2 = 0;
              for(var b=0;b<data3.length;b++){
                total2 += data3[b].value;
              }
              vm.beforeTotalSales = total2;
            });
          }
          if(heatType1==1){
            vm.avgHours1 = true;
            vm.avgHours3 = false;
            vm.avgHoursNational = true;
            vm.avgHoursProvince = false;
            avgWorkHoursQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1);
          }
          $http.get(restCallURL2).success(function (data2){
            if(!data2.length>0){
              mapOption2.series[0].data=null;
            } else {
              max2 = data2[0].value;
              for(var i=1;i<data2.length;i++){
                if(max2<data2[i].value){
                  max2=data2[i].value
                }
              }
            }
            yData = data2;
            //计算该查询周期的销售总和--右图
            if(heatType2==0){
              vm.avgHours2 = false;
              vm.avgHours4 = true;
              vm.national1 = true;
              vm.allProvince1 = false;
              totalData2 = data2;
              var total1 = 0;
              for(var a=0;a<data2.length;a++){
                total1 += data2[a].value;
              }
              vm.totalSales1=total1;
              //查询上周期的销售总额--右图
              var rspData4 = serviceResource.restCallService(beforeRestCallURL2, 'QUERY');
              rspData4.then(function (data4) {
                beforeTotalData2 = data4;
                var total2 = 0;
                for(var b=0;b<data4.length;b++){
                  total2 += data4[b].value;
                }
                vm.beforeTotalSales1 = total2;
              });
            }
            if(heatType2==1){
              vm.avgHours2 = true;
              vm.avgHours4 = false;
              vm.avgHoursNational2 = true;
              vm.avgHoursProvince2 = false;
              avgWorkHoursQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2);
            }
            if(max1>=max2) {
              max3 = max1;
            }
            if(max1<max2) {
              max3 = max2;
            }
            if(machineType1=="2"){
              if(heatType1==1){
                mapOption1.title.text = "挖掘机"+vehicleType1+"开工热度分布";
                mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType1==0){
                mapOption1.title.text = "挖掘机"+vehicleType1+"销售热度分布";
                mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }
            if(machineType1=="1"){
              if(heatType1==1){
                mapOption1.title.text = "装载机"+vehicleType1+"开工热度分布";
                mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType1==0){
                mapOption1.title.text = "装载机"+vehicleType1+"销售热度分布";
                mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }
            if(machineType1=="3"){
              if(heatType1==1){
                mapOption1.title.text = "重机"+vehicleType1+"开工热度分布";
                mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType1==0){
                mapOption1.title.text = "重机"+vehicleType1+"销售热度分布";
                mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }
            mapOption1.title.left = "center";
            mapOption1.title. textStyle={fontSize: 26};
            mapOption1.title. subtextStyle={fontSize: 17};
            mapOption1.series[0].data=zData;
            mapOption1.visualMap.max=max3;
            mapChart1.setOption(mapOption1);
            if(machineType2=="2"){
              if(heatType2==1){
                mapOption2.title.text = "挖掘机"+vehicleType2+"开工热度分布";
                mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType2==0){
                mapOption2.title.text = "挖掘机"+vehicleType2+"销售热度分布";
                mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }
            if(machineType2=="1"){
              if(heatType2==1){
                mapOption2.title.text = "装载机"+vehicleType2+"开工热度分布";
                mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType2==0){
                mapOption2.title.text = "装载机"+vehicleType2+"销售热度分布";
                mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }
            if(machineType2=="3"){
              if(heatType2==1){
                mapOption2.title.text = "重机"+vehicleType2+"开工热度分布";
                mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType2==0){
                mapOption2.title.text = "重机"+vehicleType2+"销售热度分布";
                mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }
            mapOption2.title.left = "center";
            mapOption2.title. textStyle={fontSize: 26};
            mapOption2.title. subtextStyle={fontSize: 17};
            mapOption2.series[0].data=yData;
            mapOption2.visualMap.max=max3;
            mapChart2.setOption(mapOption2);
          }, function (reason) {
            Notification.error("获取数据失败");
          });
        }, function (reason) {
          Notification.error("获取数据失败");
        });
        var backButtons = document.getElementsByClassName("backChina");
        //地图下钻
        mapChart1.on("click", function (param){
          backButtons[0].style.display = "block";
          backButtons[1].style.display = "block";
          // vm.avgHoursNational = false;
          // vm.avgHoursProvince = true;
          // vm.avgHoursNational2 = false;
          // vm.avgHoursProvince2 = true;
          avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,param.name);
          avgWorkHoursProvinceQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2,param.name);

          showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);

        })
        //地图下钻
        mapChart2.on("click", function (param){
          backButtons[0].style.display = "block";
          backButtons[1].style.display = "block";
          avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,param.name);
          avgWorkHoursProvinceQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2,param.name);
          showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);

        })
        //省级地图返回到中国地图
        vm.backChina1 = function () {
          vm.national = true;
          vm.allProvince = false;
          vm.national1 = true;
          vm.allProvince1 = false;
          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational = true;
          vm.avgHoursProvince = false;
          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational2 = true;
          vm.avgHoursProvince2 = false;
          var mapChart2 = vm.echartsInit("mapContainer2");
          mapOption2.series[0].data=yData;
          mapChart2.setOption(mapOption2);
          var mapChart1 = vm.echartsInit("mapContainer1");
          mapOption1.series[0].data=zData;
          mapChart1.setOption(mapOption1);
          backButtons[1].style.display = "none";
          backButtons[0].style.display = "none";

          //省级地图返回到中国地图再次点击地图下钻
          mapChart1.on("click", function (param){
            backButtons[1].style.display = "block";
            backButtons[0].style.display = "block";
            avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,param.name);
            avgWorkHoursProvinceQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2,param.name);
            showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);

          })
          mapChart2.on("click", function (param){
            backButtons[0].style.display = "block";
            backButtons[1].style.display = "block";
            avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,param.name);
            avgWorkHoursProvinceQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2,param.name);
            showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);

          })
        }
        //省级地图返回到中国地图
        vm.backChina2 = function () {
          vm.national = true;
          vm.allProvince = false;
          vm.national1 = true;
          vm.allProvince1 = false;
          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational = true;
          vm.avgHoursProvince = false;
          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational2 = true;
          vm.avgHoursProvince2 = false;
          var mapChart2 = vm.echartsInit("mapContainer2");
          mapOption2.series[0].data=yData;
          mapChart2.setOption(mapOption2);
          var mapChart1 = vm.echartsInit("mapContainer1");
          mapOption1.series[0].data=zData;
          mapChart1.setOption(mapOption1);
          backButtons[1].style.display = "none";
          backButtons[0].style.display = "none";
          //省级地图返回到中国地图再次点击地图下钻
          mapChart1.on("click", function (param){
            backButtons[0].style.display = "block";
            backButtons[1].style.display = "block";
            avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,param.name);
            avgWorkHoursProvinceQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2,param.name);
            showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);
          })
          mapChart2.on("click", function (param){
            backButtons[0].style.display = "block";
            backButtons[1].style.display = "block";
            avgWorkHoursProvinceQuery(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType1,param.name);
            avgWorkHoursProvinceQuery2(startDateFormated,endDateFormated,beforeStartDateFormated,beforeEndDateFormated,dateType1,dateType2,monthDateFormated,vehicleType2,param.name);
            showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);
          })

        }
      }
    }

    //地图下钻显示省份封装
    function showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2){
      if(heatType1==1){
        var cityMap1 = cityOption1;
      } else if(heatType1==0) {
        var cityMap1 = cityOption2;
      }
      if(heatType2==1){
        var cityMap2 = cityOption1;
      } else if(heatType2==0) {
        var cityMap2 = cityOption2;
      }
      var restCallURLCity1 = restCallURL1;
      restCallURLCity1 += "&provinces=" + param.name;
      var restCallURLCity2 = restCallURL2;
      restCallURLCity2 += "&provinces=" + param.name;
      var n = getindex(param.name,provincesText);
      var Cname = provinces[n];
      cityMap1.title.text=param.name;
      cityMap1.series[0].mapType=Cname;
      cityMap2.title.text=param.name;
      cityMap2.series[0].mapType=Cname;
      $http.get('assets/json/province/'+Cname+'.json').success(function (geoJson){
        echarts.registerMap(Cname, geoJson);
      });
      if(heatType1==0){

        for(var i=0;i<totalData1.length;i++){
          if(param.name==totalData1[i].name){
            vm.provinceSales = totalData1[i].value;
          }
        }
        for(var q=0;q<beforeTotalData1.length;q++){
          if(param.name==beforeTotalData1[q].name){
            vm.beforeProvinceSales= beforeTotalData1[q].value;
          }
        }
        vm.national = false;
        vm.allProvince = true;
      }

      if(heatType2==0){
        for(var i=0;i<totalData2.length;i++){
          if(param.name==totalData2[i].name){
            vm.provinceSales1 = totalData2[i].value;
          }
        }
        for(var q=0;q<beforeTotalData2.length;q++){
          if(param.name==beforeTotalData2[q].name){
            vm.beforeProvinceSales1= beforeTotalData2[q].value;
          }
        }
        vm.national1 = false;
        vm.allProvince1 = true;
      }
      var cityChart1 = vm.echartsInit("mapContainer1");
      var cityChart2 = vm.echartsInit("mapContainer2");
      var rspDataCity1 = serviceResource.restCallService(restCallURLCity1, 'QUERY');
      rspDataCity1.then(function (cityData1) {
        var cityMax1 =100;
        if(!cityData1.length>0){
          cityMap1.series[0].data=null;
        } else {
          cityMax1 = cityData1[0].value;
          for(var i=1;i<cityData1.length;i++){
            if(cityMax1<cityData1[i].value){
              cityMax1=cityData1[i].value
            }
          }
        }
        // cityMap1.series[0].data=cityData1;
        // cityMap1.visualMap.max=cityMax1;
        // cityChart1.setOption(cityMap1);
        var rspDataCity2 = serviceResource.restCallService(restCallURLCity2, 'QUERY');
        rspDataCity2.then(function (cityData2) {
          var cityMax2 =100;
          if(!cityData2.length>0){
            cityMap2.series[0].data=null;
          } else {
            cityMax2 = cityData2[0].value;
            for(var i=1;i<cityData2.length;i++){
              if(cityMax2<cityData2[i].value){
                cityMax2=cityData2[i].value
              }
            }
          }
          var cityMax3=100;
          if(cityMax1>=cityMax2){
            cityMax3 = cityMax1;
          }
          if(cityMax1<cityMax2){
            cityMax3 = cityMax2;
          }

          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational = false;
          vm.avgHoursProvince = true;
          cityMap1.visualMap.max=cityMax3;
          cityMap1.series[0].data=cityData1;
          cityChart1.setOption(cityMap1);

          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational2 = false;
          vm.avgHoursProvince2 = true;
          cityMap2.visualMap.max=cityMax3;
          cityMap2.series[0].data=cityData2;
          cityChart2.setOption(cityMap2);
        }, function (reason) {
          Notification.error("获取数据失败");
        });

      }, function (reason) {
        Notification.error("获取数据失败");
      });
    }

    function getindex(name,arr){
      for (var i = 0; i < arr.length; i++) {
        if(name==arr[i]){
          return i;
        }
      }
    }

    var provinces = ['shanghai', 'hebei','shanxi','neimenggu','liaoning','jilin','heilongjiang','jiangsu','zhejiang','anhui','fujian','jiangxi','shandong','henan','hubei','hunan','guangdong','guangxi','hainan','sichuan','guizhou','yunnan','xizang','shanxi1','gansu','qinghai','ningxia','xinjiang', 'beijing', 'tianjin', 'chongqing', 'xianggang', 'aomen', 'taiwan'];
    var provincesText = ['上海市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省','黑龙江省',  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省','河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '北京市', '天津市', '重庆市', '香港特別行政區', '澳門特別行政區', '台湾省'];

    //重置按钮
    vm.reset = function () {
      vm.heatType1 = null;
      vm.heatType2 = null;
    }


  }
})();