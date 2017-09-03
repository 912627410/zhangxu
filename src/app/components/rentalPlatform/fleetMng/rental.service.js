/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('rentalService', rentalService);

  /** @ngInject */
  function rentalService($rootScope, $resource, DEVCE_MF, DEVCE_HIGHTTYPE, serviceResource, DEVCE_DEVICETYPE, DEVCE_POWERTYPE,RENTAL_ORDER_STATUS,RENTAL_MAINTENANCE_STATUS_URL,RENTAL_MAINTENANCE_LIST_STATUS_URL) {




    return {
      getDeviceManufactureList: function () {
        return serviceResource.restCallService(DEVCE_MF, "GET");
      },

      getDeviceHeightTypeList: function () {
        return serviceResource.restCallService(DEVCE_HIGHTTYPE, "GET");
      },
      getDeviceTypeList: function () {
        return serviceResource.restCallService(DEVCE_DEVICETYPE, "GET");
      },
      getDevicePowerTypeList: function () {
        return serviceResource.restCallService(DEVCE_POWERTYPE,"GET");
      },
      getRetnalOrderStatusList: function () {
        return serviceResource.restCallService(RENTAL_ORDER_STATUS,"QUERY"); //返回结果是List,所以用Query
      },
      getMaintenanceStatusList: function () {
        return serviceResource.restCallService(RENTAL_MAINTENANCE_STATUS_URL,"QUERY"); //返回结果是List,所以用Query
      },
      getMaintenanceListStatusList: function () {
        return serviceResource.restCallService(RENTAL_MAINTENANCE_LIST_STATUS_URL,"QUERY"); //返回结果是List,所以用Query
      },


    };


  }
})();
