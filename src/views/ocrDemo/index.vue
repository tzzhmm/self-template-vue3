<!--
 * @Author: 田凯龙 tzzhmmcc@163.com
 * @LastEditors: tiankailong tzzhmmcc@163.com
-->
<template>
    <div class="w-100% text-center mx-auto p-10">
        <a-upload
            :custom-request="handleUpload"
            :file-list="fileList"
            multiple
            @change="handleChange"
            accept=".pdf,.png,.jpg,.jpeg"
        >
            <template #upload-button>
                <a-button type="primary">点击上传文件</a-button>
            </template>
        </a-upload>
        <div class="self-table">
            <a-table
                :columns="tableCol"
                :data="tableData" 
                :bordered="{wrapper: true, cell: true}"
            />
        </div> 
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { UploadFileToBase64 } from '@/api/selfDemo/index.js';

const fileList = ref([]);
const tableCol = ref([
    {
        title: '序号',
        dataIndex: 'dataIndex',
        width: 50,
        fixed: 'left',
    },
    {
        title: '项目名称',
        dataIndex: 'ProjectName',
        width: 160,
        fixed: 'left',
    },
    {
        title: '基桩名称',
        dataIndex: 'JizhuangName',
        width: 100,
        fixed: 'left',
    },
    {
        title: '检测深度(m)',
        dataIndex: 'TestDepth',
        width: 120,
        fixed: 'left',
    },
    {
        title: '设计桩径',
        dataIndex: 'PileDiameter',
        width: 100,
        fixed: 'left',
    },
    {
        title: '参数1',
        children: [
            {
                title: '名称',
                dataIndex: 'Parm1',
                width: 140,
            },
            {
                title: '声速平均值',
                dataIndex: 'ShengsuAvg1',
                width: 120,
            },
            {
                title: '声速标准差',
                dataIndex: 'ShengsuStandardDeviation1',
                width: 120,
            },
            {
                title: '声速临界值',
                dataIndex: 'ShengsuCritical1',
                width: 120,
            },
            {
                title: '声速离差系数',
                dataIndex: 'ShengsuCV1',
                width: 120,
            },
        ],
    },
    {
        title: '参数2',
        children: [
            {
                title: '名称',
                dataIndex: 'Parm2',
                width: 140,
            },
            {
                title: '声速平均值',
                dataIndex: 'ShengsuAvg2',
                width: 120,
            },
            {
                title: '声速标准差',
                dataIndex: 'ShengsuStandardDeviation2',
                width: 120,
            },
            {
                title: '声速临界值',
                dataIndex: 'ShengsuCritical2',
                width: 120,
            },
            {
                title: '声速离差系数',
                dataIndex: 'ShengsuCV2',
                width: 120,
            },
        ],
    },
    {
        title: '参数3',
        children: [
            {
                title: '名称',
                dataIndex: 'Parm3',
                width: 140,
            },
            {
                title: '声速平均值',
                dataIndex: 'ShengsuAvg3',
                width: 120,
            },
            {
                title: '声速标准差',
                dataIndex: 'ShengsuStandardDeviation3',
                width: 120,
            },
            {
                title: '声速临界值',
                dataIndex: 'ShengsuCritical3',
                width: 120,
            },
            {
                title: '声速离差系数',
                dataIndex: 'ShengsuCV3',
                width: 120,
            },
        ],
    },
    {
        title: '参数4',
        children: [
            {
                title: '名称',
                dataIndex: 'Parm4',
                width: 140,
            },
            {
                title: '声速平均值',
                dataIndex: 'ShengsuAvg4',
                width: 120,
            },
            {
                title: '声速标准差',
                dataIndex: 'ShengsuStandardDeviation4',
                width: 120,
            },
            {
                title: '声速临界值',
                dataIndex: 'ShengsuCritical4',
                width: 120,
            },
            {
                title: '声速离差系数',
                dataIndex: 'ShengsuCV4',
                width: 120,
            },
        ],
    },
    {
        title: '参数5',
        children: [
            {
                title: '名称',
                dataIndex: 'Parm5',
                width: 140,
            },
            {
                title: '声速平均值',
                dataIndex: 'ShengsuAvg5',
                width: 120,
            },
            {
                title: '声速标准差',
                dataIndex: 'ShengsuStandardDeviation5',
                width: 120,
            },
            {
                title: '声速临界值',
                dataIndex: 'ShengsuCritical5',
                width: 120,
            },
            {
                title: '声速离差系数',
                dataIndex: 'ShengsuCV5',
                width: 120,
            },
        ],
    },
    {
        title: '参数6',
        children: [
            {
                title: '名称',
                dataIndex: 'Parm6',
                width: 140,
            },
            {
                title: '声速平均值',
                dataIndex: 'ShengsuAvg6',
                width: 120,
            },
            {
                title: '声速标准差',
                dataIndex: 'ShengsuStandardDeviation6',
                width: 120,
            },
            {
                title: '声速临界值',
                dataIndex: 'ShengsuCritical6',
                width: 120,
            },
            {
                title: '声速离差系数',
                dataIndex: 'ShengsuCV6',
                width: 120,
            },
        ],
    },
]);
const tableData = ref([]);

const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
const allowedExtensions = /\.(pdf|png|jpg|jpeg)$/i;

// 暂存本批次文件，等所有文件收集完后批量发送
const pendingFiles = ref([]);
let batchTimer = null;

const sendBatch = async () => {
    if (pendingFiles.value.length === 0) return;
    const files = [...pendingFiles.value];
    pendingFiles.value = [];

    // 校验本批次全部文件，有一个不合法则全部取消
    const invalidFiles = files.filter(
        ({ file }) => !allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)
    );
    if (invalidFiles.length > 0) {
        Message.error(
            `仅支持上传 .pdf、.png、.jpg、.jpeg 格式的文件，本次上传已全部取消：${invalidFiles.map(({ file }) => file.name).join('、')}`
        );
        // 触发 onError 让组件把这批文件标记为失败，再清空列表
        files.forEach(({ onError }) => onError());
        fileList.value = [];
        return;
    }

    const formData = new FormData();
    files.forEach(({ file }) => formData.append('files', file));

    console.log(`批量上传 ${files.length} 个文件`, files.map(({ file }) => file.name));

    try {
        const res = await UploadFileToBase64(formData);
        console.log('------res----------', res);
        if(res && res.StatusCode == 1) {
            Message.success(`成功上传 ${files.length} 个文件！`);
            res.Data.forEach((item, index) => {
                item.dataIndex = index+1;
            })
            tableData.value = res.Data || [];
            files.forEach(({ onSuccess }) => onSuccess());
        }else {
            Message.error('上传失败，请重试！');
            files.forEach(({ onError }) => onError(err));
        }
    } catch (err) {
        Message.error('上传失败，请重试！');
        files.forEach(({ onError }) => onError(err));
    }
};

// custom-request：每个文件触发一次，统一收集后 debounce 批量发送
const handleUpload = (option) => {
    const { fileItem, onSuccess, onError, onProgress } = option;
    pendingFiles.value.push({ file: fileItem.file, onSuccess, onError, onProgress });

    // 清除上一次定时器，等同批次最后一个文件入队后再发送
    clearTimeout(batchTimer);
    batchTimer = setTimeout(sendBatch, 100);
};

// 文件列表变化回调
const handleChange = (fileListNew) => {
    fileList.value = fileListNew;
};

onMounted(() => {
    tableData.value = [
        {
            "ID": "2032468275731894272",
            "ProjectName": "码头互通D匝道桥1",
            "JizhuangName": "4-1",
            "TestDepth": "44.60m",
            "PileDiameter": "1600mm",
            "Parm1": "A-B:930mm",
            "ShengsuAvg1": 4.298,
            "ShengsuStandardDeviation1": 0.135,
            "ShengsuCritical1": 3.914,
            "ShengsuCV1": "3.14%",
            "Parm2": "A-C:980mm",
            "ShengsuAvg2": 4.287,
            "ShengsuStandardDeviation2": 0.174,
            "ShengsuCritical2": 3.793,
            "ShengsuCV2": "4.05%",
            "Parm3": "B-C:1010mm",
            "ShengsuAvg3": 4.03,
            "ShengsuStandardDeviation3": 0.099,
            "ShengsuCritical3": 3.75,
            "ShengsuCV3": "2.44%",
            "Parm4": null,
            "ShengsuAvg4": 0,
            "ShengsuStandardDeviation4": 0,
            "ShengsuCritical4": 0,
            "ShengsuCV4": null,
            "Parm5": null,
            "ShengsuAvg5": 0,
            "ShengsuStandardDeviation5": 0,
            "ShengsuCritical5": 0,
            "ShengsuCV5": null,
            "Parm6": null,
            "ShengsuAvg6": 0,
            "ShengsuStandardDeviation6": 0,
            "ShengsuCritical6": 0,
            "ShengsuCV6": null,
            "AddTime": "2026-03-13 22:46:13.025",
            "Status": 0
        },
        {
            "ID": "2032468275903860736",
            "ProjectName": "码头互通D匝道桥2",
            "JizhuangName": "4-1",
            "TestDepth": "44.60m",
            "PileDiameter": "1600mm",
            "Parm1": "A-B:930mm",
            "ShengsuAvg1": 4.298,
            "ShengsuStandardDeviation1": 0.135,
            "ShengsuCritical1": 3.914,
            "ShengsuCV1": "3.14%",
            "Parm2": "A-C:980mm",
            "ShengsuAvg2": 4.287,
            "ShengsuStandardDeviation2": 0.174,
            "ShengsuCritical2": 3.793,
            "ShengsuCV2": "4.05%",
            "Parm3": "B-C:1010mm",
            "ShengsuAvg3": 4.03,
            "ShengsuStandardDeviation3": 0.099,
            "ShengsuCritical3": 3.75,
            "ShengsuCV3": "2.44%",
            "Parm4": null,
            "ShengsuAvg4": 0,
            "ShengsuStandardDeviation4": 0,
            "ShengsuCritical4": 0,
            "ShengsuCV4": null,
            "Parm5": null,
            "ShengsuAvg5": 0,
            "ShengsuStandardDeviation5": 0,
            "ShengsuCritical5": 0,
            "ShengsuCV5": null,
            "Parm6": null,
            "ShengsuAvg6": 0,
            "ShengsuStandardDeviation6": 0,
            "ShengsuCritical6": 0,
            "ShengsuCV6": null,
            "AddTime": "2026-03-13 22:46:13.067",
            "Status": 0
        }
    ]
    tableData.value.forEach((item, index) => {
        item.dataIndex = index+1;
    })
})

</script>
<style scoped>
.self-table {
    margin-top: 20px;
}
</style>
