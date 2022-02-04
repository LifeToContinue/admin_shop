<template>
  <el-form label-width="100px" :model="spuInfo">
    <el-form-item label="SPU名称">
      <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
    </el-form-item>
    <el-form-item label="品牌">
      <el-select v-model="spuInfo.tmId" placeholder="品牌" value="">
        <el-option
          :label="tm.tmName"
          :value="tm.id"
          v-for="(tm, index) in trademarkList"
          :key="tm.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述">
      <el-input
        type="textarea"
        placeholder="SPU描述"
        rows="4"
        v-model="spuInfo.description"
      ></el-input>
    </el-form-item>
    <el-form-item label="SPU图片">
      <el-upload
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :file-list="spuImageList"
        :on-success="handleSuccess"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-select
        :placeholder="
          unUsedSaleAttrList.length > 0
            ? `还有${unUsedSaleAttrList.length}未选择`
            : '没有啦！！！'
        "
        v-model="unUsedSaleAttrIdName"
      >
        <el-option
          :label="unUsedSaleAttr.name"
          :value="`${unUsedSaleAttr.id}:${unUsedSaleAttr.name}`"
          v-for="(unUsedSaleAttr, index) in unUsedSaleAttrList"
          :key="unUsedSaleAttr.id"
        ></el-option>
      </el-select>

      <el-button
        type="primary"
        :disabled="!unUsedSaleAttrIdName"
        icon="el-icon-plus"
        style="margin-left: 10px"
        @click="addSaleAttr"
        >添加销售属性</el-button
      >

      <el-table
        border
        style="width: 100%; margin-top: 20px"
        :data="spuInfo.spuSaleAttrList"
      >
        <el-table-column type="index" label="序号" width="80">
        </el-table-column>
        <el-table-column prop="saleAttrName" label="属性名" width="150">
        </el-table-column>
        <el-table-column prop="prop" label="属性值名称列表" width="width">
          <template slot-scope="{ row, $index }">
            <!-- @close="handleClose(tag)" -->
            <el-tag
              :key="saleAttrValue.id"
              v-for="(saleAttrValue, index) in row.spuSaleAttrValueList"
              closable
              :disable-transitions="false"
              @close="row.spuSaleAttrValueList.splice(index, 1)"
            >
              {{ saleAttrValue.saleAttrValueName }}
            </el-tag>
            <!-- 

           -->
            <el-input
              v-model="row.saleAttrValueName"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
              class="input-new-tag"
              ref="saveTagInput"
              size="small"
              v-if="row.isEdit"
            >
            </el-input>
            <!-- 

             -->
            <el-button
              v-else
              @click="showInput(row)"
              class="button-new-tag"
              size="small"
              >添加</el-button
            >
          </template>
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="150">
          <template slot-scope="{ row, $index }">
            <HintButton
              type="danger"
              title="删除销售属性"
              icon="el-icon-delete"
              size="mini"
              @click="spuInfo.spuSaleAttrList.splice($index, 1)"
            ></HintButton>
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
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,

      unUsedSaleAttrIdName: "",

      spuInfo: {
        spuName: "",
        tmId: "",
        category3Id: "",
        description: "",
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   isChecked: "string",
          //   saleAttrName: "string",
          //   saleAttrValueName: "string",
          //   spuId: 0,
          // },
          //   ],
          // },
        ],
        //这个spuForm我们内部初始化属性都是空的，是为添加spu的时候收集数据用的
        //修改spu的时候，这个spuForm就会被赋值为请求回来的有数据的对象
        // spuForm :{
      },
      spuImageList: [], //请求初始化的spu图片列表
      trademarkList: [], //请求初始化的所有品牌列表
      BaseSaleAttrList: [], //请求初始化的所有的销售属性列表
    };
  },
  methods: {
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      this.spuImageList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //这个方法代表上传成功后的回调
    handleSuccess(res, file, fileList) {
      console.log(fileList);
      this.spuImageList = fileList;
    },
    //取消按钮
    cancel() {
      //返回到列表页
      this.$emit("update:visible", false);
      //清空数据
      this.resetData()
    },
    async getInitAddSpuFormData(category3Id) {
      this.category3Id = category3Id;
      const result2 = await this.$API.trademark.getList();
      if (result2.code === 200 || result2.code === 20000) {
        this.trademarkList = result2.data;
      }
      const result3 = await this.$API.spu.getSaleAttrList();
      if (result3.code === 200 || result3.code === 20000) {
        this.BaseSaleAttrList = result3.data;
      }
    },
    async getInitUpdateSpuFormData(spu, category3Id) {
      this.category3Id = category3Id;
      //这里面就是写4个请求
      const result = await this.$API.spu.get(spu.id);
      if (result.code === 200 || result.code === 20000) {
        this.spuInfo = result.data;
      }
      const result1 = await this.$API.sku.getSpuImageList(spu.id);
      if (result1.code === 200 || result1.code === 20000) {
        const spuImageList = result1.data;
        // 我们为了让upload可以展示图片列表，必须把请求回来的图片当中添加上name和url

        spuImageList.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        this.spuImageList = spuImageList;
      }
      const result2 = await this.$API.trademark.getList();
      if (result2.code === 200 || result2.code === 20000) {
        this.trademarkList = result2.data;
      }
      const result3 = await this.$API.spu.getSaleAttrList();
      if (result3.code === 200 || result3.code === 20000) {
        this.BaseSaleAttrList = result3.data;
      }
    },
    //点击添加销售属性按钮
    addSaleAttr() {
      //1.把收集的数据变为一个对象
      let [baseSaleAttrId, saleAttrName] = this.unUsedSaleAttrIdName.split(":");
      //2.把对象添加指定的数组当中
      let obj = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };
      // 把销售属性对象添加到spu的销售属性列表当中
      this.spuInfo.spuSaleAttrList.push(obj);
    },
    //点击添加按钮（添加属性值按钮）
    showInput(row) {
      this.$set(row, "isEdit", true);

      this.$set(row, "saleAttrValueName", "");

      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },
    //用户输入完数据后，回车或失去焦点
    //回车事件触发完成之后会默认再次触发失去焦点事件
    //第一遍回车事件先触发，我们添加的值会添加进去没问题
    //第二遍再次出发失去焦点事件的时候，row.saleAttrValueName值已经是空串
    //就会进入到第一个if，如果提示信息，就会出现错误的提示信息
    handleInputConfirm(row) {
      let { baseSaleAttrId, saleAttrValueName } = row;

      //拿到属性值名称，判断是否是空串
      if (saleAttrValueName.trim() === "") {
        row.saleAttrValueName = "";
        row.isEdit = false; //将输入框变为添加按钮
        // this.$message.error('输入的属性值不能为空白')
        return;
      }

      //判断当前这个销售属性值名称是否已经在销售属性值列表当中存在，这里不需要除去自身
      //因为我们现在还没有把这个销售属性值添加到指定的位置
      //之前平台属性要去除去自身，因为之前我们平台属性用的是占位思想，还没有输入平台属性值名称，就已经添加了这个平台属性值，因此要出去自身
      let isReapeat = row.spuSaleAttrValueList.some(
        (item) => item.saleAttrValueName === saleAttrValueName
      );
      if (isReapeat) {
        row.saleAttrValueName = "";
        row.isEdit = false;
        this.$message.error("输入的属性值不能重复");
        return;
      }

      let obj = { baseSaleAttrId, saleAttrValueName };
      row.spuSaleAttrValueList.push(obj); //把销售属性值添加到指定的销售属性值列表

      row.saleAttrValueName = "";
      row.isEdit = false;
    },
    //保存
    async save() {
      //1、获取参数数据
      let { spuImageList, category3Id, spuInfo } = this;
      //2、整理参数
      this.spuInfo.category3Id = category3Id;
        //整理图片列表
        spuInfo.spuImageList=spuImageList.map(item=>{
          return{
            imgName:item.name,
            imgUrl:item.imgUrl || item.response.data//(自己新上传的图片路径)
          }
        })

        //整理销售属性,去掉所有销售属性身上不需要的属性
        spuInfo.spuSaleAttrList.forEach(item=>{
          delete item.isEdit
          delete item.saleAttrValueName
        })
      //3、发请求
      try {
        //4、成功干啥
        const result = await this.$API.spu.addUpdate(spuInfo)
        if(result.code===200||result.code===20000){
          //提示
          this.$message.success('保存spu成功')
          //返回到列表页
          this.$emit('update:visible',false)
          //返回列表后重新获取spu分页列表数据
          this.$emit('successBack',spuInfo.id)
          //清空数据
          this.resetData()
        }else{
          //5、失败干啥
          this.$message.error('保存spu失败')
        }
      } catch (error) {
        console.log(error);
        // this.$message.error('请求保存spu失败')
      }
      
      
      
    },
    //重置data数据
    resetData(){
      this.dialogImageUrl = ""
      this.dialogVisible = false
      this.category3Id = ''
      this.spuInfo =  {
        category3Id: "",
        description: "",
        spuImageList: [],
        spuName: "",
        spuSaleAttrList: [],
        tmId: "",
      }
      this.spuImageList = []
      this.trademarkList = []
      this.saleAttrList = []
      this.unUsedSaleAttrIdName = ""
    },
  },
  computed: {
    unUsedSaleAttrList() {
      //根据所有的销售属性列表和spu自己的销售属性列表计算剩余的销售属性列表
      return this.BaseSaleAttrList.filter((item) => {
        //拿一项进来之后，我们要判断这一项的名字是不是和spu自己的销售属性列表当中所有项的名字都不一样，如果是就要
        return this.spuInfo.spuSaleAttrList.every((item1) => {
          return item1.saleAttrName !== item.name;
        });
      });
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>