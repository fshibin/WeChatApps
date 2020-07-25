//index.js
//获取应用实例
const app = getApp()

Page({

  data: {
    openId: "",
    adminOpenIds: [],
    isAuthorized: false,
  },

  onLoad: function () {
    const db = wx.cloud.database();
    db.collection('settings').get().then(res => {
      this.data.adminOpenIds = res.data[0].adminOpenIds
      this.getOpenId();
    })
    .catch(err => {
      getApp().showError('访问数据库出错！');
    })
  },

  // 获取用户openid
  getOpenId: function() {
    wx.cloud.callFunction({
      name: 'getopenid',
      data: {},
      success: res => {
        this.setData({
          openId: res.result,
          isAuthorized: this.data.adminOpenIds.length == 0 || this.data.adminOpenIds.includes(res.result),
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
