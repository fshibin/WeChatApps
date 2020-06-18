// miniprogram/quarrymgmt/quarrymgmt.js
Page({

  /**
   * Page initial data
   */
  data: {
    quarries: [],
    newQuarry: '',
    pageWidth: 0,
    infoLeft: 0,
    checked: false,
    ldQrDone: false,
  },

  onNewQuarry: function(e) {
    this.data.newQuarry = e.detail.value
      .trim() // trim frist & last spaces
  },

  onAddQuarry: function () {
    if (this.data.newQuarry == '') {
      getApp().showError('请输入采石场/倒土场名称！\nPlease input quarry name!');
      return;
    }
    getApp().showLoading('处理中');
    const db = wx.cloud.database()
    db.collection('quarries').where({
      name: db.RegExp({
        // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') escapes regex special characters.
        regexp: '^' + this.data.newQuarry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
        options: 'i',
      }),
    }).count().then(res => {
      let a = '^' + this.data.newQuarry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'
        if (res.total > 0) {
          getApp().showError("记录已存在！\nRecord already exists!");
        } else {
          db.collection('quarries').add({
            data: {
              name: this.data.newQuarry,
            },
            success: res => {
              this.onLoad();
              this.setData({newQuarry:''});
              getApp().showSuccess('添加成功OK!');
            },
            fail: err => {
              getApp().showError('添加失败Failed!')
            },
          })
        }
    })
  },

  onCheckboxChange: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.quarries[idx].selected = true;
    } else {
      this.data.quarries[idx].selected = false;
    }
  },

  onDeleteQuarry: function () {
    const db = wx.cloud.database()
    var i;
    var numToDelete = 0;
    var numResponseGot = 0;
    var someFailed = false;
    var someSucceeded = false;
    for (i = 0; i < this.data.quarries.length; i++) {
      if (this.data.quarries[i].selected) {
        numToDelete++;
      }
    }
    if (numToDelete == 0) {
      getApp().showError('请至少选择一个采石场/倒土场！\nPlease select at least one quarry!');
      return;
    }
    getApp().showLoading('处理中');
    for (i = 0; i < this.data.quarries.length; i++) {
      if (this.data.quarries[i].selected) {
        wx.cloud.callFunction({
          name: 'rmquarry',
          data: {
            name: this.data.quarries[i].name,
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
    const db = wx.cloud.database()
    db.collection('quarries').get().then(res => {
      this.setData({
        ldQrDone: true,
        quarries: res.data,
        pageWidth: getApp().globalData.pageWidth,
        infoLeft: getApp().globalData.infoLeft,
      });
    })
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