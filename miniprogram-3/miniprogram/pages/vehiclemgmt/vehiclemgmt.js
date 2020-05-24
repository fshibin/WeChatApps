// pages/vehiclemgmt/vehiclemgmt.js
Page({

  /**
   * Page initial data
   */
  data: {
    vehicles: [],
    newVehicle: null
  },

  onNewVehicle: function(e) {
    this.data.newVehicle = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s/g, ''); // remove spaces
  },

  onAddVehicle: function () {
    const db = wx.cloud.database()
    db.collection('vehicles').where({
      pnum: db.RegExp({
        // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') escapes regex special characters.
        regexp: this.data.newVehicle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
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
          db.collection('vehicles').add({
            data: {
              pnum: this.data.newVehicle,
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
      this.data.vehicles[idx].selected = true;
    } else {
      this.data.vehicles[idx].selected = false;
    }
  },

  onDeleteVehicle: function () {
    const db = wx.cloud.database()
    var i;
    var numToDelete = 0;
    var numResponseGot = 0;
    var someFailed = false;
    var someSucceeded = false;
    for (i = 0; i < this.data.vehicles.length; i++) {
      if (this.data.vehicles[i].selected) {
        numToDelete++;
      }
    }
    for (i = 0; i < this.data.vehicles.length; i++) {
      if (this.data.vehicles[i].selected) {
        wx.cloud.callFunction({
          name: 'rmvehicle',
          data: {
            pnum: this.data.vehicles[i].pnum,
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
            console.error('[云函数] [rmvehicle] 调用失败：', err);
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
    db.collection('vehicles').get().then(res => {
      this.setData({
        vehicles: res.data,
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
    for (i = 0; i < vehicles.length; i++) {
      var that = this;
      let id = "#pnum" + i;
      let query = wx.createSelectorQuery(); //创建查询对象
      query.select(id).boundingClientRect(); //获取view的边界及位置信息
      query.exec(function (res) {
        that.vehicles[i].height = res[0].height + "px";
        that.setData({
          vehicles: vehicles,
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