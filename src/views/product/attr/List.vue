<template>
  <div>
    <el-card>
      <!-- 三级联动组件 -->
      <CategorySelector @changeCategory="changeCategory" :isShowList="isShowList"></CategorySelector>
    </el-card>
    <el-card style="margin-top: 20px">
      <div v-show="isShowList">
        <!-- 属性列表页 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddDiv"
          >添加属性</el-button
        >
        <!-- 属性的列表 -->
        <el-table :data="attrList" border style="width: 100%; margin-top: 20px">
          <el-table-column type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150">
          </el-table-column>
          <el-table-column label="属性值列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
              >
                {{ attrValue.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="warning"
                icon="el-icon-edit"
                title="修改"
                size="mini"
                @click="showUpdateDiv(row)"
              ></HintButton>
             <el-popconfirm :title="`你确定要删除${row.attrName}吗？`" @onConfirm="deleteAttr(row)">
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除"
                  size="mini"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 这个是添加或者修改的界面 -->
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attrForm">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrForm.attrName"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="attrForm.attrName === ''"
          >添加属性值</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>

        <el-table
          :data="attrForm.attrValueList"
          border
          style="width: 100%; margin: 20px 0"
        >
          <el-table-column type="index" align="center" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                :ref="$index"
                v-if="row.isEdit"
                size="mini"
                placeholder="请输入属性值名称"
                v-model="row.valueName"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display: block; width: 100%"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-popconfirm :title="`你确定要删除${row.valueName}这个属性值吗？`"
                @onConfirm="attrForm.attrValueList.splice($index, 1)">
              <HintButton
              slot="reference"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除"
              ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" @click="save" :disabled="attrForm.attrValueList.length===0">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",

      attrList: [],
      isShowList: true,

      attrForm: {
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3,
      },
    };
  },
  methods: {
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        //子组件重新选择1级，清空父组件当中的23级和属性列表
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        //子组件重新选择2级，清空父组件当中的3级和属性列表
        this.category3Id = "";
        this.attrList = [];
      } else if (level === 3) {
        this.category3Id = categoryId;
        //发请求获取属性列表
        this.getAttrList();
      }
    },
    //请求获取属性的列表数据
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      try {
        const result = await this.$API.attr.getList(
          category1Id,
          category2Id,
          category3Id
        );
        if (result.code === 200 || result.code === 20000) {
          this.attrList = result.data;
        } else {
          this.$message.error("获取属性列表失败");
        }
      } catch (error) {
        this.$message.error("请求获取属性列表失败");
      }
    },
    //点击添加属性按钮显示添加属性界面
    showAddDiv() {
      this.isShowList = false;
      this.attrForm = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id, //收集的属性内部这个id是3级id
        categoryLevel: 3,
      };
    },
    //点击添加属性按钮
    addAttrValue() {
      this.attrForm.attrValueList.push({
        attrId: this.attrForm.id,
        valueName: "",
        isEdit: true, //这个属性值标识着这个属性值的模式是编辑模式，每个属性值都有这个属性要么是true要么是false
      });

      //让新添加的这个属性值input自动获取焦点
      //新添加的永远是最后一个
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },
    //点击修改按钮修改属性
    showUpdateDiv(row) {
      this.isShowList = false;
      this.attrForm = cloneDeep(row);

      // this.$set 或者 Vue.set 为响应式对象添加新属性才是响应式属性
      this.attrForm.attrValueList.forEach((item) =>
        this.$set(item, "isEdit", false)
      );
    },
    //添加模式标识数据
    //每个属性值无论新添加的还是老的都有自己的编辑模式（input）和查看模式（span）
    //对于新添加的属性值，一上来显示的就是input（编辑模式）老的属性值一上来就是span（查看模式）
    //说白了就是给每个属性值添加标识数据

    //点击span从查看模式变成编辑模式
    toEdit(row, index) {
      row.isEdit = true;
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    toLook(row) {
      //1.失去焦点的时候需要判定数据中是否有属性值名称，如果没有值或者值不合法，不会变为span
      if (row.valueName.trim() === "") {
        row.valueName = "";
        return;
      }

      //2.在除去自身以外，如判断输入的属性值是否存在，如果重复就不能变为span
      let isRepeat = this.attrForm.attrValueList.some((item) => {
        if (item !== row) {
          return item.valueName === row.valueName;
        }
      });

      if (isRepeat) {
        this.$message.error("输入的属性值名称不能重复");
        row.valueName = "";
        return;
      }

      row.isEdit = false;
    },
    //保存数据
    async save(){
      //获取参数
      let attr=this.attrForm
      //整理参数
        //1.属性值名称如果为空串，从属性值列表当中去除
        //2.属性值当中去除isEdit属性
        attr.attrValueList=attr.attrValueList.filter(item=>{
          if(item.valueName.trim()!==""){
            delete item.isEdit
            return true
          }
        })
        //3.属性值列表如果没有属性值，不发请求
        if(!attr.attrValueList.length){
          return
        }
      //发请求
      try {
        //1.成功干啥
        const result=await this.$API.attr.addOrUpdate(attr)
        if (result.code===200||result.code===20000){
          this.$message.success("保存属性成功");
          //保存成功后返回属性列表页
          this.isShowList=true
          //重新获取新的列表数据
          this.getAttrList()
        }else{
           //2.失败干啥
          this.$message.error("保存属性失败");
        }
      } catch (error) {
        this.$message.error("请求保存属性失败");
      }
        
        
    },
    // 删除属性的逻辑
    async deleteAttr(row){
      try {
        const result=await this.$API.attr.remove(row.id)
        if(result.code===200||result.code===20000){
          this.$message.success('删除属性成功')
          this.getAttrList()
        }else{
          this.$message.error('删除属性失败')
        }
      } catch (error) {
        this.$message.error('请求删除属性失败')
      }
    }
  },
};
</script>

<style scoped>
</style>
