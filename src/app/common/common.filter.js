/**
 * Created by develop on 6/1/16.
 */
(function () {
  'use strict'

  angular.module('GPSCloud')

    .filter('convertToMins',function (languages) {
    return function (hours) {
      var hoursArray;
      var hourMins;
      if(hours!=null){
        hoursArray=hours.toString().split(".");
        
        if (hoursArray[0] != null){
          hourMins = hoursArray[0] + languages.findKey('hour');
        }
        if (hoursArray[1] != null){
          var mins = "0." + hoursArray[1]
          hourMins = hourMins + " " + Math.round(mins * 60) + languages.findKey('mins');
        }
        return hourMins;
      }
    };
  });

})()
