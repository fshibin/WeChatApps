// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var data = {
    lastUsedPnum: event.pnum,
  }
  if (typeof event.site === 'undefined') {} else {
    data.lastUsedSite = event.site;
  }
  if (typeof event.quarry === 'undefined') {} else {
    data.lastUsedQuarry = event.quarry;
  }
  if (typeof event.jobAddr === 'undefined') {} else {
    data.lastUsedJobAddr = event.jobAddr;
  }
  try {
    return await db.collection('drivers').where({
      _openid: event.openId,
    }).update({
      data,
    })
  } catch(e) {
    console.error(e)
  }
}