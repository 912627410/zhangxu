/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('rentalService', rentalService);

  /** @ngInject */
  function rentalService(RENTAL_JOB_CONTENT_LIST, RENTAL_COLLECTION_AGREEMENT_LIST, DEVCE_MF, DEVCE_HIGHTTYPE, serviceResource, DEVCE_DEVICETYPE, DEVCE_POWERTYPE,RENTAL_ORDER_STATUS,RENTAL_OPERATION_TYPE_LIST,
                         RENTAL_MAINTENANCE_STATUS_URL,RENTAL_MAINTENANCE_LIST_STATUS_URL,RENTAL_ORG_FENCE_STATUS,RENTAL_MACHINE_PRICE_UNIT_LIST,RENTAL_RESPONSIBILITY_LIST,RENTAL_PAY_TYPE_LIST) {




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
      getJobContentList: function () {
        return serviceResource.restCallService(RENTAL_JOB_CONTENT_LIST,"GET");
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
      getRetnalOrgFenceStatusList: function () {
        return serviceResource.restCallService(RENTAL_ORG_FENCE_STATUS,"QUERY"); //返回结果是List,所以用Query
      },
      getCollectionAgreementList: function () {
        return serviceResource.restCallService(RENTAL_COLLECTION_AGREEMENT_LIST,"QUERY"); //返回结果是List,所以用Query
      },
      getMachinePriceUnitList: function () {
        return serviceResource.restCallService(RENTAL_MACHINE_PRICE_UNIT_LIST,"QUERY"); //返回结果是List,所以用Query
      },
      getResponsibilityList: function () {
        return serviceResource.restCallService(RENTAL_RESPONSIBILITY_LIST,"QUERY"); //返回结果是List,所以用Query
      },
      getoperationType: function () {
        return serviceResource.restCallService(RENTAL_OPERATION_TYPE_LIST,"QUERY"); //返回结果是List,所以用Query
      },
      getPayTypeList: function () {
        return serviceResource.restCallService(RENTAL_PAY_TYPE_LIST,"QUERY"); //返回结果是List,所以用Query
      },


    };


  }
})();
