//index.js
//获取应用实例
const app = getApp()

Page({

  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    "admin": "Shibin2"
  },

  //事件处理函数
  bindViewTap: function() {
    if (this.data.userInfo.nickName == this.data.admin) {
      wx.navigateTo({
        url: '../adminmenu/adminmenu'
     })
    } else {
      wx.navigateTo({
        url: '../drivermenu/drivermenu'
      })
    }
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.getOpenId();
    if (this.data.userInfo.nickName != this.data.admin) {
      this.getDriverInfo();
    }
  },

  // 获取用户openid
  getOpenId: function() {
    wx.cloud.callFunction({
      name: 'getopenid',
      data: {},
      success: res => {
        app.globalData.openId = res.result;
      }
    })
  },

  getDriverInfo: function() {
    const db = wx.cloud.database()
    db.collection('drivers').where({
      _openid: app.globalData.openId,
    }).get().then(res => {
      if (res.data.length > 0) {
        app.globalData.driverName = res.data[0].name;
        app.globalData.lastUsedPnum = res.data[0].lastUsedPnum;
        app.globalData.lastUsedSite = res.data[0].lastUsedSite;
        app.globalData.lastUsedQuarry = res.data[0].lastUsedQuarry;
      } else {
        // new driver
        app.globalData.driverName = '';
        app.globalData.lastUsedPnum = '';
        app.globalData.lastUsedSite = '';
        app.globalData.lastUsedQuarry = '';
      }
    });
  },

  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }

})
