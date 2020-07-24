// pages/clientmgmt/clientmgmt.js
Page({

  /**
   * Page initial data
   */
  data: {
    clients: [],
    name: '',
    addr: '',
    phone: '',
    email: '',
    pageWidth: 0,
    infoLeft: 0,
    checked: false,
    ldCtDone: false,
    isAdding: true,
    _id: '',
  },

  onName: function(e) {
    this.data.name = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .replace(/\s*,/g, ',') // no space before comma
      .replace(/\s*\/\s*/g, '\/'); // no space before and after slash
  },

  onAddr: function(e) {
    this.data.addr = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .replace(/\s*,/g, ',') // no space before comma
      .replace(/\s*\/\s*/g, '\/'); // no space before and after slash
  },

  onPhone: function(e) {
    this.data.phone = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
  },

  onEmail: function(e) {
    this.data.email = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s*/g, '') // remove spaces
  },

  onReset: function() {
    this.setData({
      name: '',
      addr: '',
      phone: '',
      email: '',
      _id: '',
      isAdding: true,
    })
  },

  onCommit: function () {
    if (this.data.name == '') {
      getApp().showError('客户名称为空！\nClient name is empty!');
      return;
    }
    getApp().showLoading('处理中');
    if (this.data.isAdding) {
      const db = wx.cloud.database()
      db.collection('clients').where({
        name: db.RegExp({
          // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') escapes regex special characters.
          regexp: '^' + this.data.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
          options: 'i',
        }),
      }).count().then(res => {
        if (res.total > 0) {
          getApp().showError("记录已存在！\nRecord already exists!");
        } else {
          let that = this;
          db.collection('clients').add({
            data: {
              name: this.data.name,
              addr: this.data.addr,
              phone: this.data.phone,
              email: this.data.email,
            },
            success: res => {
              that.onLoad();
              that.onReset();
              getApp().showSuccess('添加成功！\nAddition succeeded!');
            },
            fail: err => {
              getApp().showError('添加失败！\nAddition failed!');
            },
          })
        }
      })
    } else {
      const db = wx.cloud.database()
      db.collection('clients').where({
        name: db.RegExp({
          // .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') escapes regex special characters.
          regexp: '^' + this.data.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
          options: 'i',
        }),
        _id: db.command.neq(this.data._id),
      }).count().then(res => {
        if (res.total > 0) {
          getApp().showError("记录已存在！\nRecord already exists!");
        } else {
          let that = this;
          wx.cloud.callFunction({
            name: 'updateclient',
            data: {
              _id: this.data._id,
              name: this.data.name,
              addr: this.data.addr,
              phone: this.data.phone,
              email: this.data.email,
            },
            success: res => {
              that.onLoad();
              that.onReset();
              getApp().showSuccess('修改成功！\nUpdate succeeded!');
            },
            fail: err => {
              getApp().showError('修改失败！\nUpdate failed!');
            },
          });
        }
      })
    }
  },

  onCheckboxChange: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.clients[idx].selected = true;
    } else {
      this.data.clients[idx].selected = false;
    }
  },

  onChange: function() {
    var i;
    var idx = -1;
    var numSelected = 0;
    for (i = 0; i < this.data.clients.length; i++) {
      if (this.data.clients[i].selected) {
        numSelected++;
        idx = i;
      }
    }
    if (numSelected == 0) {
      getApp().showError('请选择一个客户！\nPlease select one client!');
      return;
    } else if (numSelected > 1) {
      getApp().showError('只能选择一个客户！\nYou can only select one client!');
      return;
    } else {
      this.setData({
        name: this.data.clients[idx].name,
        addr: this.data.clients[idx].addr,
        phone: this.data.clients[idx].phone,
        email: this.data.clients[idx].email,
        _id: this.data.clients[idx]._id,
        isAdding: false,
      })
    }
  },

  onDelete: function () {
    const db = wx.cloud.database()
    var i;
    var numToDelete = 0;
    var numResponseGot = 0;
    var someFailed = false;
    var someSucceeded = false;
    for (i = 0; i < this.data.clients.length; i++) {
      if (this.data.clients[i].selected) {
        numToDelete++;
      }
    }
    if (numToDelete == 0) {
      getApp().showError('请至少选择一个客户！\nPlease select at least one client!');
      return;
    }
    getApp().showLoading('处理中');
    let that = this;
    for (i = 0; i < this.data.clients.length; i++) {
      if (this.data.clients[i].selected) {
        wx.cloud.callFunction({
          name: 'rmclient',
          data: {
            name: this.data.clients[i].name,
          },
          success: res => {
            if (res.result.stats.removed != 1)
              someFailed = true;
            else someSucceeded = true;
            numResponseGot++;
            if (numResponseGot == numToDelete) { // last one
              if (someSucceeded) that.onLoad();
              if (!someSucceeded) {
                getApp().showError('删除失败Failed!');
              } else if (someFailed) {
                that.onReset();
                that.setData({checked:false});
                getApp().showSuccess('部分成功SomeOK!');
              } else {
                that.onReset();
                that.setData({checked:false});
                getApp().showSuccess('删除成功AllOK!')     
              }
          
            }
          },
          fail: err => {
            someFailed = true;
            numResponseGot++;
            if (numResponseGot == numToDelete) { // last one
              if (someSucceeded) that.onLoad();
              if (!someSucceeded) {
                getApp().showError('删除失败Failed!');
              } else if (someFailed) {
                that.onReset();
                that.setData({checked:false});
                getApp().showSuccess('部分成功SomeOK!');
              } else {
                that.onReset();
                that.setData({checked:false});
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
    let that = this;
    wx.cloud.callFunction({
      name: 'loadclients',
      data: {
      },
      success: res => {
        if (res.result != null) {
          that.setData({
            clients: res.result.data,
          });
        }
        that.setData({ldCtDone:true})
      },
      fail: err => {
        that.setData({ldCtDone:true})
      },
    });
    this.setData({
      pageWidth: getApp().globalData.pageWidth,
      infoLeft: getApp().globalData.infoLeft,
      checked: false,
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