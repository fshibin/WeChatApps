//index.js
//获取应用实例
const app = getApp()

Page({

  data: {
    openId: "",
    adminOpenIds: [
      "oz6ug4rM0efakVtCzfkqGWOV8OXY",
    ],
    isAuthorized: false,
  },

  onLoad: function () {
    this.getOpenId();
  },

  // 获取用户openid
  getOpenId: function() {
    wx.cloud.callFunction({
      name: 'getopenid',
      data: {},
      success: res => {
        this.setData({
          openId: res.result,
          isAuthorized: this.data.adminOpenIds.includes(res.result),
        });
      },
      fail: err => {
        app.showError('获取openId时发生错误，请联系管理员！')
      },
    })
  },

  onClick: function() {
    wx.navigateTo({
      url: '../mainmenu/mainmenu'
    });
  },

})
