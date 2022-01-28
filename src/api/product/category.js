// 写的就是和请求平台属性相关逻辑的请求
import request from '@/utils/request'

// axios
// 对象的用法，是把request当对象去使用
// 对象内部根据请求方式有对应的方法
// 这个方法内部无论是什么请求，第一个参数都代表路径（有可能带query和params参数）
// 方法当中第二个参数，是什么不是固定的，要根据请求方式的不同而不同
// get和delete 第二个参数是配置对象，没有第三个参数 
// post和post 第二个参数是data，请求体参数，第三个参数才是配置对象


export default {
    getCategory1() {
        return request.get('/admin/product/getCategory1')
    },
    getCategory2(category1Id) {
        return request.get(`/admin/product/getCategory2/${category1Id}`)
    },
    getCategory3(category2Id) {
        return request.get(`/admin/product/getCategory3/${category2Id}`)
    },
}

