/**
 * Created by yalong on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngContentController', minemngContentController);

  /** @ngInject */
  function minemngContentController($rootScope,$filter, serviceResource,permissions,HOME_STATISTICS_DATA_URL,Notification,Title,roles) {
    var vm = this;
    vm.fleetUserShow = false;
    vm.userShow = true;

    var statisticInfo = {
      totalDevices: 0,
      totalWarningDevices: 0,
      totalAbnormalDevices: 0
    };

    if ($rootScope.userInfo==null) {
      $rootScope.$state.go( "entry" );
      return;
    }

    // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
    $rootScope.$on('IdleEnd', function() {
      // If the original title was stored or set previously, sets the title to the original value.
      Title.restore();
    });

    vm.statisticInfo = statisticInfo;




  }
})();
