// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('drivers').where({
      _openid: event.openId,
    }).update({
      data: {
        lastUsedPnum: event.pnum,
      },
    })
  } catch(e) {
    console.error(e)
  }
}