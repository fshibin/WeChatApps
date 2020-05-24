// pages/addsite/addsite.js
Page({

  /**
   * Page initial data
   */
  data: {
    sites: [],
    newSite: null
  },

  onNewSite: function(e) {
    this.data.newSite = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .replace(/\s*,/g, ',') // no space before comma
      .replace(/\s*\/\s*/g, '\/'); // no space before and after slash
  },

  onAddSite: function () {
    const db = wx.cloud.database()
    db.collection('sites').where({
      addr: db.RegExp({
        // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') escapes regex special characters.
        regexp: this.data.newSite.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        options: 'i',
      }),
    }).count().then(res => {
        if (res.total > 0) {
          wx.showToast({
            icon: 'none',
            title: "已存在Exists!",
            duration: 3000,
          }) 
        } else {
          db.collection('sites').add({
            data: {
              addr: this.data.newSite,
            },
            success: res => {
              this.onLoad();
              wx.showToast({
                title: '添加成功OK!',
                duration: 3000,
              })
            },
            fail: err => {
              wx.showToast({
                title: '添加失败Failed!',
                icon: 'none',
                duration: 3000,
              })
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
                wx.showToast({
                  title: '删除失败Failed!',
                  icon: 'none',
                  duration: 3000,
                })
              } else if (someFailed) {
                wx.showToast({
                  title: '部分成功SomeOK!',
                  icon: 'none',
                  duration: 3000,
                })
              } else {
                wx.showToast({
                  title: '删除成功AllOK!',
                  duration: 3000,
                })     
              }
          
            }
          },
          fail: err => {
            someFailed = true;
            console.error('[云函数] [rmsite] 调用失败：', err);
            numResponseGot++;
            if (numResponseGot == numToDelete) { // last one
              if (someSucceeded) this.onLoad();
              if (!someSucceeded) {
                wx.showToast({
                  title: '删除失败Failed!',
                  icon: 'none',
                  duration: 3000,
                })
              } else if (someFailed) {
                wx.showToast({
                  title: '部分成功SomeOK!',
                  icon: 'none',
                  duration: 3000,
                })
              } else {
                wx.showToast({
                  title: '删除成功OK!',
                  duration: 3000,
                })     
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
    db.collection('sites').get().then(res => {
      this.setData({
        sites: res.data,
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
    var i;
    for (i = 0; i < sites.length; i++) {
      var that = this;
      let id = "#addr" + i;
      let query = wx.createSelectorQuery(); //创建查询对象
      query.select(id).boundingClientRect(); //获取view的边界及位置信息
      query.exec(function (res) {
        that.sites[i].height = res[0].height + "px";
        that.setData({
          sites: sites,
        });
      });
    }
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