/**
 *  create by riqian.ma
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .factory('simService', simService);

  /** @ngInject */
  function simService($rootScope, $resource, SIM_STATUS_URL, SIM_URL, SIM_PAGE_URL,DEFAULT_SIZE_PER_PAGE, serviceResource, Notification) {





    //return {"name":"abc"};
    return {
      queryPage: function (page, size, sort, sim,org) {
        var restCallURL = SIM_PAGE_URL;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
        var sortUrl = sort || "id,desc";
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

       console.log(sim);

        if(sim){

          if (sim.phoneNumber) {
            restCallURL += "&search_LIKES_phoneNumber=" + sim.phoneNumber;
          }
          if (sim.provider) {
            restCallURL += "&search_EQ_provider=" + sim.provider.value;
          }

        }

        if (org) {
          restCallURL += "&search_EQ_deviceinfo.organization.id=" + org.id;
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
