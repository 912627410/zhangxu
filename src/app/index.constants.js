/* global malarkey:false, moment:false */
(function() {
  'use strict';
  var SERVER_BASE_URL = 'http://localhost:8080/rest/';
  //生产环境的https协议地址
  //var SERVER_BASE_URL = 'https://iotserver2.nvr-china.com/rest/';
  angular
    .module('GPSCloud')
    .constant('malarkey', malarkey)
    .constant('SYSTEM_VERSION', '1.0.0')    //系统版本号
    .constant('DEFAULT_SIZE_PER_PAGE', 40)    //默认每页显示纪录数
    .constant('AMAP_QUERY_TIMEOUT_MS', 3000)  //高德地图api调用延时毫秒数
    .constant('DEFAULT_DEVICE_SORT_BY', 'lastDataUploadTime,desc')    //读取设备时的默认排序规则
    .constant('DEFAULT_USER_SORT_BY', 'ssn,desc')    //读取用户信息时的默认排序规则
    .constant('DEFAULT_DEVICE_DATA_SORT_BY', 'recordTime,desc')    //读取设备数据时的默认排序规则
    .constant('DEFAULT_DEVICE_WARNING_DATA_SORT_BY', 'warningTime,desc')    //读取设备报警数据时的默认排序规则
    .constant('DEFAULT_NOTIFICATION_SORT_BY', 'recordTime,desc')    //读取提醒数据时的默认排序规则

    .constant('AMAP_URL', 'https://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&callback=init')   //高德地图URL
    .constant('AMAP_GEO_CODER_URL', 'https://webapi.amap.com/maps?v=1.3&key=d73f64a6c9a3286448bf45a2fe6863c2&plugin=AMap.Geocoder')
    .constant('SERVER_BASE_URL', SERVER_BASE_URL)

    .constant('USER_LOGIN_URL', SERVER_BASE_URL + 'user/gettoken')
    .constant('USER_REGISTER_URL', SERVER_BASE_URL + 'user/register')
    .constant('HOME_GPSDATA_URL', SERVER_BASE_URL + 'device/homegpsdata?search_EQ_locateStatus=A&page=0&size=100&sort=lastDataUploadTime,desc')       //主页中地图数据,默认前100条
    .constant('HOME_STATISTICS_DATA_URL', SERVER_BASE_URL + 'device/homedata')  //主页的统计数据URL
    .constant('DEVCE_PAGED_QUERY', SERVER_BASE_URL + 'device/deviceinfopage')   //分页查询设备信息URL
    .constant('DEVCE_MONITOR_PAGED_QUERY', SERVER_BASE_URL + 'deviceMonitor/deviceinfopage')   //分页查询设备监控信息URL
    .constant('DEVCE_MONITOR_SINGL_QUERY', SERVER_BASE_URL + 'deviceMonitor/deviceinfo')   //分页查询设备监控信息URL
    .constant('DEVCEINFO_URL', SERVER_BASE_URL + 'device/deviceinfo')   //设备crud
    .constant('DEVCE_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/devicedata')   //分页查询设备数据URL
    .constant('DEVCE_SIMPLE_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/devicesimpledata')   //分页查询设备简化数据URL
    //按车队查询GPSdata
    .constant('DEVCE_GPSDATA_BYORG', SERVER_BASE_URL + 'device/gpsdataGroupByOrg')
    .constant('DEVCE_DISTANCE_TOORG_PAGE', SERVER_BASE_URL + 'device/distanceToOrgPage')

    .constant('DEVCE_WARNING_DATA_PAGED_QUERY', SERVER_BASE_URL + 'device/warningdata')   //分页查询设备报警数据URL
    .constant('RESET_PASSWORD_URL', SERVER_BASE_URL + 'user/password')   //修改用户密码
    .constant('SUPER_RESET_PASSWORD_URL', SERVER_BASE_URL + 'user/superpassword')   //管理员修改用户密码
    .constant('USERINFO_URL', SERVER_BASE_URL + 'user/userinfo')   //用户基本信息
    .constant('USER_GROUPBY_ROLE_URL', SERVER_BASE_URL + 'user/userinfobyrole')   //按照role分组得到用户信息
    .constant('USER_PAGED_URL', SERVER_BASE_URL + 'user/userinfopage')   //用户信息分页
    .constant('NOTIFICATION_PAGED_URL', SERVER_BASE_URL + 'user/notification')   //用户提醒信息分页
    .constant('NOTIFICATION_STATISTICS_URL', SERVER_BASE_URL + 'user/notificationStatistics')   //用户提醒数量统计数据
    .constant('ORG_TREE_JSON_DATA_URL', SERVER_BASE_URL + 'config/organazition')   //组织机构信息,返回树状json代码

    //车辆管理相关
    .constant('MACHINE_PAGE_URL',SERVER_BASE_URL + 'machine/machinepage') //车辆信息分页
    .constant('MACHINE_URL', SERVER_BASE_URL + 'machine/machine')   //车辆基本信息
    .constant('MACHINE_MOVE_ORG_URL', SERVER_BASE_URL + 'machine/moveOrg')   //车辆调拨
    .constant('MACHINE_UNBIND_DEVICE_URL', SERVER_BASE_URL + 'machine/unbindDevice')   //设备解绑
    .constant('MACHINE_FUEL_TYPE_URL', SERVER_BASE_URL + 'machine/fuelType')   //燃油类型
    .constant('MACHINE_SALARY_TYPE_URL', SERVER_BASE_URL + 'machine/salaryType')   //人工成本类型
    .constant('MACHINE_UPKEETP_PRICE_TYPE_URL', SERVER_BASE_URL + 'machine/upkeepPriceType')   //保养成本类型

    //系统参数相关
    .constant('SYS_CONFIG_URL', SERVER_BASE_URL + 'config/sysconfig')
    .constant('SYS_CONFIG_PAGE_URL',SERVER_BASE_URL + 'config/sysconfigpage')//系统参数信息分

    //sim卡管理相关
    .constant('SIM_PAGE_URL',SERVER_BASE_URL + 'sim/simpage') //sim卡信息分页
    .constant('SIM_URL', SERVER_BASE_URL + 'sim/sim')   //sim基本信息
    .constant('SIM_UPLOAD_URL', SERVER_BASE_URL + 'sim/upload')   //sim批量导入
    .constant('SIM_STATUS_URL', SERVER_BASE_URL + 'sim/simStatus')   //sim基本信息
    .constant('SIM_UNUSED_URL', SERVER_BASE_URL + 'sim/unused')   //批量返回未使用
    .constant('SIM_FETCH_UNUSED_URL', SERVER_BASE_URL + 'sim/fetchUnused')   //动态查询未使用的

    .constant('ENGINE_TYPE_LIST_URL', SERVER_BASE_URL + 'config/enginetype')   //发动机类型集合

    .constant('DEIVCIE_TYPE_LIST_URL', SERVER_BASE_URL + 'deviceType/deviceTypeList')   //设备类型集合
    .constant('DEIVCIE_PROTOCAL_TYPE_LIST_URL', SERVER_BASE_URL + 'device/protocalTypeList')   //设备协议类型集合
    .constant('DEIVCIE_NOT_REGISTER_LIST_URL', SERVER_BASE_URL + 'device/notRegisterList')   //设备协议类型集合
    .constant('DEIVCIE_MOVE_ORG_URL', SERVER_BASE_URL + 'device/moveOrg')   //设备调拨
    .constant('DEIVCIE_FETCH_UNUSED_URL', SERVER_BASE_URL + 'device/fetchUnused')   //动态查询未使用的

    .constant('DEIVCIE_UNLOCK_FACTOR_URL', SERVER_BASE_URL + 'device/deviceunlock')   //查询解锁url

    .constant('VIEW_SMS_URL', SERVER_BASE_URL + 'sms/getsms')   //得到短消息内容
    .constant('SEND_SMS_URL', SERVER_BASE_URL + 'sms/sendsms')   //发送短消息

    .constant('VIEW_KEYBOARD_MSG_URL', SERVER_BASE_URL + 'device/keyboard')   //得到键盘输入数据


    .constant('PERMISSIONS_URL', SERVER_BASE_URL + 'user/permissions')   //得到登陆用户的权限信息

    //角色相关
    .constant('ROLE_PAGE_URL', SERVER_BASE_URL + 'role/rolePage')   //角色的分页信息
    .constant('ROLE_OPER_URL', SERVER_BASE_URL + 'role/roleOper')   //角色基本CRUD信息
    .constant('ROLE_USER_LIST_URL', SERVER_BASE_URL + 'role/roleUserinfoList')   //角色用户信息
    .constant('ROLE_USER_OPER_URL', SERVER_BASE_URL + 'role/roleUserinfoOper')   //角色用户更新
    .constant('ROLE_PRIVILAGE_LIST_URL', SERVER_BASE_URL + 'role/rolePriviligeList')   //角色权限信息
    .constant('ROLE_PRIVILAGE_OPER_URL', SERVER_BASE_URL + 'role/rolePriviligeOper')   //角色权限更新

    .constant('USER_ROLE_LIST_URL', SERVER_BASE_URL + 'role/userinfoRoleList')   //角色用户信息
    .constant('USER_ROLE_OPER_URL', SERVER_BASE_URL + 'role/userinfoRoleOper')   //角色用户更新
    .constant('PRIVILAGE_ROLE_LIST_URL', SERVER_BASE_URL + 'role/priviligeRoleList')   //角色权限信息
    .constant('PRIVILAGE_ROLE_OPER_URL', SERVER_BASE_URL + 'role/priviligeRoleOper')   //角色权限更新

    //权限相关
    .constant('PRIVILAGE_PAGE_URL', SERVER_BASE_URL + 'privilige/priviligePage')   //权限的分页信息
    .constant('PRIVILAGE_OPER_URL', SERVER_BASE_URL + 'privilige/priviligeOper')   //权限基本CRUD信息
    .constant('PRIVILAGE_STATUS_URL', SERVER_BASE_URL + 'privilige/statusList')   //权限状态信息
    .constant('PRIVILAGE_STATUS_DISABLE_URL', SERVER_BASE_URL + 'privilige/statusDisable')   //权限禁止
    .constant('PRIVILAGE_STATUS_ENABLE_URL', SERVER_BASE_URL + 'privilige/statusEnable')   //权限启用

    //用户相关
    .constant('USER_PAGE_URL', SERVER_BASE_URL + 'user/userinfoPage')   //用户信息分页
    .constant('USER_STATUS_URL', SERVER_BASE_URL + 'user/statusList')   //权限状态信息
    .constant('USER_STATUS_DISABLE_URL', SERVER_BASE_URL + 'user/statusDisable')   //权限禁止
    .constant('USER_STATUS_ENABLE_URL', SERVER_BASE_URL + 'user/statusEnable')   //权限启用


    .constant('ORG_TYPE_URL', SERVER_BASE_URL + 'config/orgTypeList')   //组织类型查询


    //车队管理
    .constant('REVENUE_URL', SERVER_BASE_URL + 'fleetRecord/revenue') //收入统计
    .constant('COST_URL', SERVER_BASE_URL + 'cost/costpage') //成本统计
    .constant('FLEET_PAGE_URL', SERVER_BASE_URL + 'fleetRecord/fleetRecordPage') //分页查询
    //工作面
    .constant('WORKPLANE_URL', SERVER_BASE_URL + 'workplane/workplaneList')   //组织类型查询


  ;


})();
