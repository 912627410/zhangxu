/**
 * Created by develop on 6/1/16.
 */
(function () {
  'use strict'

  angular.module('GPSCloud')

    .filter('convertToMins', function (languages) {
      return function (hours) {
        var hoursArray;
        var hourMins;
        if (hours != null) {
          hoursArray = hours.toString().split(".");

          if (hoursArray[0] != null) {
            hourMins = hoursArray[0] + languages.findKey('hour');
          }
          if (hoursArray[1] != null) {
            var mins = "0." + hoursArray[1]
            hourMins = hourMins + " " + Math.round(mins * 60) + languages.findKey('mins');
          }
          return hourMins;
        }
      }
    })
    .filter('numberToBoolean', function () {
      return function (value) {
        if (value == 0) {
          return '否'
        } else if (value == 1) {
          return '是'
        } else {
          return value;
        }
      }
    })//单位转换过滤器
    .filter("unitConversionFilter", function () {
      return function (value, rate, unit) {
        if (value == null || value == undefined || value == 0) {
          return value + unit;
        }
        var result = (value * rate).toFixed(2);
        return result + unit;
      }
    })
    //状态信息转换过滤器
    .filter("stateConversionFilter", function () {
      return function (value, formatJson) {
        if (value == null || value == undefined) {
          return "无数据";
        }
        var jsonObj = JSON.parse(formatJson);
        var result = jsonObj[value];
        if (result == null || result == undefined) {
          return "无数据";
        }
        return result;
      }
    })
    //总工时转换器过滤器
    .filter("workDurationConvert", function () {
      return function (value) {
        return 5 * value / 60;
      }
    })
    //电池电量转换过滤器
    .filter("batteryPowerConvert", function () {
      return function (value) {
        return 55 * value / 4095;
      }
    })
    //油缸压力转换过滤器
    .filter("oilPressureConvert", function () {
      return function (value) {
        if (value == null || value == undefined || value == 0) {
          return value;
        }
        return (25 * value / 4095).toFixed(2);
      }
    })

})();
