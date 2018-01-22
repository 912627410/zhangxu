/**
 *
 * @author syLong
 * @create 2018-01-12 20:21
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('minemngResource', minemngResource);

  /** @ngInject */
  function minemngResource($rootScope, $window, Notification, serviceResource, MINEMNG_WORKFACE_LIST, MINEMNG_DUMP_FIELD_LIST, MINEMNG_FLEET_LIST, MINEMNG_WORK_SHIFT_ALL_LIST,
                           MINEMNG_DISPATCH_TYPE) {
    return {

      /**
       * 获取工作面集合
       */
      getWorkFaceList: function () {
        return serviceResource.restCallService(MINEMNG_WORKFACE_LIST, "QUERY");
      },

      /**
       * 获取排土场集合
       */
      getDumpFieldList: function () {
        return serviceResource.restCallService(MINEMNG_DUMP_FIELD_LIST, "QUERY");
      },

      /**
       * 获取车队列表
       */
      getFleetList: function () {
        var url = MINEMNG_FLEET_LIST + "?parentId=0";
        return serviceResource.restCallService(url, "QUERY");
      },

      /**
       * 根据车队获取小组列表
       */
      getTeamList: function (fleetId) {
        if(fleetId != null && fleetId !== "" && fleetId !== "undefined") {
          var url = MINEMNG_FLEET_LIST + "?parentId=" + fleetId;
          return serviceResource.restCallService(url, "QUERY");
        }
        return null;
      },

      /**
       * 获取班次列表
       */
      getWorkShiftAllList: function () {
        return serviceResource.restCallService(MINEMNG_WORK_SHIFT_ALL_LIST, "QUERY");
      },

      /**
       * 获取调度类型列表
       */
      getDispatchTypeList: function () {
        return serviceResource.restCallService(MINEMNG_DISPATCH_TYPE, "QUERY");
      }

    };
  }

})();
