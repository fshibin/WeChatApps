// pages/vehiclemgmt/vehiclemgmt.js
Page({

  /**
   * Page initial data
   */
  data: {
    vehicles: [],
    newVehicle: '',
    tons: '',
    pageWidth: 0,
    infoLeft: 0,
    checked: false,
    ldVcDone: false,
  },

  onNewVehicle: function(e) {
    this.data.newVehicle = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s/g, '') // remove spaces
      .toUpperCase();
  },

  onDiggerTons: function(e) {
    this.data.tons = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s/g, '') // remove spaces
      .toUpperCase()
  },

  onAddVehicle: function () {
    if (this.data.newVehicle == '') {
      getApp().showError('请输入一个车牌号！\nPlease input a plate number!');
      return;
    }
    getApp().showLoading('处理中');
    var newVehicle = this.data.newVehicle;
    if (this.data.tons != '') newVehicle += ('-' + this.data.tons)
    const db = wx.cloud.database()
    db.collection('vehicles').where({
      pnum: db.RegExp({
        // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') escapes regex special characters.
        regexp: '^' + newVehicle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
        options: 'i',
      }),
    }).count().then(res => {
        if (res.total > 0) {
          getApp().showError("记录已存在！\nRecord already exists!");
        } else {
          db.collection('vehicles').add({
            data: {
              pnum: newVehicle,
            },
            success: res => {
              this.onLoad();
              this.setData({newVehicle:''});
              this.setData({tons:''});
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
    if (numToDelete == 0) {
      getApp().showError('请至少选择一个车牌号！\nPlease select at least one plate number!');
      return;
    }
    getApp().showLoading('处理中');
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
    db.collection('vehicles').get().then(res => {
      this.setData({
        ldVcDone: true,
        vehicles: res.data,
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