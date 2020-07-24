// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('invoices').where({
      iid: event.iid,
    }).update({
      data: {
        state: event.state,
      },
    })
  } catch(e) {
    console.error(e)
  }
}