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
      getApp().showError('没有输入名字！\nName is not entered!')
      return;
    }
    let that = this;
    wx.showModal({
      title: '名字注册后不能修改，是否继续？\nYour name can\'t be changed once registered. Continue?',
      confirmText: '确认Yes',
      cancelText: '取消No',
      mask: true,
      success(res) {
        if (res.confirm) that.addDriver();
      }
    });
  },

  addDriver : function() {
    getApp().showLoading('处理中')
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
        getApp().showSuccess('成功！Done!');
      },
      fail: function(res) {
        getApp().showError('无法注册您的名字！\nUnable to register your name!');
      }
    })
  },

  formReset(e) {
    this.data.driverName = '';
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