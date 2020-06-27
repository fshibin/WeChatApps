//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'kohbrotherltd-963fn',
        traceUser: true,
      })
    }

    this.globalData = {}
  },

  showError: function(msg) {
    wx.hideLoading({
      complete: (res) => {
      },
    })
    wx.showModal({
      title: '错误Error!',
      content: msg,
      showCancel: false,
      mask: true,
    })
  },

  showErrorCallback: function(msg, cb) {
    wx.hideLoading({
      complete: (res) => {
      },
    })
    wx.showModal({
      title: '错误Error!',
      content: msg,
      showCancel: false,
      mask: true,
      success: cb,
    })
  },

  showSuccess: function(msg) {
    wx.hideLoading({
      complete: (res) => {
      },
    })
    wx.showModal({
      title: '成功Success!',
      content: msg,
      showCancel: false,
      mask: true,
    })
  },

  showSuccessCallback: function(msg, cb) {
    wx.hideLoading({
      complete: (res) => {
      },
    })
    wx.showModal({
      title: '成功Success!',
      content: msg,
      showCancel: false,
      mask: true,
      success: cb,
    })
  },

  showLoading: function(msg) {
    wx.showLoading({
      title: msg,
      mask: true,
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 30000)
  },

})
// http://taylorliang.top/2018/06/07/miniprogram-table/
