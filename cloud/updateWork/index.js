// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  return db.collection('works').add({
    data: {
      date: new Date("2018-09-01"),
      number: 1,
      done: false
    }
  })
}