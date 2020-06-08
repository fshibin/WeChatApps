// miniprogram/pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    registered: false,
    driverName: '',
    pageWidth: 0,
    infoLeft: 0,
  },

  inputName(e) {
    this.setData({ driverName: e.detail.value});
  },

  formSubmit(e) {
    if (this.data.driverName == '') {
      wx.showToast({
        icon: "none",
        title: '没有输入名字！Name is not entered!',
        duration: 3000
      })
      return;
    }
    let that = this;
    wx.showModal({
      title: '名字注册后不能修改，是否继续？ Your name cann\'t be changed once registered. Continue?',
      confirmText: '确认Yes',
      cancelText: '取消No',
      success(res) {
        if (res.confirm) that.addDriver();
      }
    });
  },

  addDriver : function() {
    let that = this;
    const db = wx.cloud.database()
    db.collection('drivers').add({
      data: {
        name: that.data.driverName,
        lastUsedPnum: '',
        lastUsedSite: '',
        lastUsedQuarry: '',
      },
      success: function(res) {
        getApp().globalData.driverName = that.data.driverName;
        that.setData({registered: true});
        wx.showToast({
          title: '成功！Done!',
          icon: 'success',
          duration: 3000,
        });
        setTimeout(function () {
          wx.navigateBack();
        }, 3000);
      },
      fail: function(res) {
        wx.showToast({
          title: '无法注册您的名字！Unable to register your name!',
          duration: 3000,
          icon: "none"
        })
      }
    })
  },

  formReset(e) {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let reg = getApp().globalData.driverName != '';
    this.setData({
      driverName: getApp().globalData.driverName,
      pageWidth: getApp().globalData.pageWidth,
      infoLeft: getApp().globalData.infoLeft,
      registered: reg,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  }
})