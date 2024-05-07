<template>
  <Flex
      horizontal
      justify="space-between"
  >
    <InputSearch
        v-model:value="value"
        placeholder="Поиск по ФИО"
        enter-button
        :style="{ maxWidth: '20%' }"
        @search="onSearch"
    />
    <div>
      <Button
          type="primary"
          style="margin-bottom: 8px"
          @click="showModal"
      >
        Добавить
      </Button>
      <Modal
          v-model:open="open"
          title="Добавить огранизцию"
          @ok="handleOk"
      >
        <Form
            ref="formRef"
            :model="formState"
            layout="vertical"
            name="form_in_modal"
        >
          <FormItem
              name="name"
              label="Название"
              :rules="[{ required: true, message: 'Пожалуйста укажите название организации!' }]"
          >
            <Input v-model:value="formState.name" />
          </FormItem>
          <FormItem
              name="number"
              label="Номер телефона"
              :rules="[{ required: true, message: 'Пожалуйста укажите номер телефона организации!' }]"
          >
            <Input v-model:value="formState.number" />
          </FormItem>
          <FormItem
              name="boss"
              label="ФИО Директора"
              :rules="[{ required: true, message: 'Пожалуйста укажите ФИО директора организации!' }]"
          >
            <Input v-model:value="formState.boss" />
          </FormItem>
        </Form>
        <template #footer>
          <Button
              key="back"
              @click="handleCancel"
          >
            Отмена
          </Button>
          <Button
              key="submit"
              type="primary"
              :loading="loading"
              @click="handleOk"
          >
            ОК
          </Button>
        </template>
      </Modal>
    </div>
  </Flex>
  <Table
      :columns="columns"
      :data-source="dataSource?.data?.results"
      :row-key="record => record.login.uuid"
      :pagination="pagination"
      :loading="loading"
      :scroll="{ y: 450 }"
      @resizeColumn="handleResizeColumn"
      @change="handleTableChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'organization'">
        <span>
          ООО "{{ record.name.first }} {{ record.name.last }}"
        </span>
      </template>
      <template v-else-if="column.key === 'name'">
        <span>
          {{ record.name.first }} {{ record.name.last }}
        </span>
      </template>
      <template v-else-if="column.key === 'action'">
        <Popconfirm
            title="Вы действительно хотите удалить организацию?"
            @confirm="onDelete(record.login.uuid)"
        >
          <CloseOutlined />
        </Popconfirm>
      </template>
    </template>
  </Table>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import { CloseOutlined } from '@ant-design/icons-vue';
import { Table, Button, Popconfirm, InputSearch, Flex, Modal, Form, Input, FormItem } from 'ant-design-vue';
import type { FormInstance, TableColumnsType, TableProps } from 'ant-design-vue';
import { usePagination } from 'vue-request';
import axios from 'axios';

interface Values {
  number: string;
  name: string;
  boss: string;
}
const formRef = ref<FormInstance>();

const formState = reactive<Values>({
  number: '',
  name: '',
  boss: '',
});

type APIParams = {
  results: number;
  page?: number;
  sortField?: string;
  sortOrder?: number;
  [key: string]: any;
};

type APIResult = {
  results: {
    name: string;
    phone: string;
  }[];
};
const value = ref<string>('');

const onSearch = (searchValue: string) => {
  // Тут я отправляю get с параметром поиска (т.е. фильтр) "типо"
  const test = dataSource.value?.data?.results.filter(item => {
    const name = item.name.first + ' '+ item.name.last
    return name.toLowerCase().includes(searchValue.toLowerCase());
  });

  // Тут я обновляю данные "типо"
  dataSource.value = { data: { results: test } };
};
const queryData = (params: APIParams) => {
  return axios.get<APIResult>('https://randomuser.me/api?noinfo', { params });
};



const {
  data: dataSource,
  run,
  loading,
  current,
  pageSize,
} = usePagination(queryData, {
  formatResult: res => res.data.results,
  pagination: {
    currentKey: 'page',
    pageSizeKey: 'results',
  },
});
const open = ref<boolean>(false);
const showModal = () => {
  open.value = true;
};

const handleOk = () => {
  formRef.value
      .validateFields()
      .then(values => {
        formRef.value.resetFields();
        const newItem = {
          name: formState.name,
          phone: formState.number,
          login: { uuid: Date.now() }
        };
        console.log('Будет отправле запрос на добавление записи: ', newItem);
        console.log('Запросил обновление информация')
      })
      .catch(info => {
        console.log('Не прошла валидацию:', info);
      });
};

const handleCancel = () => {
  open.value = false;
};
const onDelete = (key: string) => {
  console.log('Будет удаление записи с ключом: ', key);
  console.log('Запросил обновление информация')
};

const pagination = computed(() => ({
  total: 100,
  current: current.value,
  pageSize: pageSize.value,
}));

const handleTableChange: TableProps['onChange'] = (
    pag: { pageSize: number; current: number },
    filters: any,
    sorter: any,
) => {
  run({
    results: pag.pageSize,
    page: pag?.current,
    sortField: sorter.field,
    sortOrder: sorter.order,
    ...filters,
  });
};

const columns = ref<TableColumnsType>([
  {
    dataIndex: 'organization',
    key: 'organization',
    title: 'Название',
    resizable: true,
    sorter: true,
    width: 200,
  },
  {
    title: 'ФИО Директора',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    resizable: true,
    width: 200,
    minWidth: 200,
    maxWidth: 400,
  },
  {
    title: 'Номер телефона',
    dataIndex: 'phone',
    key: 'phone',
    resizable: true,
    width: 200,
    minWidth: 200,
    maxWidth: 400,
  },
  {
    title: '',
    key: 'action',
    resizable: true,
    width: 200,
    minWidth: 200,
    maxWidth: 400,
  },
]);
const handleResizeColumn = (w, col) => {
  col.width = w;
}
</script>

