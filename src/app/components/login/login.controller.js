/**
 * Created by shuangshan on 16/1/2.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('LoginController', LoginController);


  /** @ngInject */

  function LoginController($rootScope,$scope, $http,$cookies,$filter,$stateParams, $window, ORG_TREE_JSON_DATA_URL, SYS_CONFIG_URL,SYS_CONFIG_LIST_URL,PERMISSIONS_URL,GET_VERIFYCODE_URL,JUDGE_VERIFYCODE_URL,$confirm, Notification, serviceResource, permissions, Idle, languages) {
    var vm = this;
    var userInfo;
    var rootParent = {id: 0}; //默认根节点为0
    vm.rememberMe = true;
    var count = 0;
    $scope.isShow = false;

    var verifyCodeInfo ={
      token:'',
      value:''
    }


    //通过后台返回的结构生成json tree
    vm.unflatten = function (array, parent, tree) {
      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : {id: 0};

      var children = _.filter(array, function (child) {
        return child.parentId == parent.id;
      });

      // alert("parent.id=="+parent.id);

      if (!_.isEmpty(children)) {
        //alert("1.children.tree=="+JSON.stringify(children));
        //alert("2.parent.id =="+parent.id );
        //判断是否是根节点
        // if( parent.id == rootParent.id ){
        if (parent.id == 0) {
          //alert("3.rootParent.id =="+rootParent.id );
          //alert("4.rootParent.tree=="+JSON.stringify(children));
          tree = children;

        } else {
          parent['children'] = children
          // alert("5. tree=="+JSON.stringify(children));
        }
        _.each(children, function (child) {
          vm.unflatten(array, child, null)
        });
      }


      //alert("tree="+tree);
      return tree;
    };

    $scope.$on('$viewContentLoaded', function(){
      if(null!=$cookies.getObject("user")){
        var userobj = {};
        var base = new Base64();
        var password = base.decode($cookies.getObject("user").password);
        userobj.username = base.decode($cookies.getObject("user").username);
        userobj.password = password.substring(0,password.length-4);

        vm.credentials = userobj;
       if(null==$cookies.getObject("outstate")){
         vm.loginMe();
       }
      }
    });
    vm.reset= function () {
      vm.credentials.password = null;
    }

    var rspdata = serviceResource.restCallService(GET_VERIFYCODE_URL,"GET");
    rspdata.then(function (data) {
      verifyCodeInfo ={
        token:data.token,
        value:data.verifyCode
      }
      vm.verifyCode = verifyCodeInfo.value;
    })




    vm.loginMe = function () {
      $cookies.remove("outstate");
      var code = vm.code ;
      if(null!=code&&""!=code){
        var restCallURL = JUDGE_VERIFYCODE_URL;
        restCallURL += "?&token=" + verifyCodeInfo.token + '&code=' + code;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if(data.code==0){
            Notification.error("验证码输入错误！请重新输入！!");
          }
          if(data.code==1){
            Notification.success("验证码输入正确!");
            vm.userverify();
          }
        })
      }else{
        vm.userverify();
      }

    }

    vm.userverify = function () {
      var rspPromise = serviceResource.authenticate(vm.credentials);
      rspPromise.then(function (response) {
        if(vm.rememberMe){
          //检测是否存在cookie   user
          $cookies.remove("user");
          //记录登录时间
          $scope.loginTime = new Date().getTime();

          var codeSuffix="";
          for(var i=0;i<4;i++)
          {
            codeSuffix+=Math.floor(Math.random()*10);
          }

          var base = new Base64();
          var cookieDate = {};
          cookieDate.username = base.encode(vm.credentials.username);
          cookieDate.password = base.encode(vm.credentials.password+codeSuffix);
          $cookies.putObject("user", cookieDate);
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 5);//设置cookie保存5天
          $cookies.putObject("user", cookieDate, {'expires': expireDate});
        }
        var data = response.data;
        userInfo = {
          authtoken: data.token,
          userdto: data.userinfo
        };

        var passwordPattenStatus=data.passwordPattenStatus;
        //获取token和用户信息,存放到缓存中去
        $http.defaults.headers.common['token'] = data.token;
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        if(userInfo.userdto.organizationDto.logo!=null && userInfo.userdto.organizationDto.logo!=""){
          $rootScope.logo="assets/images/"+$rootScope.userInfo.userdto.organizationDto.logo;

        }else{
          $rootScope.logo="assets/images/logo.png";
        }

        Notification.success(languages.findKey('loginSuccess'));



        //监控用户登录超时
        Idle.watch();

        var rspData = serviceResource.getPermission();
        rspData.then(function (data) {
          var permissionList = $filter("array2obj")(data.content, "permission");
          $rootScope.permissionList = permissionList;
          $window.sessionStorage["permissionList"] = JSON.stringify(permissionList);

          if (permissions.getPermissions("config:organazitionPage")) {
            vm.getOrg();
          }
          if (permissions.getPermissions("user:notification")) {
            vm.getNotification();
          }


          //读取小挖型号参数
          var smallExcavatorURL = SYS_CONFIG_URL + "?name=SMALL_EXCAVATOR_MODEL";
          var smallExcavatorPromis = serviceResource.restCallService(smallExcavatorURL,"GET");
          smallExcavatorPromis.then(function (data) {
              $window.sessionStorage["SMALL_EXCAVATOR_MODEL"] = data.value;
              $rootScope.SMALL_EXCAVATOR_MODEL = data.value;
            }, function (reason) {
              Notification.error(languages.findKey('failedToGetSmallExcavatorModel'));
            }
          );

          //读取所有系统参数，放到rootscope中供其它controller使用
          var sysconfigUrl = SYS_CONFIG_LIST_URL;
          var sysconfigPromis = serviceResource.restCallService(sysconfigUrl,"QUERY");
          sysconfigPromis.then(function (data) {
              $window.sessionStorage["SYSCONFIG"] = data;
              $rootScope.SYSCONFIG = data;
            }, function (reason) {
              Notification.error(languages.findKey('failedToGetSysconfig'));
            }
          );

          //加载故障代码描述对照表(小挖)
          $http.get('warningDtc.json').success(function(data){
            $rootScope.warningDataDtc=data;
            $window.sessionStorage["warningDataDtc"]=JSON.stringify(data);

          });

          //加载sensor列表
          $http.get('sensor.json').success(function(data){
            $rootScope.sensor=data;
            $window.sessionStorage["sensor"]=JSON.stringify(data);
          });



          //判断是否需要提示修改密码
          if(passwordPattenStatus==false){
            Notification.error({message: '密码过于简单,请修改', positionX: 'center'});

          }

          $rootScope.$state.go('home');

        }, function (reason) {
        });

      }, function (reason) {
        Notification.error(languages.findKey('loginFailure'));
        count = count + 1;
        if(count == 2){
          $scope.isShow = true;
        }
      });
    }
    //读取组织结构信息
    vm.getOrg = function () {
      var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL, "QUERY");
      rspData.then(function (data) {
        //判断树形菜单的根节点,默认为0,然后根据用户的组织来进行更新
        var orgParent = rootParent;
        if (null != userInfo.userdto.organizationDto) {
          orgParent.id = userInfo.userdto.organizationDto.id;
          rootParent.id = orgParent.id;

          //userInfo.userdto.organizationDto.parentId=0;
        }

        //TODO生成树的方法,要求根的父节点必须为0才可以,临时这么写,后续需要优化
        var list = data;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id == rootParent.id) {
            //  alert("1=="+list[i].parentId);
            list[i].parentId = 0;
            // alert("2=="+list[i].parentId);
            break;
          }
        }

        // alert("orgParent.id==="+orgParent.id);
        $rootScope.orgChart = vm.unflatten(list);



        $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetOrganizationInformation'));
      });
    }

    vm.getNotification = function () {
      //读取未处理的提醒消息
      var notificationPromis = serviceResource.queryNotification(0, null, null, "processStatus=0");
      notificationPromis.then(function (data) {
          $rootScope.notificationNumber = data.page.totalElements;
          $window.sessionStorage["notificationNumber"] = $rootScope.notificationNumber;
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetRemindInformation'));
        }
      );

      //读取未处理的地理位置报警消息
      var locationNotificationPromis = serviceResource.queryNotification(0, null, null, "processStatus=0&type=03");
      locationNotificationPromis.then(function (data) {
          vm.locationNotificationNumber = data.page.totalElements;
          if (vm.locationNotificationNumber > 1) {
            Notification.error({message: languages.findKey('moreInvalidLocationRemindInformation'), delay: true});
          }
          if (vm.locationNotificationNumber == 1) {
            Notification.error({message: data.content[0].content, delay: true});
          }
          $window.sessionStorage["locationNotificationNumber"] = vm.locationNotificationNumber;
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetRemindInformation'));
        }
      );


    }

    vm.changeVerifyCode = function () {
      var yzmImg = document.getElementById("yzmImg");
      var rspdata = serviceResource.restCallService(GET_VERIFYCODE_URL,"GET");
      rspdata.then(function (data) {
        verifyCodeInfo ={
          token:data.token,
          value:data.verifyCode
        }
        vm.verifyCode = verifyCodeInfo.value;
      })

      document.getElementById("verifyCode").value="";

    }

    vm.validate =  function () {
      var code = vm.code ;
      if(null!=code&&""!=code){
        var restCallURL = JUDGE_VERIFYCODE_URL;
        restCallURL += "?&token=" + verifyCodeInfo.token + '&code=' + code;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if(data.code==0){
            Notification.error("验证码输入错误！请重新输入！!");
            $scope.disabled = true;
          }
          if(data.code==1){
            Notification.success("验证码输入正确!");

          }
        })
      }

    }
    var codebox = document.getElementsByClassName("login-box-body")
    if (typeof(codebox.onselectstart) != "undefined") {
      codebox.onselectstart = new Function("return false");
    } else {
      codebox.onmousedown = new Function("return false");
      codebox.onmouseup = new Function("return true");
    }
  }
})();
