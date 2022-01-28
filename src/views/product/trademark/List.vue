<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >

    <!-- table组件在展示动态数据的时候，依赖的是data属性
    data属性值，必须是一个数组，表格组件才能展示
    这个data会默认给每个列传一份，每个列的内部实在展示我们传递进去的数据
    列的内部展示数据的时候，如果需要额外的结构，那么需要父组件决定（作用域插槽)
     -->

    <!-- 每个列有一个prop属性，专门用于指定显示这个数据的时候显示哪个属性 -->
    <el-table :data="trademarkList" border style="width: 100%; margin: 20px 0">
      <el-table-column
        type="index"
        align="center"
        prop="prop"
        label="序号"
        width="80"
        ref="tmForm"
      >
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column label="品牌LOGO" width="width">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="height: 60px; width: 80px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="shouUpdateDialog(row)"
            >修改</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini" 
          @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- @size-change="handleSizeChange"
      @current-change="handleCurrentChange" -->
    <el-pagination
      style="text-align: center"
      layout="prev, pager, next, jumper,->,sizes,total"
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      :page-sizes="[3, 5, 10]"
      :pager-count="5"
      :current-page="page"
      :page-size="limit"
      :total="total"
    >
    </el-pagination>

    <!-- 添加或者修改的弹出对话框（页面） dialogFormVisible:打开Dialog的开关 -->
    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form style="width: 80%" :rules="rules" :model="tmForm" ref="tmForm">
        <!-- 名称 -->
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <!-- 上传 -->
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg文件，且不超过2M
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Trademark",
  data() {
    var validateTmName=(rule,value,callback)=>{
      if(value.length<2 || value.length>10){
        callback(new Error("tmName长度必须是2-20之间"));
      }else {
        callback()
      }
    };

    return {
      page: 1,
      limit: 3,
      total: 0,
      trademarkList: [],

      dialogFormVisible: false,
      // imageUrl: "",

      //下面这个对象就是添加品牌所要手机的对象
      tmForm: {
        tmName: "", //收集我们的品牌名称
        logoUrl: "", //收集我们的品牌logo图片路径
      },
      //rules对象和收集数据的对象tmForm内部属性名是一样的
      //每个属性的数据是一个数组，代表着这个字段的校验规则数组
      //数组内部是一个一个对象，每个对象 代表着一个校验规则
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          {validator:validateTmName,trigger:'change'}
        ],
        logoUrl: [
          //因为我们是上传的组件，不是表单元素，所以我们没办法用blur或者change校验
          //整体校验的时候，会触发
          { required: true, message: "请上传图片"},
        ],
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      try {
        const result = await this.$API.trademark.getPageList(
          this.page,
          this.limit
        );
        if (result.code === 200 || result.code === 20000) {
          this.trademarkList = result.data.records;
          this.total = result.data.total;
        } else {
          alert("获取品牌列表失败");
        }
      } catch (error) {
        alert("请求获取品牌列表失败");
      }
    },
    //这个是切换每页数量的回调,这个回调不能省略
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },
    //文件上传成功时的钩子
    handleAvatarSuccess(res, file) {
      // this.imageUrl = URL.createObjectURL(file.raw);  它最终收集的是本地的路径,是错的
      this.tmForm.logoUrl = res.data || file.response.data; //或者是file.response.data
    },
    //上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    //点击添加按钮的事件
    showAddDialog() {
      this.dialogFormVisible = true;
      //把tmForm内的数据清空 如果不清空，添加数据点取消，再点添加，数据还存在
      this.tmForm = {
        tmName: "", //收集我们的品牌名称
        logoUrl: "", //收集我们的品牌logo图片路径
      };
    },
    //点击修改按钮的事件
    shouUpdateDialog(row) {
      this.dialogFormVisible = true;
      //把要修改的品牌对象地址复制给tmForm，那么tmForm当中就自动有了tmName和logoUrl，还多了id
      this.tmForm = { ...row };
    },
    //点击确定按钮的事件,添加或修改品牌
     addOrUpdateTrademark() {
      this.$refs.tmForm.validate( async(valid) => {
      if (valid) {
            //获取请求参数
        let trademark = this.tmForm;
        //整理参数,需要整理再整理
        //发请求
        try {
        //成功干啥
        await this.$API.trademark.addOrUpdate(trademark);
        
          //1、提示
          this.$message.success(trademark.id ? "修改品牌成功" : "添加品牌成功");
          //2、关闭dialog,回到列表页
          this.dialogFormVisible = false;
          //3、重新发请求获取列表页数据
          // 如果添加成功，那么重新请求的是第一页数据，添加新的数据是在最后一页
          // 如果是修改成功，那么我们得重新请求这条数据所在的页
          this.getTrademarkList(trademark.id ? this.page : 1);

          } catch (error) {
            alert(trademark.id ? "请求修改品牌失败" : "请求添加品牌失败");
          }
      } else {
          console.log('error submit!!');
          return false;
      }
      });
    },
     // 点击删除实现删除逻辑
    deleteTrademark(row) {
      this.$confirm(`你确定删除${row.tmName}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          try {
            const result = await this.$API.trademark.remove(row.id)
            if(result.code === 200 || result.code === 20000){
              this.$message.success('删除品牌成功')
              this.getTrademarkList(this.trademarkList.length > 1?this.page:this.page - 1)
            }else{
              this.$message.error('删除品牌失败')
            }
          } catch (error) {
            this.$message.error('请求删除品牌失败')
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  },
};


</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
