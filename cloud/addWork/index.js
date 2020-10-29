// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()

  return db.collection('works').add({
    data: {
      date: event.date,
      number: event.number,
      people: event.people,
      price: event.price,
      openId: event.openId,
      address: event.address,
      payroll: event.payroll,
      done: false
    }
  })
}
