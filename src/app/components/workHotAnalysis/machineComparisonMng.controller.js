/**
 * Created by mengwei on 17-4-24.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineComparedMngController', machineComparedMngController);

  /** @ngInject */
  function machineComparedMngController($rootScope, $scope, $http, $filter,Notification,serviceResource,SALES_HEAT_QUERY,START_HEAT_QUERY,GET_OWNERSHIP_URL,
                                        AVG_WORK_HOUR_QUERY_MONTH,AVG_WORK_HOUR_QUERY_QUARTER,AVG_WORK_HOUR_QUERY_DATE,SALES_YEAR_QUERY,WORK_HOUR_YEAR_QUERY_DATE) {
    var vm = this;
    var mapChart1;
    var mapChart2;

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);
    vm.startDate = startDate;
    vm.endDate = new Date();

    vm.startDateDeviceData = startDate;
    vm.endDateDeviceData = new Date();
    vm.monthDateDeviceData = new Date();

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

    vm.echartsInit = function (id) {
      var item = echarts.init(document.getElementById(id));
      return item;
    }
    //刷新页面后设置默认的查询属性
    vm.machineType = "A1";
    vm.heatType = "1";
    vm.dateType1 = "1";
    vm.dateType2 = "201702";
    vm.heatType3 = "1";
    var dates = new Array();
    for(var i=0;i<6;i++){
      var quarterDate = new Date();
      if(i==0){
        var monthDate = quarterDate.getMonth()+1;
      }else if(i==1){
        monthDate = quarterDate.getMonth()+1-3;
      } else if(i==2) {
        monthDate = quarterDate.getMonth()+1-6;
      }else if(i==3) {
        monthDate = quarterDate.getMonth()+1-9;
      }else if(i==4) {
        monthDate = quarterDate.getMonth()+1-12;
      }else if(i==5) {
        monthDate = quarterDate.getMonth()+1-15;
      }
      if(monthDate<=0){
        if(-11<=monthDate && monthDate<=-9){
          var year =quarterDate.getFullYear()-1;
          var value = '01';
          var value1 = '年第一季度';
        } else if(-8<=monthDate && monthDate<=-6){
          year =quarterDate.getFullYear()-1;
          value = '02';
          value1 = '年第二季度';
        } else if(-5<=monthDate && monthDate<=-3){
          year =quarterDate.getFullYear()-1;
          value = '03';
          value1 = '年第三季度';
        }else if(-2<=monthDate && monthDate<=0){
          year =quarterDate.getFullYear()-1;
          value = '04';
          value1 = '年第四季度';
        }else if(-14<=monthDate && monthDate<=-12){
          year =quarterDate.getFullYear()-2;
          value = '04';
          value1 = '年第四季度';
        }
      } else
      if(1<=monthDate && monthDate<=3){
        year =quarterDate.getFullYear();
        var value = '01';
        var value1 = '年第一季度';
      } else if(4<=monthDate && monthDate<=6){
        year =quarterDate.getFullYear();
        value = '02';
        value1 = '年第二季度';
      } else if(7<=monthDate && monthDate<=9){
        year =quarterDate.getFullYear();
        value = '03';
        value1 = '年第三季度';
      }else if(10<=monthDate && monthDate<=12){
        year =quarterDate.getFullYear();
        value = '04';
        value1 = '年第四季度';
      }
      var x = ''+year+value;
      var y = year+value1;
      var date = {
        key: x,
        value: y
      }
      dates.push(date);
    }
    vm.quarter = dates;
    //修改查询单一车型和对比车型的切换
    vm.only=true;
    vm.comtrast=false;
    vm.toggle = function () {
      vm.only=!vm.only;
      vm.contrast=!vm.contrast;
      vm.reset();
    }
    vm.dayQuery = false;
    vm.quarterQuery = true;
    vm.monthQuery = false;
    //触发选择框时间
    vm.change = function (dateType1) {
      if(dateType1==3){
        vm.dayQuery = true;
        vm.quarterQuery = false;
        vm.monthQuery = false;
        vm.dateType2 = null;
      } else if(dateType1==2){
        vm.dayQuery = false;
        vm.quarterQuery = false;
        vm.monthQuery = true;
      } else {
        vm.dayQuery = false;
        vm.quarterQuery = true;
        vm.monthQuery = false;
        var dates = new Array();
        for(var i=0;i<6;i++){
          var quarterDate = new Date();
          if(i==0){
            var monthDate = quarterDate.getMonth()+1;
          }else if(i==1){
            monthDate = quarterDate.getMonth()+1-3;
          } else if(i==2) {
            monthDate = quarterDate.getMonth()+1-6;
          }else if(i==3) {
            monthDate = quarterDate.getMonth()+1-9;
          }else if(i==4) {
            monthDate = quarterDate.getMonth()+1-12;
          }else if(i==5) {
            monthDate = quarterDate.getMonth()+1-15;
          }
          if(monthDate<=0){
            if(-11<=monthDate && monthDate<=-9){
              var year =quarterDate.getFullYear()-1;
              var value = '01';
              var value1 = '年第一季度';
            } else if(-8<=monthDate && monthDate<=-6){
              year =quarterDate.getFullYear()-1;
              value = '02';
              value1 = '年第二季度';
            } else if(-5<=monthDate && monthDate<=-3){
              year =quarterDate.getFullYear()-1;
              value = '03';
              value1 = '年第三季度';
            }else if(-2<=monthDate && monthDate<=0){
              year =quarterDate.getFullYear()-1;
              value = '04';
              value1 = '年第四季度';
            }else if(-14<=monthDate && monthDate<=-12){
              year =quarterDate.getFullYear()-2;
              value = '04';
              value1 = '年第四季度';
            }
          } else
          if(1<=monthDate && monthDate<=3){
            year =quarterDate.getFullYear();
            var value = '01';
            var value1 = '年第一季度';
          } else if(4<=monthDate && monthDate<=6){
            year =quarterDate.getFullYear();
            value = '02';
            value1 = '年第二季度';
          } else if(7<=monthDate && monthDate<=9){
            year =quarterDate.getFullYear();
            value = '03';
            value1 = '年第三季度';
          }else if(10<=monthDate && monthDate<=12){
            year =quarterDate.getFullYear();
            value = '04';
            value1 = '年第四季度';
          }
          var x = ''+year+value;
          var y = year+value1;
          var date = {
            key: x,
            value: y
          }
          dates.push(date);
        }
        vm.quarter = dates;
        vm.dateType2 = "201702";
      }
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
                  + name + '：' +  params.data.value.toFixed(1) + unit +  '<br />'
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
          data:''
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
          data:''
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
        max: 100,
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
                  + name + '：' +  params.data.value.toFixed(1) + unit +  '<br />'
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
          restore: {show: true},
          saveAsImage: {show: true}
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
            min: 0.5
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
          restore: {show: true},
          saveAsImage: {show: true}
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
            min: 0.5
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


    var subMap1 = vm.echartsInit('subMap1');
    var subMap2 = vm.echartsInit('subMap2');
    //重机
    // var subMap3 = vm.echartsInit('subMap3');

    var mmuChart1 = echarts.init(document.getElementById('mmu-container1'));
    //折线图
    var mmuOption1 = {
      title: {
        text: '挖机开工变化趋势',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'center',
        right: 20,
        itemGap: 30,
        // feature: {
        //   // restore: {show: true},
        //   saveAsImage: {show: true}
        // },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        backgroundColor: 'rgba(219,219,216,0.8)',
        textStyle: {
          color: '#333333'
        },
        formatter: function (params) {
          var res = params[0].name;
          for (var i = 0; i < params.length; i++) {
            if (params[i].value != undefined) {
              res += '<br/>' + '<div style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:10px;background-color:' + params[i].color + '"></div>' + params[i].seriesName +':' + params[i].value ;
            } else {
              res += '';
            }
          }
          return res;
        }
      },
      legend: {
        show:true,
        itemWidth:20,
        itemGap:3,
        top:'6%',
        data:['2016时长','2017时长','2016保有量','2017保有量']
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        borderColor: '#e6e6e6',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,

        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        },
        data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      },
      yAxis: [
        {
          name: '月平均开工时长(小时)',
          nameLocation:'middle',
          nameGap:35,
          //   boundaryGap:true,
          type: 'value',
          min:0,
          max:200,
          interval: 50,
          // max:'dataMax',
          // minInterval: 1,
          // axisLine: {
          //   show: false
          // },
          // axisTick: {
          //   show: false
          // },
          //   axisLabel: {
          //     // show: true,
          //     // textStyle: {
          //     //   color: '#666666'
          //     // }
          //   },
          //   nameTextStyle: {
          //     color: '#666666',
          //     fontSize:6,
          //   }
        },{
          type: 'value',
          nameLocation:'middle',
          nameGap:45,
          boundaryGap:true,
          name: '车辆保有量(台)',
          nameRotate:-90,
          min:0,
          // interval: 50,
          // axisLine: {
          //   show: false
          // },
          // axisTick: {
          //   show: false
          // }
        }
      ],
      series: [
        {
          name:'2016时长',
          type: 'line',
          yAxisIndex: 0,
          data:[,,22,41,45,56,61,70,81,94,101,121]
        },{
          name:'2017时长',
          type: 'line',
          yAxisIndex: 0,
          data:[74,74,118,130,145]
        },{
          name:'2016保有量',
          type:'bar',
          yAxisIndex: 1,
          data:[,,1381,1794,2431,2838,3496,3850,4222,4703,5531,6517]
        },{
          name:'2017保有量',
          type:'bar',
          yAxisIndex: 1,
          data:[7318,8201,9106,9669,9778]
        }
      ]
    };
    var mmuOption2 = {
      title: {
        text: '开工变化趋势',
        // padding: [10, 20]
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'center',
        right: 20,
        itemGap: 30,
        // feature: {
        //   // restore: {show: true},
        //   saveAsImage: {show: true}
        // },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        backgroundColor: 'rgba(219,219,216,0.8)',
        textStyle: {
          color: '#333333'
        },formatter: function (params) {
          var res = params[0].name;
          for (var i = 0; i < params.length; i++) {
            if (params[i].value != undefined) {
              res += '<br/>' + '<div style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:10px;background-color:' + params[i].color + '"></div>' + params[i].seriesName +'年:' + params[i].value ;
            } else {
              res += '';
            }
          }
          return res;
        }
      },
      legend: {
        top:'6%',
        data:['2016','2017']
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '3%',
        borderColor: '#e6e6e6',
        containLabel: true
      },
      // dataZoom: [
      //   // {
      //   //   id: 'dataZoomX',
      //   //   type: 'inside',
      //   //   xAxisIndex: [0],
      //   //   filterMode: 'none'
      //   // },
      //   {
      //     id: 'dataZoomY',
      //     type: 'slider',
      //     yAxisIndex: [0],
      //     filterMode: 'none'
      //     // filterMode: 'filter'
      //     // filterMode: 'weakFilter'
      //     // filterMode: 'empty'
      //   }
      // ],
      xAxis: {
        type: 'category',
        boundaryGap: true,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        },
        data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      },
      yAxis: {
        name: '车辆数量(台)',
        nameLocation:'middle',
        nameGap:40,
        boundaryGap:true,
        type: 'value',
        min:0,
        // max:'dataMax',
        minInterval: 1,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        }
      },
      series: [
        {
          name:'2016',
          type: 'line',
          data:[0,0,0,0,15,186,41,45,38,32,24,21]
        },{
          name:'2017',
          type: 'line',
          data:[5,6,41,5,23,12,22,36]
        }
      ]
    };
    mmuChart1.setOption(mmuOption1);
    //单一车型查询
    vm.query = function (startDate,endDate,dateType1,dateType,monthDate,machineType1,heatType1) {
      var monthDateFormated;
      var provinceSales;//省总销售额
      var beforeProvinceSales;//上周期省总销售额
      var totalData;//总销售额
      var beforeTotalData;//上周期总销售额
      if(null==machineType1||null==heatType1) {
        Notification.warning({message: '请选择单一车型状态下查询相关参数'});
        return;
      }
      if(heatType1==1){
        var mapOption1 = chinaOption1;
      } else if(heatType1==0) {
        var mapOption1 = chinaOption2;
      }
      //判断查询时间段
      if(dateType){
        var filterTerm = dateType;
      } else if(monthDate){
        var month = monthDate.getMonth() +1;
        if(month<10){
          monthDateFormated = monthDate.getFullYear() +'0'+ month;

        }else{
          monthDateFormated = ''+monthDate.getFullYear() + month;
        }
        filterTerm = monthDateFormated;
      } else {
        if (startDate) {
          var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
          var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
          filterTerm = "startDate=" + startDateFormated;
        }
        if (endDate) {
          var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
          var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
          filterTerm += "&endDate=" + endDateFormated;
        }
      }
      var filterTermProvince = filterTerm;
      //查询开工平均工作时间
      if(heatType1==1){
          //调用封装好的查询平均时间功能--开工热度
          avgWorkHoursQuery(dateType1,filterTerm,startDate,endDate);
          vm.avgHours1 = true;
          vm.avgHours3 = false;
        //悬浮框的的隐藏和显示-work
        vm.avgHoursNational = true;
        vm.avgHoursProvince = false;
      }else if(heatType1==0){
          vm.avgHours1 = false;
          vm.avgHours3 = true;
      }

      //开工热度查询判断按某种周期
      if(heatType1==1){
        var restCallURL = START_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?workRateQuarter=";
        }
        if(dateType1==2){
          restCallURL += "month?workRateMonth=";
        }
        if(dateType1==3){
          restCallURL += "date?";
        }
        //判断是哪种车型
        if(machineType1=="1,2,3"){
          filterTerm += "&machineType=" + 1;
        }
        if(machineType1=="A1"){
          filterTerm += "&machineType=" + 2;
        }
        if(machineType1=="3"){
          filterTerm += "&machineType=" + machineType1;
        }
      }
      //销售热度查询判断按某种周期
      if(heatType1==0){
        var restCallURL = SALES_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?salesHeatQuarter=";
        }
        if(dateType1==2){
          restCallURL += "month?salesHeatMonth=";
        }
        if(dateType1==3){
          restCallURL += "date?";
        }
        //查询上周期的销售总额URL
        var beforeRestCallURL = restCallURL;
        var beforeFilter;
        if(dateType1==1){
          if(dateType==201701){
            beforeFilter = 201604;
          }else{
            beforeFilter = dateType-1;
          }
        } else if(dateType1==2){
          if(monthDateFormated==201701){
            beforeFilter = 201612;
          }else{
            beforeFilter = monthDateFormated-1;
          }
        } else if(dateType1==3){
          var startDate1 = new Date();
          var endDate1 = startDate;
          var n = startDate1.getDate()-endDate1.getDate();
          startDate1.setDate(endDate1.getDate()-n);
          var startDateFormated1 = startDate1.getFullYear() + '-' + (startDate1.getMonth() + 1) + '-' + startDate1.getDate();
          var endDateFormated1 = endDate1.getFullYear() + '-' + (endDate1.getMonth() + 1) + '-' + endDate1.getDate();
          beforeFilter = 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1;
        }
        //判断是哪种车型
        if(machineType1=="1,2,3"){
          filterTerm += "&machineType=" + 1;
          beforeFilter += "&machineType=" + 1;
        }
        if(machineType1=="A1"){
          filterTerm += "&machineType=" + 2;
          beforeFilter += "&machineType=" + 2;
        }
        if(machineType1=="3"){
          filterTerm += "&machineType=" + machineType1;
          beforeFilter += "&machineType=" + machineType1;
        }
      }

      //开工热度查询默认查询范围2小时
      if(heatType1==1){
        filterTerm += "&hourScope=2";
      }
      //拼接查询路径
      if (filterTerm){
        restCallURL += filterTerm;
      }
      if(beforeFilter){
        beforeRestCallURL += beforeFilter;
      }
      var rspData = serviceResource.restCallService(restCallURL, 'QUERY');
      rspData.then(function (data) {
        var max =100;
        if(!data.length>0){
          mapOption1.series[0].data=null;
          // Notification.warning("所选时间段暂无数据！");
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
        mapOption1.series[0].data=data;
        if(heatType1==0){
          mapOption1.visualMap.max=max;
        }
        var mapChart1 = vm.echartsInit('mapContainer1');
        mapOption1.title.left = "center";
        mapOption1.title. textStyle={fontSize: 26};
        mapOption1.title. subtextStyle={fontSize: 17};
        if(machineType1=="A1"){
          if(heatType1==1){
            mapOption1.title.text = "挖掘机开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "挖掘机销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        if(machineType1=="1,2,3"){
          if(heatType1==1){
            mapOption1.title.text = "装载机开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "装载机销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        if(machineType1=="3"){
          if(heatType1==1){
            mapOption1.title.text = "重机开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "重机销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        var mapTitleText = mapOption1.title.text;
        var mapTitleTextstyle = mapOption1.title.textStyle;
        var mapTitleSubtextstyle = mapOption1.title.subtextStyle;
        mapChart1.setOption(mapOption1);

        vm.showMachineHeatDetails(startDate,endDate,dateType1,dateType,monthDate,heatType1);
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

          }

          var restCallURLCity = restCallURL;
          restCallURLCity += "&provinces=" + param.name;
          var rspDataCity = serviceResource.restCallService(restCallURLCity, 'QUERY');
          rspDataCity.then(function (cityData) {
            var cityMax =100;
            if(!cityData.length>0){
              cityMap.series[0].data=null;
              // Notification.warning("所选时间段暂无数据！");
            } else {
              cityMax = cityData[0].value;
              for(var i=1;i<cityData.length;i++){
                if(cityMax<cityData[i].value){
                  cityMax=cityData[i].value
                }
              }
            }
            avgWorkHoursProvinceQuery(dateType1,filterTermProvince,startDate,endDate,param.name);
            //悬浮框的的隐藏和显示-work
            vm.avgHoursNational = false;
            vm.avgHoursProvince = true;
            if(heatType1==0){
              cityMap.visualMap.max=cityMax;
            }
            cityMap.series[0].data=cityData;
            cityChart.setOption(cityMap);
          }, function (reason) {
            Notification.error("获取数据失败");
          });

        })
        //省级地图返回到中国地图
        vm.backChina1 = function () {
          mapChart1 = vm.echartsInit("mapContainer1");
          mapOption1.title.text = mapTitleText;
          mapOption1.title. textStyle=mapTitleTextstyle;
          mapOption1.title. subtextStyle=mapTitleSubtextstyle;
          vm.national = true;
          vm.allProvince = false;
          //悬浮框的的隐藏和显示-work
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
            var restCallURLCity = restCallURL;
            restCallURLCity += "&provinces=" + param.name;
            if(heatType1==0){
              for(var i=0;i<totalData.length;i++){
                if(param.name==totalData[i].name){
                  vm.provinceSales = totalData[i].value;
                }
              }
              for(var q=0;q<beforeTotalData.length;q++){
                if(param.name==beforeTotalData[q].name){
                  vm.beforeProvinceSales= beforeTotalData[q].value;
                }
              }
              vm.national = false;
              vm.allProvince = true;
            }
            var rspDataCity = serviceResource.restCallService(restCallURLCity, 'QUERY');
            rspDataCity.then(function (cityData) {
              var cityMax =100;
              if(!cityData.length>0){
                cityMap.series[0].data=null;
                // Notification.warning("所选时间段暂无数据！");
              } else {
                cityMax = cityData[0].value;
                for(var i=1;i<cityData.length;i++){
                  if(cityMax<cityData[i].value){
                    cityMax=cityData[i].value
                  }
                }
              }
              avgWorkHoursProvinceQuery(dateType1,filterTermProvince,startDate,endDate,param.name);
              //悬浮框的的隐藏和显示-work
              vm.avgHoursNational = false;
              vm.avgHoursProvince = true;
              if(heatType1==0){
                cityMap.visualMap.max=cityMax;
              }
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

      vm.heatType3 = heatType1;
      var mapContainerList = document.getElementsByClassName("mapContainer");
      mapContainerList[0].style.width = "100%";
      mapContainerList[1].style.width = "100%";

      var mapContainerBoxList = document.getElementsByClassName("mapContainerBox");
      mapContainerBoxList[0].style.width = "100%";
      mapContainerBoxList[1].style.width = "0%";
      var mapContainerBox = document.getElementById("mapContainerBox");
      mapContainerBox.style.display = "none";

      //画大地图对应的变化趋势图
      var lineContainerList = document.getElementsByClassName("chart-container");
      lineContainerList[0].style.width = "65%";
      lineContainerList[1].style.width = "0%";
      mmuChart1 = echarts.init(lineContainerList[0]);
      if(heatType1==1){
        var mmuLine = mmuOption1;
      }else{
        var mmuLine = mmuOption2;
      }

      yearInfoLine(machineType1,heatType1,mmuLine,mmuChart1);

    }

    //封装查询各种车型的开工平均时长--左图和大地图调用
    function avgWorkHoursQuery(dateType1,filterTerm,startDate,endDate){
      if(dateType1==1){
        //平均工作时长URL--按季度查询
        var avgWorkHourQuarter = AVG_WORK_HOUR_QUERY_QUARTER;
        var quarter1 = filterTerm;//装载机平均时长路径
        var quarter2 = filterTerm;//挖掘机平均时长路径
        var quarter3 = filterTerm;//上周期装载机平均时长路径
        var quarter4 = filterTerm;//上周期挖掘机平均时长路径
        var quarter5 = filterTerm;//重机平均时长路径
        var quarter6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourQuarter1 = avgWorkHourQuarter;
        avgWorkHourQuarter1 += quarter1 + '&machineType=1';//装载机平均时长路径
        var avgWorkHourQuarter2 = avgWorkHourQuarter;
        avgWorkHourQuarter2 += quarter2 + '&machineType=2';//挖掘机平均时长路径
        var avgWorkHourQuarter5 = avgWorkHourQuarter;
        avgWorkHourQuarter5 += quarter5 + '&machineType=3';//重机平均时长路径
        var avgWorkHourQuarter3 = avgWorkHourQuarter;
        var avgWorkHourQuarter4 = avgWorkHourQuarter;
        var avgWorkHourQuarter6 = avgWorkHourQuarter;
        if(quarter3==201701){
          avgWorkHourQuarter3 += 201604 + '&machineType=1';//上周期装载机平均时长路径
          avgWorkHourQuarter4 += 201604 + '&machineType=2';//上周期挖掘机平均时长路径
          avgWorkHourQuarter6 += 201604 + '&machineType=3';//上周期重机平均时长路径
        } else {
          avgWorkHourQuarter3 += (quarter3-1) + '&machineType=1';//上周期装载机平均时长路径
          avgWorkHourQuarter4 += (quarter4-1) + '&machineType=2';//上周期挖掘机平均时长路径
          avgWorkHourQuarter6 += (quarter6-1) + '&machineType=3';//上周期重机平均时长路径
        }
        var zData = serviceResource.restCallService(avgWorkHourQuarter1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHours = zdata.avgHours;
        });
        var zBeforeData = serviceResource.restCallService(avgWorkHourQuarter3, 'GET');
        zBeforeData.then(function (zdata1) {
          vm.beforeLoaderHours = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourQuarter2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHours = wdata.avgHours;
        });
        var wBeforeData = serviceResource.restCallService(avgWorkHourQuarter4, 'GET');
        wBeforeData.then(function (wdata1) {
          vm.beforeExcavatorHours = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourQuarter5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHours = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourQuarter6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHours = zhdata1.avgHours;
        });
      } else if(dateType1==2){
        // //平均工作时长URL--按月查询
        var avgWorkHourMonth = AVG_WORK_HOUR_QUERY_MONTH;
        var month1 = filterTerm;//装载机平均时长路径
        var month2 = filterTerm;//挖掘机平均时长路径
        var month3 = filterTerm;//上周期装载机平均时长路径
        var month4 = filterTerm;//上周期挖掘机平均时长路径
        var month5 = filterTerm;//重机平均时长路径
        var month6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourMonth1 = avgWorkHourMonth;
        avgWorkHourMonth1 += month1 + '&machineType=1';//装载机平均时长路径
        var avgWorkHourMonth2 = avgWorkHourMonth;
        avgWorkHourMonth2 += month2 + '&machineType=2';//挖掘机平均时长路径
        var avgWorkHourMonth5 = avgWorkHourMonth;
        avgWorkHourMonth5 += month5 + '&machineType=3';//重机平均时长路径
        var avgWorkHourMonth3 = avgWorkHourMonth;
        var avgWorkHourMonth4 = avgWorkHourMonth;
        var avgWorkHourMonth6 = avgWorkHourMonth;
        if(month3==201701){
          avgWorkHourMonth3 += 201612 + '&machineType=1';//上周期装载机平均时长路径
          avgWorkHourMonth4 += 201612 + '&machineType=2';//上周期挖掘机平均时长路径
          avgWorkHourMonth6 += 201612 + '&machineType=3';//上周期重机平均时长路径
        } else {
          avgWorkHourMonth3 += (month3-1) + '&machineType=1';//上周期装载机平均时长路径
          avgWorkHourMonth4 += (month4-1) + '&machineType=2';//上周期挖掘机平均时长路径
          avgWorkHourMonth6 += (month6-1) + '&machineType=3';//上周期重机平均时长路径
        }
        var zData = serviceResource.restCallService(avgWorkHourMonth1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHours = zdata.avgHours;
        });
        var zData1 = serviceResource.restCallService(avgWorkHourMonth3, 'GET');
        zData1.then(function (zdata1) {
          vm.beforeLoaderHours = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourMonth2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHours = wdata.avgHours;
        });
        var wData1 = serviceResource.restCallService(avgWorkHourMonth4, 'GET');
        wData1.then(function (wdata1) {
          vm.beforeExcavatorHours = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourMonth5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHours = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourMonth6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHours = zhdata1.avgHours;
        });
      } else if(dateType1==3){
        // //平均工作时长URL--按天查询
        var avgWorkHourDate = AVG_WORK_HOUR_QUERY_DATE;
        var date1 = filterTerm;//上周期装载机平均时长路径
        var date2 = filterTerm;//上周期挖掘机平均时长路径
        var date3 = filterTerm;//上周期装载机平均时长路径
        var date4 = filterTerm;//上周期挖掘机平均时长路径
        var date5 = filterTerm;//重机平均时长路径
        var date6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourDate1 = avgWorkHourDate;
        avgWorkHourDate1 += date1 +  '&machineType=1';//装载机平均时长路径
        var avgWorkHourDate2 = avgWorkHourDate;
        avgWorkHourDate2 += date2 + '&machineType=2';//挖掘机平均时长路径
        var avgWorkHourDate5 = avgWorkHourDate;
        avgWorkHourDate5 += date5 + '&machineType=3';//重机平均时长路径
        var startDate1 = new Date();
        var endDate1 = startDate;
        var n = startDate1.getDate()-endDate1.getDate();
        startDate1.setDate(endDate1.getDate()-n);
        var startDateFormated1 = startDate1.getFullYear() + '-' + (startDate1.getMonth() + 1) + '-' + startDate1.getDate();
        var endDateFormated1 = endDate1.getFullYear() + '-' + (endDate1.getMonth() + 1) + '-' + endDate1.getDate();
        var avgWorkHourDate3 = avgWorkHourDate;
        avgWorkHourDate3 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=1';//装载机平均时长路径
        var avgWorkHourDate4 = avgWorkHourDate;
        avgWorkHourDate4 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=2';//挖掘机平均时长路径
        var avgWorkHourDate6 = avgWorkHourDate;
        avgWorkHourDate6 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=3';//重机平均时长路径
        var zData = serviceResource.restCallService(avgWorkHourDate1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHours = zdata.avgHours;
        });
        var zData1 = serviceResource.restCallService(avgWorkHourDate3, 'GET');
        zData1.then(function (zdata1) {
          vm.beforeLoaderHours = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourDate2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHours = wdata.avgHours;
        });
        var wData1 = serviceResource.restCallService(avgWorkHourDate4, 'GET');
        wData1.then(function (wdata1) {
          vm.beforeExcavatorHours = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourDate5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHours = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourDate6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHours = zhdata1.avgHours;
        });
      }
    }
    //封装查询各种车型的开工平均时长--右图调用
    function avgWorkHoursQuery2(dateType1,filterTerm,startDate,endDate){
      if(dateType1==1){
        //平均工作时长URL--按季度查询
        var avgWorkHourQuarter = AVG_WORK_HOUR_QUERY_QUARTER;
        var quarter1 = filterTerm;//装载机平均时长路径
        var quarter2 = filterTerm;//挖掘机平均时长路径
        var quarter3 = filterTerm;//上周期装载机平均时长路径
        var quarter4 = filterTerm;//上周期挖掘机平均时长路径
        var quarter5 = filterTerm;//重机平均时长路径
        var quarter6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourQuarter1 = avgWorkHourQuarter;
        avgWorkHourQuarter1 += quarter1 + '&machineType=1';//装载机平均时长路径
        var avgWorkHourQuarter2 = avgWorkHourQuarter;
        avgWorkHourQuarter2 += quarter2 + '&machineType=2';//挖掘机平均时长路径
        var avgWorkHourQuarter5 = avgWorkHourQuarter;
        avgWorkHourQuarter5 += quarter5 + '&machineType=3';//重机平均时长路径
        var avgWorkHourQuarter3 = avgWorkHourQuarter;
        var avgWorkHourQuarter4 = avgWorkHourQuarter;
        var avgWorkHourQuarter6 = avgWorkHourQuarter;
        if(quarter3==201701){
          avgWorkHourQuarter3 += 201604 + '&machineType=1';//上周期装载机平均时长路径
          avgWorkHourQuarter4 += 201604 + '&machineType=2';//上周期挖掘机平均时长路径
          avgWorkHourQuarter6 += 201604 + '&machineType=3';//上周期重机平均时长路径
        } else {
          avgWorkHourQuarter3 += (quarter3-1) + '&machineType=1';//上周期装载机平均时长路径
          avgWorkHourQuarter4 += (quarter4-1) + '&machineType=2';//上周期挖掘机平均时长路径
          avgWorkHourQuarter6 += (quarter6-1) + '&machineType=3';//上周期重机平均时长路径
        }
        var zData = serviceResource.restCallService(avgWorkHourQuarter1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHours2 = zdata.avgHours;
        });
        var zBeforeData = serviceResource.restCallService(avgWorkHourQuarter3, 'GET');
        zBeforeData.then(function (zdata1) {
          vm.beforeLoaderHours2 = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourQuarter2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHours2 = wdata.avgHours;
        });
        var wBeforeData = serviceResource.restCallService(avgWorkHourQuarter4, 'GET');
        wBeforeData.then(function (wdata1) {
          vm.beforeExcavatorHours2 = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourQuarter5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHours2 = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourQuarter6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHours2 = zhdata1.avgHours;
        });
      } else if(dateType1==2){
        // //平均工作时长URL--按月查询
        var avgWorkHourMonth = AVG_WORK_HOUR_QUERY_MONTH;
        var month1 = filterTerm;//装载机平均时长路径
        var month2 = filterTerm;//挖掘机平均时长路径
        var month3 = filterTerm;//上周期装载机平均时长路径
        var month4 = filterTerm;//上周期挖掘机平均时长路径
        var month5 = filterTerm;//重机平均时长路径
        var month6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourMonth1 = avgWorkHourMonth;
        avgWorkHourMonth1 += month1 + '&machineType=1';//装载机平均时长路径
        var avgWorkHourMonth2 = avgWorkHourMonth;
        avgWorkHourMonth2 += month2 + '&machineType=2';//挖掘机平均时长路径
        var avgWorkHourMonth5 = avgWorkHourMonth;
        avgWorkHourMonth5 += month5 + '&machineType=3';//重机平均时长路径
        var avgWorkHourMonth3 = avgWorkHourMonth;
        var avgWorkHourMonth4 = avgWorkHourMonth;
        var avgWorkHourMonth6 = avgWorkHourMonth;
        if(month3==201701){
          avgWorkHourMonth3 += 201612 + '&machineType=1';//上周期装载机平均时长路径
          avgWorkHourMonth4 += 201612 + '&machineType=2';//上周期挖掘机平均时长路径
          avgWorkHourMonth6 += 201612 + '&machineType=3';//上周期重机平均时长路径
        } else {
          avgWorkHourMonth3 += (month3-1) + '&machineType=1';//上周期装载机平均时长路径
          avgWorkHourMonth4 += (month4-1) + '&machineType=2';//上周期挖掘机平均时长路径
          avgWorkHourMonth6 += (month6-1) + '&machineType=3';//上周期重机平均时长路径
        }
        var zData = serviceResource.restCallService(avgWorkHourMonth1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHours2 = zdata.avgHours;
        });
        var zData1 = serviceResource.restCallService(avgWorkHourMonth3, 'GET');
        zData1.then(function (zdata1) {
          vm.beforeLoaderHours2 = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourMonth2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHours2 = wdata.avgHours;
        });
        var wData1 = serviceResource.restCallService(avgWorkHourMonth4, 'GET');
        wData1.then(function (wdata1) {
          vm.beforeExcavatorHours2 = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourMonth5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHours2 = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourMonth6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHours2 = zhdata1.avgHours;
        });
      } else if(dateType1==3){
        // //平均工作时长URL--按天查询
        var avgWorkHourDate = AVG_WORK_HOUR_QUERY_DATE;
        var date1 = filterTerm;//上周期装载机平均时长路径
        var date2 = filterTerm;//上周期挖掘机平均时长路径
        var date3 = filterTerm;//上周期装载机平均时长路径
        var date4 = filterTerm;//上周期挖掘机平均时长路径
        var date5 = filterTerm;//重机平均时长路径
        var date6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourDate1 = avgWorkHourDate;
        avgWorkHourDate1 += date1 +  '&machineType=1';//装载机平均时长路径
        var avgWorkHourDate2 = avgWorkHourDate;
        avgWorkHourDate2 += date2 + '&machineType=2';//挖掘机平均时长路径
        var avgWorkHourDate5 = avgWorkHourDate;
        avgWorkHourDate5 += date5 + '&machineType=3';//重机平均时长路径
        var startDate1 = new Date();
        var endDate1 = startDate;
        var n = startDate1.getDate()-endDate1.getDate();
        startDate1.setDate(endDate1.getDate()-n);
        var startDateFormated1 = startDate1.getFullYear() + '-' + (startDate1.getMonth() + 1) + '-' + startDate1.getDate();
        var endDateFormated1 = endDate1.getFullYear() + '-' + (endDate1.getMonth() + 1) + '-' + endDate1.getDate();
        var avgWorkHourDate3 = avgWorkHourDate;
        avgWorkHourDate3 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=1';//装载机平均时长路径
        var avgWorkHourDate4 = avgWorkHourDate;
        avgWorkHourDate4 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=2';//挖掘机平均时长路径
        var avgWorkHourDate6 = avgWorkHourDate;
        avgWorkHourDate6 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=3';//重机平均时长路径
        var zData = serviceResource.restCallService(avgWorkHourDate1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHours2 = zdata.avgHours;
        });
        var zData1 = serviceResource.restCallService(avgWorkHourDate3, 'GET');
        zData1.then(function (zdata1) {
          vm.beforeLoaderHours2 = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourDate2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHours2 = wdata.avgHours;
        });
        var wData1 = serviceResource.restCallService(avgWorkHourDate4, 'GET');
        wData1.then(function (wdata1) {
          vm.beforeExcavatorHours2 = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourDate5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHours2 = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourDate6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHours2 = zhdata1.avgHours;
        });
      }
    }
    //封装查询各种车型的开工平均时长--左图和大地图调用--省份下钻
    function avgWorkHoursProvinceQuery(dateType1,filterTerm,startDate,endDate,nameProvince){
      if(dateType1==1){
        //平均工作时长URL--按季度查询
        var avgWorkHourQuarter = AVG_WORK_HOUR_QUERY_QUARTER;
        var quarter1 = filterTerm;//装载机平均时长路径
        var quarter2 = filterTerm;//挖掘机平均时长路径
        var quarter3 = filterTerm;//上周期装载机平均时长路径
        var quarter4 = filterTerm;//上周期挖掘机平均时长路径
        var quarter5 = filterTerm;//重机平均时长路径
        var quarter6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourQuarter1 = avgWorkHourQuarter;
        avgWorkHourQuarter1 += quarter1 + '&machineType=1&provinces=' + nameProvince;//装载机平均时长路径
        var avgWorkHourQuarter2 = avgWorkHourQuarter;
        avgWorkHourQuarter2 += quarter2 + '&machineType=2&provinces=' + nameProvince;//挖掘机平均时长路径
        var avgWorkHourQuarter5 = avgWorkHourQuarter;
        avgWorkHourQuarter5 += quarter5 + '&machineType=3&provinces=' + nameProvince;//挖掘机平均时长路径
        var avgWorkHourQuarter3 = avgWorkHourQuarter;
        var avgWorkHourQuarter4 = avgWorkHourQuarter;
        var avgWorkHourQuarter6 = avgWorkHourQuarter;
        if(quarter3==201701){
          avgWorkHourQuarter3 += 201604 + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
          avgWorkHourQuarter4 += 201604 + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
          avgWorkHourQuarter6 += 201604 + '&machineType=3&provinces=' + nameProvince;//上周期重机平均时长路径
        } else {
          avgWorkHourQuarter3 += (quarter3-1) + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
          avgWorkHourQuarter4 += (quarter4-1) + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
          avgWorkHourQuarter6 += (quarter6-1) + '&machineType=3&provinces=' + nameProvince;//上周期挖掘机平均时长路径
        }
        var zData = serviceResource.restCallService(avgWorkHourQuarter1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHoursProvince  = zdata.avgHours;
        });
        var zBeforeData = serviceResource.restCallService(avgWorkHourQuarter3, 'GET');
        zBeforeData.then(function (zdata1) {
          vm.beforeLoaderHoursProvince  = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourQuarter2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHoursProvince  = wdata.avgHours;
        });
        var wBeforeData = serviceResource.restCallService(avgWorkHourQuarter4, 'GET');
        wBeforeData.then(function (wdata1) {
          vm.beforeExcavatorHoursProvince  = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourQuarter5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHoursProvince = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourQuarter6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHoursProvince = zhdata1.avgHours;
        });
      } else if(dateType1==2){
        // //平均工作时长URL--按月查询
        var avgWorkHourMonth = AVG_WORK_HOUR_QUERY_MONTH;
        var month1 = filterTerm;//装载机平均时长路径
        var month2 = filterTerm;//挖掘机平均时长路径
        var month3 = filterTerm;//上周期装载机平均时长路径
        var month4 = filterTerm;//上周期挖掘机平均时长路径
        var month5 = filterTerm;//重机平均时长路径
        var month6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourMonth1 = avgWorkHourMonth;
        avgWorkHourMonth1 += month1 + '&machineType=1&provinces=' + nameProvince;//装载机平均时长路径
        var avgWorkHourMonth2 = avgWorkHourMonth;
        avgWorkHourMonth2 += month2 + '&machineType=2&provinces=' + nameProvince;//挖掘机平均时长路径
        var avgWorkHourMonth5 = avgWorkHourMonth;
        avgWorkHourMonth5 += month5 + '&machineType=3&provinces=' + nameProvince;//重机平均时长路径
        var avgWorkHourMonth3 = avgWorkHourMonth;
        var avgWorkHourMonth4 = avgWorkHourMonth;
        var avgWorkHourMonth6 = avgWorkHourMonth;
        if(month3==201701){
          avgWorkHourMonth3 += 201612 + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
          avgWorkHourMonth4 += 201612 + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
          avgWorkHourMonth6 += 201612 + '&machineType=3&provinces=' + nameProvince;//上周期挖掘机平均时长路径
        } else {
          avgWorkHourMonth3 += (month3-1) + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
          avgWorkHourMonth4 += (month4-1) + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
          avgWorkHourMonth6 += (month6-1) + '&machineType=3&provinces=' + nameProvince;//上周期挖掘机平均时长路径
        }
        var zData = serviceResource.restCallService(avgWorkHourMonth1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHoursProvince = zdata.avgHours;
        });
        var zData1 = serviceResource.restCallService(avgWorkHourMonth3, 'GET');
        zData1.then(function (zdata1) {
          vm.beforeLoaderHoursProvince = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourMonth2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHoursProvince = wdata.avgHours;
        });
        var wData1 = serviceResource.restCallService(avgWorkHourMonth4, 'GET');
        wData1.then(function (wdata1) {
          vm.beforeExcavatorHoursProvince = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourMonth5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHoursProvince = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourMonth6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHoursProvince = zhdata1.avgHours;
        });
      } else if(dateType1==3){
        // //平均工作时长URL--按天查询
        var avgWorkHourDate = AVG_WORK_HOUR_QUERY_DATE;
        var date1 = filterTerm;//装载机平均时长路径
        var date2 = filterTerm;//挖掘机平均时长路径
        var date3 = filterTerm;//上周期装载机平均时长路径
        var date4 = filterTerm;//上周期挖掘机平均时长路径
        var date5 = filterTerm;//重机平均时长路径
        var date6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourDate1 = avgWorkHourDate;
        avgWorkHourDate1 += date1 +  '&machineType=1&provinces=' + nameProvince;//装载机平均时长路径
        var avgWorkHourDate2 = avgWorkHourDate;
        avgWorkHourDate2 += date2 + '&machineType=2&provinces=' + nameProvince;//挖掘机平均时长路径
        var avgWorkHourDate5 = avgWorkHourDate;
        avgWorkHourDate5 += date5 + '&machineType=3&provinces=' + nameProvince;//挖掘机平均时长路径

        var startDate1 = new Date();
        var endDate1 = startDate;
        var n = startDate1.getDate()-endDate1.getDate();
        startDate1.setDate(endDate1.getDate()-n);
        var startDateFormated1 = startDate1.getFullYear() + '-' + (startDate1.getMonth() + 1) + '-' + startDate1.getDate();
        var endDateFormated1 = endDate1.getFullYear() + '-' + (endDate1.getMonth() + 1) + '-' + endDate1.getDate();
        var avgWorkHourDate3 = avgWorkHourDate;
        avgWorkHourDate3 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=1&provinces=' + nameProvince;//装载机平均时长路径
        var avgWorkHourDate4 = avgWorkHourDate;
        avgWorkHourDate4 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=2&provinces=' + nameProvince;//挖掘机平均时长路径
        var avgWorkHourDate6 = avgWorkHourDate;
        avgWorkHourDate6 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=3&provinces=' + nameProvince;//重机平均时长路径
        var zData = serviceResource.restCallService(avgWorkHourDate1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHoursProvince = zdata.avgHours;
        });
        var zData1 = serviceResource.restCallService(avgWorkHourDate3, 'GET');
        zData1.then(function (zdata1) {
          vm.beforeLoaderHoursProvince = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourDate2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHoursProvince = wdata.avgHours;
        });
        var wData1 = serviceResource.restCallService(avgWorkHourDate4, 'GET');
        wData1.then(function (wdata1) {
          vm.beforeExcavatorHoursProvince = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourDate5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHoursProvince = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourDate6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHoursProvince = zhdata1.avgHours;
        });
      }
    }
    //封装查询各种车型的开工平均时长--右图调用--省份下钻
    function avgWorkHoursProvinceQuery2(dateType1,filterTerm,startDate,endDate,nameProvince){
      if(dateType1==1){
        //平均工作时长URL--按季度查询
        var avgWorkHourQuarter = AVG_WORK_HOUR_QUERY_QUARTER;
        var quarter1 = filterTerm;//装载机平均时长路径
        var quarter2 = filterTerm;//挖掘机平均时长路径
        var quarter3 = filterTerm;//上周期装载机平均时长路径
        var quarter4 = filterTerm;//上周期挖掘机平均时长路径
        var quarter5 = filterTerm;//重机平均时长路径
        var quarter6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourQuarter1 = avgWorkHourQuarter;
        avgWorkHourQuarter1 += quarter1 + '&machineType=1&provinces=' + nameProvince;//装载机平均时长路径
        var avgWorkHourQuarter2 = avgWorkHourQuarter;
        avgWorkHourQuarter2 += quarter2 + '&machineType=2&provinces=' + nameProvince;//挖掘机平均时长路径
        var avgWorkHourQuarter5 = avgWorkHourQuarter;
        avgWorkHourQuarter5 += quarter5 + '&machineType=3&provinces=' + nameProvince;//重机平均时长路径
        var avgWorkHourQuarter3 = avgWorkHourQuarter;
        var avgWorkHourQuarter4 = avgWorkHourQuarter;
        var avgWorkHourQuarter6 = avgWorkHourQuarter;
        if(quarter3==201701){
          avgWorkHourQuarter3 += 201604 + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
          avgWorkHourQuarter4 += 201604 + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
          avgWorkHourQuarter6 += 201604 + '&machineType=3&provinces=' + nameProvince;//上周期重机平均时长路径
        } else {
          avgWorkHourQuarter3 += (quarter3-1) + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
          avgWorkHourQuarter4 += (quarter4-1) + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
          avgWorkHourQuarter6 += (quarter6-1) + '&machineType=3&provinces=' + nameProvince;//上周期重机平均时长路径
        }
        var zData = serviceResource.restCallService(avgWorkHourQuarter1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHoursProvince2  = zdata.avgHours;
        });
        var zBeforeData = serviceResource.restCallService(avgWorkHourQuarter3, 'GET');
        zBeforeData.then(function (zdata1) {
          vm.beforeLoaderHoursProvince2  = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourQuarter2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHoursProvince2  = wdata.avgHours;
        });
        var wBeforeData = serviceResource.restCallService(avgWorkHourQuarter4, 'GET');
        wBeforeData.then(function (wdata1) {
          vm.beforeExcavatorHoursProvince2  = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourQuarter5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHoursProvince2 = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourQuarter6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHoursProvince2 = zhdata1.avgHours;
        });
      } else if(dateType1==2){
        // //平均工作时长URL--按月查询
        var avgWorkHourMonth = AVG_WORK_HOUR_QUERY_MONTH;
        var month1 = filterTerm;//装载机平均时长路径
        var month2 = filterTerm;//挖掘机平均时长路径
        var month3 = filterTerm;//上周期装载机平均时长路径
        var month4 = filterTerm;//上周期挖掘机平均时长路径
        var month5 = filterTerm;//重机平均时长路径
        var month6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourMonth1 = avgWorkHourMonth;
        avgWorkHourMonth1 += month1 + '&machineType=1&provinces=' + nameProvince;//装载机平均时长路径
        var avgWorkHourMonth2 = avgWorkHourMonth;
        avgWorkHourMonth2 += month2 + '&machineType=2&provinces=' + nameProvince;//挖掘机平均时长路径
        var avgWorkHourMonth5 = avgWorkHourMonth;
        avgWorkHourMonth5 += month5 + '&machineType=3&provinces=' + nameProvince;//重机平均时长路径
        var avgWorkHourMonth3 = avgWorkHourMonth;
        var avgWorkHourMonth4 = avgWorkHourMonth;
        var avgWorkHourMonth6 = avgWorkHourMonth;
        if(month3==201701){
          avgWorkHourMonth3 += 201612 + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
          avgWorkHourMonth4 += 201612 + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
          avgWorkHourMonth6 += 201612 + '&machineType=3&provinces=' + nameProvince;//上周期重机平均时长路径
        } else {
          avgWorkHourMonth3 += (month3-1) + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
          avgWorkHourMonth4 += (month4-1) + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
          avgWorkHourMonth6 += (month6-1) + '&machineType=3&provinces=' + nameProvince;//上周期重机平均时长路径
        }
        var zData = serviceResource.restCallService(avgWorkHourMonth1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHoursProvince2 = zdata.avgHours;
        });
        var zData1 = serviceResource.restCallService(avgWorkHourMonth3, 'GET');
        zData1.then(function (zdata1) {
          vm.beforeLoaderHoursProvince2 = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourMonth2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHoursProvince2 = wdata.avgHours;
        });
        var wData1 = serviceResource.restCallService(avgWorkHourMonth4, 'GET');
        wData1.then(function (wdata1) {
          vm.beforeExcavatorHoursProvince2 = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourMonth5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHoursProvince2 = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourMonth6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHoursProvince2 = zhdata1.avgHours;
        });
      } else if(dateType1==3){
        // //平均工作时长URL--按天查询
        var avgWorkHourDate = AVG_WORK_HOUR_QUERY_DATE;
        var date1 = filterTerm;//装载机平均时长路径
        var date2 = filterTerm;//挖掘机平均时长路径
        var date3 = filterTerm;//上周期装载机平均时长路径
        var date4 = filterTerm;//上周期挖掘机平均时长路径
        var date5 = filterTerm;//重机平均时长路径
        var date6 = filterTerm;//上周期重机平均时长路径
        var avgWorkHourDate1 = avgWorkHourDate;
        avgWorkHourDate1 += date1 +  '&machineType=1&provinces=' + nameProvince;//装载机平均时长路径
        var avgWorkHourDate2 = avgWorkHourDate;
        avgWorkHourDate2 += date2 + '&machineType=2&provinces=' + nameProvince;//挖掘机平均时长路径
        var avgWorkHourDate5 = avgWorkHourDate;
        avgWorkHourDate5 += date5 + '&machineType=3&provinces=' + nameProvince;//重机平均时长路径

        var startDate1 = new Date();
        var endDate1 = startDate;
        var n = startDate1.getDate()-endDate1.getDate();
        startDate1.setDate(endDate1.getDate()-n);
        var startDateFormated1 = startDate1.getFullYear() + '-' + (startDate1.getMonth() + 1) + '-' + startDate1.getDate();
        var endDateFormated1 = endDate1.getFullYear() + '-' + (endDate1.getMonth() + 1) + '-' + endDate1.getDate();
        var avgWorkHourDate3 = avgWorkHourDate;
        avgWorkHourDate3 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=1&provinces=' + nameProvince;//上周期装载机平均时长路径
        var avgWorkHourDate4 = avgWorkHourDate;
        avgWorkHourDate4 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=2&provinces=' + nameProvince;//上周期挖掘机平均时长路径
        var avgWorkHourDate6 = avgWorkHourDate;
        avgWorkHourDate6 += 'startDate=' + startDateFormated1 + '&endDate='+ endDateFormated1 + '&machineType=3&provinces=' + nameProvince;//上周期重机平均时长路径
        var zData = serviceResource.restCallService(avgWorkHourDate1, 'GET');
        zData.then(function (zdata) {
          vm.loaderHoursProvince2 = zdata.avgHours;
        });
        var zData1 = serviceResource.restCallService(avgWorkHourDate3, 'GET');
        zData1.then(function (zdata1) {
          vm.beforeLoaderHoursProvince2 = zdata1.avgHours;
        });
        var wData = serviceResource.restCallService(avgWorkHourDate2, 'GET');
        wData.then(function (wdata) {
          vm.excavatorHoursProvince2 = wdata.avgHours;
        });
        var wData1 = serviceResource.restCallService(avgWorkHourDate4, 'GET');
        wData1.then(function (wdata1) {
          vm.beforeExcavatorHoursProvince2 = wdata1.avgHours;
        });
        var zhData = serviceResource.restCallService(avgWorkHourDate5, 'GET');
        zhData.then(function (zhdata) {
          vm.heavyHoursProvince2 = zhdata.avgHours;
        });
        var zhBeforeData = serviceResource.restCallService(avgWorkHourDate6, 'GET');
        zhBeforeData.then(function (zhdata1) {
          vm.beforeHeavyHoursProvince2 = zhdata1.avgHours;
        });
      }
    }
    //封装折线图数据查询及生成--左图和大地图调用
    function yearInfoLine(machineType1,heatType1,mmuLine,mmuChart1,machineType2,heatType2,mmuLine2,mmuChart2){

      if(heatType1==1){
        //判断是哪种车型
        if(machineType1=="1,2,3"){
          var YearURL1 = WORK_HOUR_YEAR_QUERY_DATE + "2016&machineType=1";
          var YearURL2 = WORK_HOUR_YEAR_QUERY_DATE + "2017&machineType=1";
          var YearOwnership1 = GET_OWNERSHIP_URL + "2016&machineType=1";
          var YearOwnership2 = GET_OWNERSHIP_URL + "2017&machineType=1";
        }else if(machineType1=="A1"){
          YearURL1= WORK_HOUR_YEAR_QUERY_DATE + "2016&machineType=2";
          YearURL2= WORK_HOUR_YEAR_QUERY_DATE + "2017&machineType=2";
          YearOwnership1 = GET_OWNERSHIP_URL + "2016&machineType=2";
          YearOwnership2 = GET_OWNERSHIP_URL + "2017&machineType=2";
        }else if(machineType1=="3"){
          YearURL1= WORK_HOUR_YEAR_QUERY_DATE + "2016&machineType=3";
          YearURL2= WORK_HOUR_YEAR_QUERY_DATE + "2017&machineType=3";
          YearOwnership1 = GET_OWNERSHIP_URL + "2016&machineType=3";
          YearOwnership2 = GET_OWNERSHIP_URL + "2017&machineType=3";
        }
      } else if(heatType1==0){
        //判断是哪种车型
        if(machineType1=="1,2,3"){
          YearURL1= SALES_YEAR_QUERY + "2016&machineType=1";
          YearURL2= SALES_YEAR_QUERY + "2017&machineType=1";
        }else if(machineType1=="A1"){
          YearURL1= SALES_YEAR_QUERY + "2016&machineType=2";
          YearURL2= SALES_YEAR_QUERY + "2017&machineType=2";
        }else if(machineType1=="3"){
          YearURL1= SALES_YEAR_QUERY + "2016&machineType=3";
          YearURL2= SALES_YEAR_QUERY + "2017&machineType=3";
        }
      }

      var workHoursYearData1 = serviceResource.restCallService(YearURL1, 'QUERY');//2016
      workHoursYearData1.then(function (data) {
        if(heatType1==1){
          if(machineType1=="1,2,3"){
            var yearData1 = [,,];
          } else if(machineType1=="A1"){
            var yearData1 = [,,,,,,];
          } else {
            var yearData1 = [];
          }
        } else {
          var yearData1 = [];
        }
        for(var i=0;i<data.length;i++){
          var value = data[i].tData;
          yearData1.push(value);
        }
        mmuLine.series[0].data = yearData1;
        var workHoursYearData2 = serviceResource.restCallService(YearURL2, 'QUERY');//2017
        workHoursYearData2.then(function (data) {
          var yearData2 = [];
          var date = new Date();
          var month = (date.getMonth()+1)+'月';
          for(var i=0;i<data.length;i++){
            if(data[i].tMonth!=month){
              var value = data[i].tData;
              yearData2.push(value);
            }
          }
          if(heatType1==0){
            if(machineType1=="A1"){
              mmuLine.title.text = "挖掘机销售变化趋势";
              mmuLine.yAxis.name = '车辆数量(台)';
            }
            if(machineType1=="1,2,3"){
              mmuLine.title.text = "装载机销售变化趋势";
              mmuLine.yAxis.name = '车辆数量(台)';
            }
            if(machineType1=="3"){
              mmuLine.title.text = "重机销售变化趋势";
              mmuLine.yAxis.name = '车辆数量(台)';
            }
            mmuLine.series[1].data = yearData2;
            mmuChart1.setOption(mmuLine);
            if(heatType2){
              yearInfoLine2(machineType2,heatType2,mmuLine2,mmuChart2);
            }
          }else{
            var YearOwnershipData1 = serviceResource.restCallService(YearOwnership1, 'QUERY');//2016
            YearOwnershipData1.then(function (data1) {
              if(heatType1==1){
                if(machineType1=="1,2,3"){
                  var ownershipData1 = [,,];
                } else if(machineType1=="A1"){
                  var ownershipData1 = [,,,,,,];
                } else {
                  var ownershipData1 = [];
                }
              } else {
                var ownershipData1 = [];
              }

              for(var i=0;i<data1.length;i++){
                var value = data1[i].tData;
                ownershipData1.push(value);
              }
              mmuLine.series[2].data = ownershipData1;
              var workHoursYearData2 = serviceResource.restCallService(YearOwnership2, 'QUERY');//2017
              workHoursYearData2.then(function (data2) {
                var ownershipData2 = [];
                var date = new Date();
                var month = (date.getMonth()+1)+'月';
                for(var i=0;i<data2.length;i++){
                  if(data2[i].tMonth!=month){
                    var value = data2[i].tData;
                    ownershipData2.push(value);
                  }
                }
                mmuLine.series[3].data = ownershipData2;
                if(machineType1=="A1"){
                  mmuLine.title.text = "挖掘机开工变化趋势";
                  mmuLine.yAxis.name = '月平均开工时长(小时)';
                }
                if(machineType1=="1,2,3"){
                  mmuLine.title.text = "装载机开工变化趋势";
                  mmuLine.yAxis.name = '月平均开工时长(小时)';
                }
                if(machineType1=="3"){
                  mmuLine.title.text = "重机开工变化趋势";
                  mmuLine.yAxis.name = '月平均开工时长(小时)';
                }
                mmuLine.series[1].data = yearData2;
                mmuChart1.setOption(mmuLine);
                if(heatType2){
                  yearInfoLine2(machineType2,heatType2,mmuLine2,mmuChart2);
                }
              });
            });
          }
        });
      });

    }
    //封装折线图数据查询及生成--右图调用
    function yearInfoLine2(machineType2,heatType2,mmuLine2,mmuChart2){

      if(heatType2==1){
        //判断是哪种车型
        if(machineType2=="1,2,3"){
          var YearURL1 = WORK_HOUR_YEAR_QUERY_DATE + "2016&machineType=1";
          var YearURL2 = WORK_HOUR_YEAR_QUERY_DATE + "2017&machineType=1";
          var YearOwnership1 = GET_OWNERSHIP_URL + "2016&machineType=1";
          var YearOwnership2 = GET_OWNERSHIP_URL + "2017&machineType=1";
        }else if(machineType2=="A1"){
          YearURL1= WORK_HOUR_YEAR_QUERY_DATE + "2016&machineType=2";
          YearURL2= WORK_HOUR_YEAR_QUERY_DATE + "2017&machineType=2";
          YearOwnership1 = GET_OWNERSHIP_URL + "2016&machineType=2";
          YearOwnership2 = GET_OWNERSHIP_URL + "2017&machineType=2";
        }else if(machineType2=="3"){
          YearURL1= WORK_HOUR_YEAR_QUERY_DATE + "2016&machineType=3";
          YearURL2= WORK_HOUR_YEAR_QUERY_DATE + "2017&machineType=3";
          YearOwnership1 = GET_OWNERSHIP_URL + "2016&machineType=3";
          YearOwnership2 = GET_OWNERSHIP_URL + "2017&machineType=3";
        }

      } else if(heatType2==0){
        //判断是哪种车型
        if(machineType2=="1,2,3"){
          YearURL1= SALES_YEAR_QUERY + "2016&machineType=1";
          YearURL2= SALES_YEAR_QUERY + "2017&machineType=1";
        }else if(machineType2=="A1"){
          YearURL1= SALES_YEAR_QUERY + "2016&machineType=2";
          YearURL2= SALES_YEAR_QUERY + "2017&machineType=2";
        }else if(machineType2=="3"){
          YearURL1= SALES_YEAR_QUERY + "2016&machineType=3";
          YearURL2= SALES_YEAR_QUERY + "2017&machineType=3";
        }
      }

      var workHoursYearData1 = serviceResource.restCallService(YearURL1, 'QUERY');//2016
      workHoursYearData1.then(function (data) {
        if(heatType2==1){
          if(machineType2=="1,2,3"){
            var yearData3 = [,,];
          } else if(machineType2=="A1"){
            var yearData3 = [,,,,,,];
          } else {
            var yearData3 = [];
          }
        } else {
          var yearData3 = [];
        }
        for(var i=0;i<data.length;i++){
          var value = data[i].tData;
          yearData3.push(value);
        }
        mmuLine2.series[0].data = yearData3;
        var workHoursYearData2 = serviceResource.restCallService(YearURL2, 'QUERY');//2017
        workHoursYearData2.then(function (data) {
          var yearData4 = [];
          var date = new Date();
          var month = (date.getMonth()+1)+'月';
          for(var i=0;i<data.length;i++){
            if(data[i].tMonth==month){}else{
              var value = data[i].tData;
              yearData4.push(value);
            }
          }
          if(heatType2==0){
            if(machineType2=="A1"){
                mmuLine2.title.text = "挖掘机销售变化趋势";
                mmuLine2.yAxis.name = '车辆数量(台)';
            }
            if(machineType2=="1,2,3"){
                mmuLine2.title.text = "装载机销售变化趋势";
                mmuLine2.yAxis.name = '车辆数量(台)';
            }
            if(machineType2=="3"){
                mmuLine2.title.text = "重机销售变化趋势";
                mmuLine2.yAxis.name = '车辆数量(台)';
            }
            mmuLine2.series[1].data = yearData4;
            mmuChart2.setOption(mmuLine2);
          }else{
            var YearOwnershipData1 = serviceResource.restCallService(YearOwnership1, 'QUERY');//2016
            YearOwnershipData1.then(function (data1) {
              if(heatType2==1){
                if(machineType2=="1,2,3"){
                  var ownershipData1 = [,,];
                } else if(machineType2=="A1"){
                  var ownershipData1 = [,,,,,,];
                } else {
                  var ownershipData1 = [];
                }
              } else {
                var ownershipData1 = [];
              }

              for(var i=0;i<data1.length;i++){
                var value = data1[i].tData;
                ownershipData1.push(value);
              }
              mmuLine2.series[2].data = ownershipData1;
              var workHoursYearData2 = serviceResource.restCallService(YearOwnership2, 'QUERY');//2017
              workHoursYearData2.then(function (data2) {
                var ownershipData2 = [];
                var date = new Date();
                var month = (date.getMonth()+1)+'月';
                for(var i=0;i<data2.length;i++){
                  if(data2[i].tMonth!=month){
                    var value = data2[i].tData;
                    ownershipData2.push(value);
                  }
                }
                mmuLine2.series[3].data = ownershipData2;
                if(machineType2=="A1"){
                  mmuLine2.title.text = "挖掘机开工变化趋势";
                  mmuLine2.yAxis.name = '月平均开工时长(小时)';
                }
                if(machineType2=="1,2,3"){
                  mmuLine2.title.text = "装载机开工变化趋势";
                  mmuLine2.yAxis.name = '月平均开工时长(小时)';
                }
                if(machineType2=="3"){
                  mmuLine2.title.text = "重机开工变化趋势";
                  mmuLine2.yAxis.name = '月平均开工时长(小时)';
                }
                mmuLine2.series[1].data = yearData4;
                mmuChart2.setOption(mmuLine2);
              });
            });
          }
        });
      });
    }

    //默认进入页面后显示挖掘机开工热度2017年第二季度数据
    vm.query(null,null,1,201702,null,'A1',1);
    //查看对比结果
    vm.viewResults = function (startDate,endDate,dateType1,dateType,monthDate,machineType1,machineType2,heatType1,heatType2) {
      if(dateType1==1){
        startDate=null;
        endDate=null;
        monthDate=null;
      }else if(dateType1==2){
        startDate=null;
        endDate=null;
        dateType=null;
      }else if(dateType1==3){
        dateType=null;
        monthDate=null;
      }
      var monthDateFormated;
      var mapTitleText1;
      var mapTitleText2;
      var totalData1;//总销售额--左图
      var beforeTotalData1;//上周期总销售额--左图
      var totalData2;//总销售额--右图
      var beforeTotalData2;//上周期总销售额--右图
      if(null==machineType1||null==machineType2||null==heatType1||null==heatType2){
        Notification.warning({message: '请选择相关参数'});
      }else if(machineType1 == machineType2&&heatType1==heatType2){
        Notification.warning({message: "相同车辆类型的相同热度类型的数据没有对比意义，请重新选择参数!"});
      }else{

        //开工热度查询判断按某种周期--左图
        if(heatType1==1){
          var restCallURL1 = START_HEAT_QUERY;
          if(dateType1==1){
            restCallURL1 += "quarter?workRateQuarter=";
          }
          if(dateType1==2){
            restCallURL1 += "month?workRateMonth=";
          }
          if(dateType1==3){
            restCallURL1 += "date?";
          }
        }
        //销售热度查询判断按某种周期--左图
        if(heatType1==0){
          var restCallURL1 = SALES_HEAT_QUERY;
          if(dateType1==1){
            restCallURL1 += "quarter?salesHeatQuarter=";
          }
          if(dateType1==2){
            restCallURL1 += "month?salesHeatMonth=";
          }
          if(dateType1==3){
            restCallURL1 += "date?";
          }
        }
        //开工热度查询判断按某种周期--右图
        if(heatType2==1){
          var restCallURL2 = START_HEAT_QUERY;
          if(dateType1==1){
            restCallURL2 += "quarter?workRateQuarter=";
          }
          if(dateType1==2){
            restCallURL2 += "month?workRateMonth=";
          }
          if(dateType1==3){
            restCallURL2 += "date?";
          }
        }
        //销售热度查询判断按某种周期--右图
        if(heatType2==0){
          var restCallURL2 = SALES_HEAT_QUERY;
          if(dateType1==1){
            restCallURL2 += "quarter?salesHeatQuarter=";
          }
          if(dateType1==2){
            restCallURL2 += "month?salesHeatMonth=";
          }
          if(dateType1==3){
            restCallURL2 += "date?";
          }
        }
        //判断查询时间段--左图
        if(dateType){
          var filterTerm1 = dateType;
        } else if(monthDate) {
          var month = monthDate.getMonth() + 1;
          if (month < 10) {
            monthDateFormated = monthDate.getFullYear() + '0' + month;

          } else {
            monthDateFormated = '' + monthDate.getFullYear() + month;
          }
          filterTerm1 = monthDateFormated;
        } else {
          if (startDate) {
            var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
            var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
            filterTerm1 = "startDate=" + startDateFormated;
          }
          if (endDate) {
            var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
            var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
            filterTerm1 += "&endDate=" + endDateFormated;
          }
        }

        //查询上周期的销售总额URL--左图
        var beforeRestCallURL3 = restCallURL1;
        var month3 = monthDateFormated;
        var beforeFilter3;
        if(dateType1==1){
          if(dateType==201701){
            beforeFilter3 = 201604;
          }else{
            beforeFilter3 = dateType-1;
          }
        } else if(dateType1==2){
          if(month3==201701){
            beforeFilter3 = 201612;
          }else{
            beforeFilter3 = month3-1;
          }
        } else if(dateType1==3){
          var startDate3 = new Date();
          var endDate3 = startDate;
          var n = startDate3.getDate()-endDate3.getDate();
          startDate3.setDate(endDate3.getDate()-n);
          var startDateFormated3 = startDate3.getFullYear() + '-' + (startDate3.getMonth() + 1) + '-' + startDate3.getDate();
          var endDateFormated3 = endDate3.getFullYear() + '-' + (endDate3.getMonth() + 1) + '-' + endDate3.getDate();
          beforeFilter3 = 'startDate=' + startDateFormated3 + '&endDate='+ endDateFormated3;
        }

        var filterTermProvince1=filterTerm1;
        if(heatType1==1){
          //调用封装好的查询平均时间功能--开工热度
          avgWorkHoursQuery(dateType1,filterTerm1,startDate,endDate);
          vm.avgHours1 = true;
          vm.avgHours3 = false;
          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational = true;
          vm.avgHoursProvince = false;
        }else if(heatType1==0){
          vm.avgHours1 = false;
          vm.avgHours3 = true;
        }
        //判断查询时间段--右图
        if(dateType){
            var filterTerm2 = dateType;
        } else if(monthDate) {
          var month = monthDate.getMonth() + 1;
          if (month < 10) {
            monthDateFormated = monthDate.getFullYear() + '0' + month;

          } else {
            monthDateFormated = '' + monthDate.getFullYear() + month;
          }
          filterTerm2 = monthDateFormated;
        }else {
          if (startDate) {
            var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
            var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
            filterTerm2 = "startDate=" + startDateFormated;
          }
          if (endDate) {
            var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
            var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
            filterTerm2 += "&endDate=" + endDateFormated;
          }
        }
        //查询上周期的销售总额URL--右图
        var beforeRestCallURL4 = restCallURL2;
        var beforeFilter4;
        if(dateType1==1){
          if(dateType==201701){
            beforeFilter4 = 201604;
          }else{
            beforeFilter4 = dateType-1;
          }
        } else if(dateType1==2){
          if(month3==201701){
            beforeFilter4 = 201612;
          }else{
            beforeFilter4 = month3-1;
          }
        } else if(dateType1==3){
          var startDate4 = new Date();
          var endDate4 = startDate;
          var n = startDate4.getDate()-endDate4.getDate();
          startDate4.setDate(endDate4.getDate()-n);
          var startDateFormated4 = startDate4.getFullYear() + '-' + (startDate4.getMonth() + 1) + '-' + startDate4.getDate();
          var endDateFormated4 = endDate4.getFullYear() + '-' + (endDate4.getMonth() + 1) + '-' + endDate4.getDate();
          beforeFilter4 = 'startDate=' + startDateFormated4 + '&endDate='+ endDateFormated4;
        }
        var filterTermProvince2=filterTerm2;
        if(heatType2==1){
          //调用封装好的查询平均时间功能--开工热度
          avgWorkHoursQuery2(dateType1,filterTerm2,startDate,endDate);
          vm.avgHours2 = true;
          vm.avgHours4 = false;
          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational2 = true;
          vm.avgHoursProvince2 = false;
        }else if(heatType2==0){
          vm.avgHours2 = false;
          vm.avgHours4 = true;
        }

        //判断是哪种车型--左图
        if(heatType1==1){
        if(machineType1=="1,2,3"){
          filterTerm1 += "&machineType=" + 1;
        }
        if(machineType1=="A1"){
          filterTerm1 += "&machineType=" + 2;
        }
        if(machineType1=="3"){
          filterTerm1 += "&machineType=" + 3;
        }

        } else {
          if(machineType1=="1,2,3"){
            filterTerm1 += "&machineType=" + 1;
            beforeFilter3 += "&machineType=" + 1;
          }
          if(machineType1=="A1"){
            filterTerm1 += "&machineType=" + 2;
            beforeFilter3 += "&machineType=" + 2;
          }
          if(machineType1=="3"){
            filterTerm1 += "&machineType=" + 3;
            beforeFilter3 += "&machineType=" + 3;
          }
        }
        //判断是哪种车型--右图
        if(heatType2==1){
        if(machineType2=="1,2,3"){
          filterTerm2 += "&machineType=" + 1;
        }
        if(machineType2=="A1"){
          filterTerm2 += "&machineType=" + 2;
        }
        if(machineType2=="3"){
          filterTerm2 += "&machineType=" + 3;
        }

        } else {
          if(machineType2=="1,2,3"){
            filterTerm2 += "&machineType=" + 1;
            beforeFilter4 += "&machineType=" + 1;
          }
          if(machineType2=="A1"){
            filterTerm2 += "&machineType=" + 2;
            beforeFilter4 += "&machineType=" + 2;
          }
          if(machineType2=="3"){
            filterTerm2 += "&machineType=" + 3;
            beforeFilter4 += "&machineType=" + 3;
          }
        }
        //开工热度查询默认查询范围2小时
        if(heatType1==1){
          filterTerm1 += "&hourScope=2";
        }
        if(heatType2==1){
          filterTerm2 += "&hourScope=2";
        }
        //拼接查询路径
        if (filterTerm1){
          restCallURL1 += filterTerm1;
          beforeRestCallURL3 += beforeFilter3;
        }
        if (filterTerm2){
          restCallURL2 += filterTerm2;
          beforeRestCallURL4 += beforeFilter4;
        }
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
        var lineContainerList = document.getElementsByClassName("chart-container");
        lineContainerList[0].style.width = "50%";
        lineContainerList[1].style.width = "50%";
        //在省份城市情况下直接点击对比查询，隐藏返回箭头
        var backButtons = document.getElementsByClassName("backChina");
        backButtons[0].style.display = "none";
        backButtons[1].style.display = "none";

        mapChart1 = vm.echartsInit("mapContainer1");
        mapChart2 = vm.echartsInit("mapContainer2");
        var max1=100;
        var max2=100;
        var mapOption1;
        var mapOption2;
        if(heatType1==1){
          mapOption1 = chinaOption1;
        } else if(heatType1==0) {
          mapOption1 = chinaOption2;
        }
        mapOption1.title.left = "center";
        mapOption1.title. textStyle={fontSize: 21};
        mapOption1.title. subtextStyle={fontSize: 12};

        if(heatType2==1){
          mapOption2 = chinaOption1;
        } else if(heatType2==0) {
          mapOption2 = chinaOption2;
        }
        mapOption2.title.left = "center";
        mapOption2.title. textStyle={fontSize: 21};
        mapOption2.title. subtextStyle={fontSize: 12};
        var zData ;
        var yData ;
        var rspData1 = serviceResource.restCallService(restCallURL1, 'QUERY');
        rspData1.then(function (data1) {
          if(!data1.length>0){
            mapOption1.series[0].data=null;
          }else{
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
            vm.national = true;
            vm.allProvince = false;
            vm.national1 = true;
            vm.allProvince1 = false;
            totalData1 = data1;
            var total1 = 0;
            for(var a=0;a<data1.length;a++){
              total1 += data1[a].value;
            }
            vm.totalSales=total1;
            //查询上周期的销售总额--左图
            var rspData3 = serviceResource.restCallService(beforeRestCallURL3, 'QUERY');
            rspData3.then(function (data3) {
              beforeTotalData1 = data3;
              var total2 = 0;
              for(var b=0;b<data3.length;b++){
                total2 += data3[b].value;
              }
              vm.beforeTotalSales = total2;
            });
          }
          var rspData2 = serviceResource.restCallService(restCallURL2, 'QUERY');
          rspData2.then(function (data2) {
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
              vm.national = true;
              vm.allProvince = false;
              vm.national1 = true;
              vm.allProvince1 = false;
              totalData2 = data2;
              var total1 = 0;
              for(var a=0;a<data2.length;a++){
                total1 += data2[a].value;
              }
              vm.totalSales1=total1;
              //查询上周期的销售总额--右图
              var rspData4 = serviceResource.restCallService(beforeRestCallURL4, 'QUERY');
              rspData4.then(function (data4) {
                beforeTotalData2 = data4;
                var total2 = 0;
                for(var b=0;b<data4.length;b++){
                  total2 += data4[b].value;
                }
                vm.beforeTotalSales1 = total2;
              });
            }
            var max3=100;
            if(max1>=max2) {
              max3 = max1;
            }
            if(max1<max2) {
              max3 = max2;
            }
            if(machineType1=="A1"){
              if(heatType1==1){
                mapOption1.title.text = "挖掘机开工热度分布";
                mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType1==0){
                mapOption1.title.text = "挖掘机销售热度分布";
                mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            } else if(machineType1=="1,2,3"){
              if(heatType1==1){
                mapOption1.title.text = "装载机开工热度分布";
                mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType1==0){
                mapOption1.title.text = "装载机销售热度分布";
                mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }else if(machineType1=="3"){
              if(heatType1==1){
                mapOption1.title.text = "重机开工热度分布";
                mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType1==0){
                mapOption1.title.text = "重机销售热度分布";
                mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }
            if(heatType1==0){
              mapOption1.visualMap.max=max3;
            }
            mapOption1.series[0].data=zData;
            mapTitleText1 = mapOption1.title.text;
            mapChart1.setOption(mapOption1);
            if(machineType2=="A1"){
              if(heatType2==1){
                mapOption2.title.text = "挖掘机开工热度分布";
                mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType2==0){
                mapOption2.title.text = "挖掘机销售热度分布";
                mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];

              }
            } else if(machineType2=="1,2,3"){
              if(heatType2==1){
                mapOption2.title.text = "装载机开工热度分布";
                mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType2==0){
                mapOption2.title.text = "装载机销售热度分布";
                mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }else if(machineType2=="3"){
              if(heatType2==1){
                mapOption2.title.text = "重机开工热度分布";
                mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
              }else if(heatType2==0){
                mapOption2.title.text = "重机销售热度分布";
                mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
              }
            }
            if(heatType2==0){
              mapOption2.visualMap.max=max3;
            }
            mapOption2.series[0].data=yData;
            mapTitleText2 = mapOption2.title.text;
            mapChart2.setOption(mapOption2);
          }, function (reason) {
            Notification.error("获取数据失败");
          });

        }, function (reason) {
          Notification.error("获取数据失败");
        });
        mapChart1.on("click", function (param){
          backButtons[0].style.display = "block";
          backButtons[1].style.display = "block";
          avgWorkHoursProvinceQuery(dateType1,filterTermProvince1,startDate,endDate,param.name);
          avgWorkHoursProvinceQuery2(dateType1,filterTermProvince2,startDate,endDate,param.name);
          showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);

        })
        mapChart2.on("click", function (param){
          backButtons[1].style.display = "block";
          backButtons[0].style.display = "block";
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
              // cityMap2.series[0].data=cityData2;
              var cityMax3=100;
              if(cityMax1>=cityMax2){
                cityMax3 = cityMax1;
              }
              if(cityMax1<cityMax2){
                cityMax3 = cityMax2;
              }
              avgWorkHoursProvinceQuery(dateType1,filterTermProvince1,startDate,endDate,param.name);
              avgWorkHoursProvinceQuery2(dateType1,filterTermProvince2,startDate,endDate,param.name);
              cityMap1.series[0].data=cityData1;
              if(heatType1==0){
                cityMap1.visualMap.max=cityMax3;
              }
              //悬浮框的的隐藏和显示-work
              vm.avgHoursNational = false;
              vm.avgHoursProvince = true;
              cityChart1.setOption(cityMap1);
              cityMap2.series[0].data=cityData2;
              if(heatType2==0){
                cityMap2.visualMap.max=cityMax3;
              }
              //悬浮框的的隐藏和显示-work
              vm.avgHoursNational2 = false;
              vm.avgHoursProvince2 = true;
              cityChart2.setOption(cityMap2);
            }, function (reason) {
              Notification.error("获取数据失败");
            });

          }, function (reason) {
            Notification.error("获取数据失败");
          });

        })

        var backButtons = document.getElementsByClassName("backChina");
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
          var mapChart1 = vm.echartsInit("mapContainer1");
          mapOption1.title.text = mapTitleText1;
          mapOption1.series[0].data=zData;
          mapChart1.setOption(mapOption1);
          var mapChart2 = vm.echartsInit("mapContainer2");
          mapOption2.title.text = mapTitleText2;
          mapOption2.series[0].data=yData;
          mapChart2.setOption(mapOption2);
          backButtons[0].style.display = "none";
          backButtons[1].style.display = "none";
          //地图返回后再次下钻
          mapChart1.on("click", function (param){
            backButtons[0].style.display = "block";
            backButtons[1].style.display = "block";
            avgWorkHoursProvinceQuery(dateType1,filterTermProvince1,startDate,endDate,param.name);
            avgWorkHoursProvinceQuery2(dateType1,filterTermProvince2,startDate,endDate,param.name);
            showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);

          });
          mapChart2.on("click", function (param){
            backButtons[1].style.display = "block";
            backButtons[0].style.display = "block";
            avgWorkHoursProvinceQuery(dateType1,filterTermProvince1,startDate,endDate,param.name);
            avgWorkHoursProvinceQuery2(dateType1,filterTermProvince2,startDate,endDate,param.name);
            showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2);
          })
        }

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
          mapOption2.title.text = mapTitleText2;
          mapChart2.setOption(mapOption2);
          var mapChart1 = vm.echartsInit("mapContainer1");
          mapOption1.title.text = mapTitleText1;
          mapOption1.series[0].data=zData;
          mapChart1.setOption(mapOption1);
          backButtons[1].style.display = "none";
          backButtons[0].style.display = "none";
          //地图返回后再次下钻
          mapChart2.on("click", function (param){
            backButtons[1].style.display = "block";
            backButtons[0].style.display = "block";
            avgWorkHoursProvinceQuery(dateType1,filterTermProvince1,startDate,endDate,param.name);
            avgWorkHoursProvinceQuery2(dateType1,filterTermProvince2,startDate,endDate,param.name);
            showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2)
          });
          mapChart1.on("click", function (param){
            backButtons[0].style.display = "block";
            backButtons[1].style.display = "block";
            avgWorkHoursProvinceQuery(dateType1,filterTermProvince1,startDate,endDate,param.name);
            avgWorkHoursProvinceQuery2(dateType1,filterTermProvince2,startDate,endDate,param.name);
            showProvince(heatType1,heatType2,restCallURL1,restCallURL2,param,totalData1,beforeTotalData1,totalData2,beforeTotalData2)
          })
        }

        var mmuChart = echarts.init(lineContainerList[0]);
        if(heatType1==1){
          var mmuLine = mmuOption1;
        }else{
          var mmuLine = mmuOption2;
        }
        if(heatType2==1){
          var mmuLine2 = mmuOption1;
        }else{
          var mmuLine2 = mmuOption2;
        }
        var mmuChart2 = echarts.init(lineContainerList[1]);
        yearInfoLine(machineType1,heatType1,mmuLine,mmuChart,machineType2,heatType2,mmuLine2,mmuChart2);
      }
    }

    function getindex(name,arr){
      for (var i = 0; i < arr.length; i++) {
        if(name==arr[i]){
          return i;
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
          if(heatType1==0){
            cityMap1.visualMap.max=cityMax3;
          }
          cityMap1.series[0].data=cityData1;
          cityChart1.setOption(cityMap1);


          //悬浮框的的隐藏和显示-work
          vm.avgHoursNational2 = false;
          vm.avgHoursProvince2 = true;
          if(heatType2==0){
            cityMap2.visualMap.max=cityMax3;
          }
          cityMap2.series[0].data=cityData2;
          cityChart2.setOption(cityMap2);
        }, function (reason) {
          Notification.error("获取数据失败");
        });

      }, function (reason) {
        Notification.error("获取数据失败");
      });
    }

    var provinces = ['shanghai', 'hebei','shanxi','neimenggu','liaoning','jilin','heilongjiang','jiangsu','zhejiang','anhui','fujian','jiangxi','shandong','henan','hubei','hunan','guangdong','guangxi','hainan','sichuan','guizhou','yunnan','xizang','shanxi1','gansu','qinghai','ningxia','xinjiang', 'beijing', 'tianjin', 'chongqing', 'xianggang', 'aomen', 'taiwan'];
    var provincesText = ['上海市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省','黑龙江省',  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省','河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '北京市', '天津市', '重庆市', '香港特別行政區', '澳門特別行政區', '台湾省'];

    //查看各类车车辆热度分布
    vm.showMachineHeatDetails = function (startDate,endDate,dateType1,dateType,monthDate,heatType1) {
      if(dateType){
        startDate=null;
        endDate=null;
      }
      var monthDateFormated;
      chinaOption1.title.left = "center";//left
      chinaOption1.title. textStyle={fontSize: 21};
      chinaOption1.title. subtextStyle={fontSize: 12};
      chinaOption1.visualMap.color= ['#075e89','#FFFFFF'];
      chinaOption2.title.left = "center";
      chinaOption2.title. textStyle={fontSize: 21};
      chinaOption2.title. subtextStyle={fontSize: 12};
      chinaOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
      var subMapOption1 = chinaOption1;
      var subMapOption2 = chinaOption1;
      var subMapOption3 = chinaOption1;
      var subMapOption4 = chinaOption2;
      var subMapOption5 = chinaOption2;
      var subMapOption6 = chinaOption2;
      //开工热度查询判断按某种周期
      if(heatType1==1){
        var restCallURL = START_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?workRateQuarter=";
        }
        if(dateType1==2){
          restCallURL += "month?workRateMonth=";
        }
        if(dateType1==3){
          restCallURL += "date?";
        }
      }
      //销售热度查询判断按某种周期
      if(heatType1==0){
        var restCallURL = SALES_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?salesHeatQuarter=";
        }
        if(dateType1==2){
          restCallURL += "month?salesHeatMonth=";
        }
        if(dateType1==3){
          restCallURL += "date?";
        }
      }

      //判断查询时间段
      if(dateType){
        var filterTerm = dateType;
      } else if(monthDate){
        var month = monthDate.getMonth() +1;
        if(month<10){
          monthDateFormated = monthDate.getFullYear() +'0'+ month;

        }else{
          monthDateFormated = ''+monthDate.getFullYear() + month;
        }
        filterTerm = monthDateFormated;
      } else {
        if (startDate) {
          var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
          var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
          filterTerm = "startDate=" + startDateFormated;
        }
        if (endDate) {
          var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
          var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
          filterTerm += "&endDate=" + endDateFormated;
        }
      }
      //开工热度查询默认查询范围2小时
      if(heatType1==1){
        filterTerm += "&hourScope=2";
      }
      if(heatType1==1){
      //查询装载机
      var filterTerm1 = filterTerm;
      filterTerm1 += "&machineType=" + 1;
      //查询挖掘机
      var filterTerm2 = filterTerm;
      filterTerm2 += "&machineType=" + 2;
      //查询重机
      var filterTerm3 = filterTerm;
      filterTerm3 += "&machineType=" + 3;
      } else if(heatType1==0){
        //查询装载机
        var filterTerm1 = filterTerm;
        filterTerm1 += "&machineType=" + 1;
        //查询挖掘机
        var filterTerm2 = filterTerm;
        filterTerm2 += "&machineType=" + 2;
        //查询重机
        var filterTerm3 = filterTerm;
        filterTerm3 += "&machineType=" + 3;
      }
      //拼接查询路径
      if (filterTerm){
        //装载机
        var restCallURL1 = restCallURL;
        restCallURL1 += filterTerm1;
        //挖掘机
        var restCallURL2 =restCallURL;
        restCallURL2 += filterTerm2;
        //查询重机
        var restCallURL3 =restCallURL;
        restCallURL3 += filterTerm3;
      }
      var rspData1 = serviceResource.restCallService(restCallURL2, 'QUERY');
      rspData1.then(function (data3) {
        var maxa =100;
        if(!data3.length>0){
          subMapOption3.series[0].data=null;
          subMapOption6.series[0].data=null;
        } else {
          maxa = data3[0].value;
          for(var i=1;i<data3.length;i++){
            if(maxa<data3[i].value){
              maxa=data3[i].value
            }
          }
        }
        var rspData2 = serviceResource.restCallService(restCallURL1, 'QUERY');
        rspData2.then(function (data1) {
          var maxb = 100;
          if(!data1.length>0){
            subMapOption1.series[0].data=null;
            subMapOption4.series[0].data=null;
            // Notification.warning("装载机所选时间段暂无数据！");
          } else {
            maxb = data1[0].value;
            for(var i=1;i<data1.length;i++){
              if(maxb<data1[i].value){
                maxb=data1[i].value
              }
            }
          }
          var maxc;
          if(maxa>=maxb){
            maxc=maxa;
          }else{
            maxc=maxb;
          }
          if(heatType1==1) {
            subMapOption3.series[0].data = data3;
            // if(heatType1==0){
            //   subMapOption3.visualMap.max=max;
            // }
            subMapOption3.title.text = "挖掘机开工热度分布";
            subMap1.setOption(subMapOption3);
          }else if(heatType1==0){
            subMapOption6.series[0].data = data3;
            subMapOption6.visualMap.max=maxc;
            subMapOption6.title.text = "挖掘机销售热度分布";
            subMap1.setOption(subMapOption6);
          }


          if(heatType1==1){
            subMapOption1.series[0].data=data1;
            // if(heatType1==0){
            //   subMapOption1.visualMap.max=max;
            // }
            subMapOption1.title.text = "装载机开工热度分布";
            subMap2.setOption(subMapOption1);
          }else if(heatType1==0){
            subMapOption4.series[0].data = data1;
            subMapOption4.visualMap.max=maxc;
            subMapOption4.title.text = "装载机销售热度分布";
            subMap2.setOption(subMapOption4);
          }

        }, function (reason) {
          Notification.error("获取数据失败");
        });

      }, function (reason) {
        Notification.error("获取数据失败");
      });

      //查询重机
      // var rspData3 = serviceResource.restCallService(restCallURL3, 'QUERY');
      // rspData3.then(function (data2) {
      //   var max = 100;
      //   if(!data2.length>0){
      //     subMapOption2.series[0].data=null;
      //     subMapOption5.series[0].data=null;
      //     // Notification.warning("装载机所选时间段暂无数据！");
      //   } else {
      //     max = data2[0].value;
      //     for(var i=1;i<data1.length;i++){
      //       if(max<data2[i].value){
      //         max=data2[i].value
      //       }
      //     }
      //   }
      //
      //   if(heatType1==1){
      //     subMapOption2.series[0].data=data2;
      //     subMapOption2.visualMap.max=max;
      //     subMapOption2.title.text = "重机开工热度分布";
      //     subMap3.setOption(subMapOption2);
      //   }else if(heatType1==0){
      //     subMapOption5.series[0].data = data2;
      //     subMapOption5.visualMap.max=max;
      //     subMapOption5.title.text = "重机销售热度分布";
      //     subMap3.setOption(subMapOption5);
      //   }
      //
      // }, function (reason) {
      //   Notification.error("获取数据失败");
      // });

    }
    //重置按钮
    vm.reset = function () {
      vm.machineType1 = null;
      vm.machineType2 = null;
      vm.heatType1 = null;
      vm.heatType2 = null;
      vm.machineType = null;
      vm.heatType = null;
    }


  }
})();

