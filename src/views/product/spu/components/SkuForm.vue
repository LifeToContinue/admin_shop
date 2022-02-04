<template>
  <el-form ref="form" label-width="100px" :model="skuInfo">
    <el-form-item label="SPU名称">
      {{ spu.spuName }}
    </el-form-item>
    <el-form-item label="SKU名称">
      <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
    </el-form-item>
    <el-form-item label="价格(元)">
      <el-input
        placeholder="价格(元)"
        type="number"
        v-model="skuInfo.price"
      ></el-input>
    </el-form-item>
    <el-form-item label="重量(千克)">
      <el-input
        placeholder="重量(千克)"
        type="number"
        v-model="skuInfo.weight"
      ></el-input>
    </el-form-item>
    <el-form-item label="规格描述">
      <el-input
        type="textarea"
        placeholder="规格描述"
        rows="4"
        v-model="skuInfo.skuDesc"
      ></el-input>
    </el-form-item>
    <el-form-item label="平台属性">
      <el-form :inline="true" label-width="100px">
        <el-form-item
          :label="attr.attrName"
          v-for="(attr, index) in attrList"
          :key="attr.id"
        >
          <el-select placeholder="请选择" v-model="attr.attrIdValueId">
            <el-option
              :label="attrValue.valueName"
              :value="`${attr.id}:${attrValue.id}`"
              v-for="(attrValue, index) in attr.attrValueList"
              :key="attrValue.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-form :inline="true" label-width="100px">
        <el-form-item
          :label="saleAttr.saleAttrName"
          v-for="(saleAttr, index) in spuSaleAttrList"
          :key="saleAttr.id"
        >
          <el-select placeholder="请选择" v-model="saleAttr.saleAttrIdValueId">
            <el-option
              :label="saleAttrValue.saleAttrValueName"
              :value="`${saleAttr.id}:${saleAttrValue.id}`"
              v-for="(saleAttrValue, index) in saleAttr.spuSaleAttrValueList"
              :key="saleAttrValue.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>
    <el-form-item label="图片列表">
      <el-table
        border
        style="width: 100%"
        :data="spuImageList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column header-align="center" align="center" label="图片">
          <template slot-scope="{ row, $index }">
            <img :src="row.imgUrl" style="width: 100px; height: 100px" />
          </template>
        </el-table-column>
        <el-table-column
          header-align="center"
          align="center"
          prop="imgName"
          label="名称"
        >
        </el-table-column>
        <el-table-column header-align="center" align="center" label="操作">
          <template slot-scope="{ row, $index }">
            <el-button type="primary" size="mini" v-if="row.isDefault === '0'"  @click="changeDefault(row, spuImageList)">设为默认</el-button>
            <el-tag v-else type="success">默认</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "skuForm",
  data() {
    return {
      spu: {},
      attrList: [],
      spuSaleAttrList: [],
      spuImageList: [], //这个列表是spu的图片列表，展示出来是为了让用户选择的，不能去收集选中的sku图片

      skuImageList: [], //我们选择了spu的图片列表后组成的sku图片列表，收集到这里,后期保存的时候整理完成再去放到skuInfo

      skuInfo: {
        //从父组件传过来的
        spuId: "",
        category3Id: "",
        tmId: "",

        // createTime: "2021-03-03T07:17:36.281Z",
        // id: 0,
        // isSale: 0,
        //咱们通过v-model直接收集
        skuName: "",
        price: "",
        weight: "",
        skuDesc: "",

        //通过自己写代码收集
        // sku的平台属性值列表，是由用户选择平台属性的值所决定的
        // 选择了一个平台属性值，那么列表当中就多了一个平台属性值对象
        // 没有选择，那就没有
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   attrName: "string",
          //   id: 0,
          //   skuId: 0,
          //   valueId: 0,
          //   valueName: "string",
          // }
        ],

        skuDefaultImg: "", //默认图片的路径

        skuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   skuId: 0,
          //   spuImgId: 0,
          // },
        ],

        skuSaleAttrValueList: [
          // {
          //   id: 0,
          //   saleAttrId: 0,
          //   saleAttrName: "string",
          //   saleAttrValueId: 0,
          //   saleAttrValueName: "string",
          //   skuId: 0,
          //   spuId: 0,
          // },
        ],
      },
    };
  },
  methods: {
    async getInitAddSkuFormData(spu, category1Id, category2Id) {
      this.spu = spu;
      let promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      let promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);
      let promise3 = this.$API.sku.getSpuImageList(spu.id);

      try {
        const result = await Promise.all([promise1, promise2, promise3]);
        this.attrList = result[0].data;
        this.spuSaleAttrList = result[1].data;
        let spuImageList = result[2].data;
        //这样做可以避免每个图片后期都要使用$set
        //因为在这里我们添加好属性，后面我们是直接把数组赋值给响应式属性this.spuImageList，所以内部的东西也是响应式
        spuImageList.forEach((item) => (item.isDefault = "0"));
        this.spuImageList = spuImageList;
        console.log(this.spuImageList);
      } catch (error) {
        this.$message.error("请求获取初始化数据失败" + error.message);
      }
    },
    //选中图片的回调
    handleSelectionChange(val) {
      this.skuImageList = val;
    },
    changeDefault(row, spuImageList){
      spuImageList.forEach((item) => (item.isDefault = "0"));
      row.isDefault = "1";

      // 此时就是手机默认图片路径的最佳时机
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    //保存
    async save(){
      //获取参数
      let { spu, skuInfo, attrList, spuSaleAttrList, skuImageList } = this;
      //整理参数
      //整理父组件传递过来的三个数据
      skuInfo.category3Id=spu.category3Id
      skuInfo.spuId=spu.id
      skuInfo.tmId=spu.tmId

      //整理sku的图片列表
      skuInfo.skuImageList=skuImageList.map((item)=>({
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id,
      }))

      //整理sku的平台属性值列表和销售属性值列表 
      skuInfo.skuAttrValueList=attrList.reduce((prev,item)=>{
        // 判断哪个平台属性当年被选择过属性值
        if(item.attrIdValueId){
          // 把收集的数据转化为需要的属性值结构
          let [attrId,valueId] =item.attrIdValueId.split(":")
          let obj={attrId,valueId}
          prev.push(obj);
        }
        return prev;
      },[])

      skuInfo.skuSaleAttrValueList=spuSaleAttrList.reduce((prev,item)=>{
        if(item.saleAttrIdValueId){
          let [saleAttrId, saleAttrValueId] = item.saleAttrIdValueId.split(":");
          let obj = { saleAttrId, saleAttrValueId };
          prev.push(obj);
        }
        return prev;
      },[])

      //请求参数
      try {
        //成功干啥
        const result= await this.$APIs.sku.addUpdate(skuInfo)
        if(result.code===200 || result.code===20000){
          //提示
          this.$message.success("保存sku成功");
          //返回到spu列表页面.不需要重新获取spu列表数据
          this.$emit("update:visible", false);
          //清空数据
          this.resetData()
        }else{
          this.$message.error('保存sku失败')
        }
      } catch (error) {
        //失败干啥
        this.$message.error('请求保存sku失败')
      }
      
        
        
    },
    //清空data的所有数据
    resetData(){
      Object.assign(this._data,this.$options.data())
    },

    //添加sku的取消操作
    cancel() {
      //返回列表页
      this.$emit("update:visible", false);
      //清空sku的数据
      this.resetData()
    },
  },
};
</script>

<style>
</style>