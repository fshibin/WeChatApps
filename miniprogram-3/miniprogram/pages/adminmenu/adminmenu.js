// miniprogram/pages/adminmenu/adminmenu.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageWidth: 0,
    infoLeft: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    this.getPageWidth();
    this.getInfoLeft();
  },

  getPageWidth: function() {
    var that = this;
    let id = "#page";
    let query = wx.createSelectorQuery(); //创建查询对象
    query.select(id).boundingClientRect(); //获取view的边界及位置信息
    query.exec(function (res) {
      that.setData({
        pageWidth: res[0].width,
      });
      getApp().globalData.pageWidth = res[0].width;
    });
  },

  getInfoLeft: function() {
    var that = this;
    let id = "#info0";
    let query = wx.createSelectorQuery(); //创建查询对象
    query.select(id).boundingClientRect(); //获取view的边界及位置信息
    query.exec(function (res) {
      that.setData({
        infoLeft: res[0].left,
      });
      getApp().globalData.infoLeft = res[0].left;
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
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