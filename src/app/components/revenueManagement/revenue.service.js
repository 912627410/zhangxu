/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('revenueService', revenueService);

  /** @ngInject */
  function revenueService($rootScope, $resource, SIM_STATUS_URL, SIM_URL, SIM_PAGE_URL,DEFAULT_SIZE_PER_PAGE, serviceResource, Notification) {

    this.getSimStatusList = function (list) {
      var simStatusData = serviceResource.restCallService(SIM_STATUS_URL, "QUERY");
      simStatusData.then(function (data) {
        alert(data);
        //  return data;
        list = data;
      }, function (reason) {
        Notification.error('获取SIM卡状态集合失败');
        return {};
      })
    }




    //return {"name":"abc"};
    return {
      queryPage: function (page, size, sort, queryPhoneNumber) {
        var restCallURL = SIM_PAGE_URL;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || "id,desc";
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if (queryPhoneNumber) {
          restCallURL += "&search_LIKE_phoneNumber=" + queryPhoneNumber;
        }
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        return rspData;

      },
      "dateOption":function(dateStatus,dateChange){
        alert(dateStatus.opened);
        dateStatus.opened=false;
        alert(dateStatus.opened);

        dateChange = function ($event) {
          dateStatus.opened = true;
        };

      }
    };
  }
})();
