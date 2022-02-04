<template>
  <div>
    <el-card>
      <!-- 三级联动组件 -->
      <CategorySelector
        @changeCategory="changeCategory"
        :isShowList="isShowList"
      ></CategorySelector>
    </el-card>
    <el-card style="margin-top: 20px">
      <!-- spu的列表页 -->
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddSpuForm"
          >添加Spu</el-button
        >
        <el-table :data="spuList" border style="width: 100%; margin-top: 20px">
          <el-table-column type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column
            prop="spuName"
            label="SPU名称"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="success"
                title="添加SKU"
                icon="el-icon-plus"
                @click="showAddSkuForm(row)"
                size="mini"
              ></HintButton>
              <HintButton
                type="warning"
                title="修改SKU"
                icon="el-icon-edit"
                @click="showUpdateSpuForm(row)"
                size="mini"
              ></HintButton>
              <HintButton
                type="info"
                title="查看SKU"
                icon="el-icon-info"
                size="mini"
                @click="showSkuList(row)"
              ></HintButton>
              <el-popconfirm
                :title="`你确定删除${row.spuName}吗？`"
                @onConfirm="deleteSpu(row)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  title="删除SPU"
                  icon="el-icon-delete"
                  size="mini"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          background
          style="text-align: center"
          layout="prev, pager, next, jumper,->,sizes,total"
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          :page-sizes="[2, 5, 7]"
          :pager-count="5"
          :current-page="page"
          :page-size="limit"
          :total="total"
        >
        </el-pagination>
      </div>
      <!-- spu的添加和修改页面 -->
      <SpuForm
        v-show="isShowSpuForm"
        :visible.sync="isShowSpuForm"
        ref="spu"
        @successBack="successBack"
      ></SpuForm>
      <!-- sku的添加页面 -->
      <SkuForm
        v-show="isShowSkuForm"
        ref="sku"
        :visible.sync="isShowSkuForm"
      ></SkuForm>
    </el-card>

    <el-dialog
      :title="`${spu.spuName}的sku列表`"
      :visible.sync="dialogVisible"
      :before-close="handlerClose"
      width="width"
    >
      <el-table v-loading="loading" :data="skuList" style="width: 100%">
        <el-table-column prop="skuName" label="名称" width="width">
        </el-table-column>
        <el-table-column prop="price" label="价格" width="width">
        </el-table-column>
        <el-table-column prop="weight" label="重量" width="width">
        </el-table-column>
        <el-table-column prop="prop" label="默认图片" width="width">
          <template slot-scope="{ row, $index }">
            <img
              :src="row.skuDefaultImg"
              alt=""
              style="width: 100px; height: 100px"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import SpuForm from "@/views/product/spu/components/SpuForm.vue";
import SkuForm from "@/views/product/spu/components/SkuForm.vue";
export default {
  name: "Spu",
  components: {
    SpuForm,
    SkuForm,
  },
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      isShowList: true, //这个数据是为了完成三级分类的可操作性传递过去的,和咱们这边的三个页面显示隐藏没关系

      page: 1,
      limit: 2,
      total: 0,

      //三个页面显示隐藏是通过下面这两个数据实现
      isShowSpuForm: false,
      isShowSkuForm: false,

      //sku的列表需要的数据
      dialogVisible: false,
      spu: {},
      skuList: [],
      loading: false,
    };
  },
  watch:{
    isShowSpuForm:{
      handler(newVal, oldVal){
        this.isShowList = !newVal;
      }
    },
    isShowSkuForm:{
      handler(newVal, oldVal){
        this.isShowList = !newVal;
      }
    },
  },
  methods: {
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.spuList = [];
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    //获取SPU的分页列表
    async getSpuList(pager = 1) {
      this.page = pager;
      let { page, limit, category3Id } = this;
      try {
        const result = await this.$API.spu.getList(page, limit, category3Id);

        if (result.code === 200 || result.code === 20000) {
          this.spuList = result.data.records;
          this.total = result.data.total;
        } else {
          this.$message.error("获取列表失败");
        }
      } catch (error) {
        this.$message.error("请求获取列表失败");
      }
    },
    //修改每页数量的回调
    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },
    //添加Spu
    showAddSpuForm() {
      this.isShowSpuForm = true;
      this.$refs.spu.getInitAddSpuFormData(this.category3Id);
    },

    //修改spu
    showUpdateSpuForm(row) {
      this.isShowSpuForm = true;
      this.$refs.spu.getInitUpdateSpuFormData(row, this.category3Id);
    },
    //添加sku
    showAddSkuForm(row) {
      this.isShowSkuForm = true;
      this.$refs.sku.getInitAddSkuFormData(row,this.category1Id,this.category2Id)
    },
    //保存成功的回调
    successBack(spuId) {
      if (spuId) {
        //修改成功回来的
        this.getSpuList(this.page);
      } else {
        //添加成功回来的
        this.getSpuList();
      }
    },
    async deleteSpu(row) {
      try {
        const result = await this.$API.spu.remove(row.id);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("删除spu成功");
          this.getSpuList(this.spuList.length > 1 ? this.page : this.page - 1);
        } else {
          this.$message.error("删除spu失败");
        }
      } catch (error) {
        this.$message.error("请求删除spu失败");
      }
    },
    //点击查看spu列表的sku列表
    async showSkuList(row){
      //弹出对话框
      this.dialogVisible = true;
      //保存spu,让对话框可以使用spu的名称
      this.spu = row;
      //发请求获取sku的列表
      this.loading = true;
      try {
        const result= await this.$API.sku.getListBySpuId(row.id);
        if(result.code===200||result.code===20000){
          this.skuList = result.data;
        }else{
          this.$message.error('获取sku列表失败')
        }
      } catch (error) {
        this.$message.error('请求获取sku列表失败')
      }
      
      this.loading = false;
    },
    //dialog关闭之前所做的处理,在这个函数当中需要手动关闭dialog
    handlerClose(done) {
      //关闭dialog的时候把该重置的数据全部重置
      this.skuList = [];
      this.dialogVisible = false;
      this.loading = false;
    },
  },
};
</script>

<style scoped>
</style>
