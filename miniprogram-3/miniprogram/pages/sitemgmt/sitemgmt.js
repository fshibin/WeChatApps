// pages/addsite/addsite.js
Page({

  /**
   * Page initial data
   */
  data: {
    sites: [],
    newSite: '',
    pageWidth: 0,
    infoLeft: 0,
    checked: false,
    ldStDone: false,
  },

  onNewSite: function(e) {
    this.data.newSite = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .replace(/\s*,/g, ',') // no space before comma
      .replace(/\s*\/\s*/g, '\/'); // no space before and after slash
  },

  onAddSite: function () {
    if (this.data.newSite == '') {
      getApp().showError('请输入一个地址！\nPlease input an address!');
      return;
    }
    getApp().showLoading('处理中');
    const db = wx.cloud.database()
    db.collection('sites').where({
      addr: db.RegExp({
        // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') escapes regex special characters.
        regexp: '^' + this.data.newSite.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
        options: 'i',
      }),
    }).count().then(res => {
        if (res.total > 0) {
          getApp().showError("记录已存在！\nRecord already exists!");
        } else {
          db.collection('sites').add({
            data: {
              addr: this.data.newSite,
            },
            success: res => {
              this.onLoad();
              this.setData({newSite:''});
              getApp().showSuccess('添加成功！\nAddition succeeded!');
            },
            fail: err => {
              getApp().showError('添加失败！\nAddition failed!');
            },
          })
        }
    })
  },

  onCheckboxChange: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.sites[idx].selected = true;
    } else {
      this.data.sites[idx].selected = false;
    }
  },

  onDeleteSite: function () {
    const db = wx.cloud.database()
    var i;
    var numToDelete = 0;
    var numResponseGot = 0;
    var someFailed = false;
    var someSucceeded = false;
    for (i = 0; i < this.data.sites.length; i++) {
      if (this.data.sites[i].selected) {
        numToDelete++;
      }
    }
    if (numToDelete == 0) {
      getApp().showError('请至少选择一个地址！\nPlease select at least one address!');
      return;
    }
    getApp().showLoading('处理中');
    for (i = 0; i < this.data.sites.length; i++) {
      if (this.data.sites[i].selected) {
        wx.cloud.callFunction({
          name: 'rmsite',
          data: {
            addr: this.data.sites[i].addr,
          },
          success: res => {
            if (res.result.stats.removed != 1)
              someFailed = true;
            else someSucceeded = true;
            numResponseGot++;
            if (numResponseGot == numToDelete) { // last one
              if (someSucceeded) this.onLoad();
              if (!someSucceeded) {
                getApp().showError('删除失败Failed!');
              } else if (someFailed) {
                this.setData({checked:false});
                getApp().showSuccess('部分成功SomeOK!');
              } else {
                this.setData({checked:false});
                getApp().showSuccess('删除成功AllOK!')     
              }
          
            }
          },
          fail: err => {
            someFailed = true;
            numResponseGot++;
            if (numResponseGot == numToDelete) { // last one
              if (someSucceeded) this.onLoad();
              if (!someSucceeded) {
                getApp().showError('删除失败Failed!');
              } else if (someFailed) {
                getApp().showSuccess('部分成功SomeOK!');
              } else {
                getApp().showSuccess('删除成功AllOK!')     
              }
            }
          }
        })
      }
    };
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'loadsites',
      data: {
      },
      success: res => {
        if (res.result != null) {
          this.setData({
            sites: res.result.data,
          });
        }
        this.setData({ldStDone:true})
      },
      fail: err => {
        this.setData({ldStDone:true})
      },
    });
    this.setData({
      pageWidth: getApp().globalData.pageWidth,
      infoLeft: getApp().globalData.infoLeft,
    });
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {
  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {
  }

})