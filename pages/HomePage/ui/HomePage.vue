<template>
  <Flex
      horizontal
      justify="space-between"
  >
    <InputSearch
        v-model:value="searchQuery"
        placeholder="Поиск по ФИО"
        enter-button
        :style="{ maxWidth: '20%' }"
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
          title="Добавить организацию"
          @ok="handleOk"
      >
        <Form
            ref="formRef"
            :model="formState"
            layout="vertical"
            name="form_in_modal"
        >
          <FormItem
              name="organizationName"
              label="Название"
              :rules="[{ required: true, message: 'Пожалуйста, укажите название организации!' }]"
          >
            <Input v-model:value="formState.organizationName" />
          </FormItem>
          <FormItem
              name="phoneNumber"
              label="Номер телефона"
              :rules="[{ required: true, message: 'Пожалуйста, укажите номер телефона организации!' }]"
          >
            <Input v-model:value="formState.phoneNumber" />
          </FormItem>
          <FormItem
              name="bossName"
              label="ФИО Директора"
              :rules="[{ required: true, message: 'Пожалуйста, укажите ФИО директора организации!' }]"
          >
            <Input v-model:value="formState.bossName" />
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
      :data-source="searchedData"
      :row-key="record => record.id"
      :pagination="pagination"
      :loading="loading"
      :scroll="{ y: 450 }"
      @resizeColumn="handleResizeColumn"
      @change="handleTableChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'organization'">
        <span>
          ООО "{{ record.login.username }}"
        </span>
      </template>
      <template v-else-if="column.key === 'boss'">
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

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { CloseOutlined } from '@ant-design/icons-vue';
import { Table, Button, Popconfirm, InputSearch, Flex, Modal, Form, Input, FormItem } from 'ant-design-vue';
import { useUsersModel } from '~/entities/user/model';
import {debounce} from "~/entities/user/lib";

const open = ref<boolean>(false);
const formRef = ref();

interface FormState {
  bossName: string;
  phoneNumber: string;
  organizationName: string;
}

const formState = reactive<FormState>({
  organizationName: '',
  bossName: '',
  phoneNumber: '',
});

const searchQuery = ref<string>('');

const organizationStore = useUsersModel();
const showModal = () => {
  open.value = true;
};
const handleCancel = () => {
  open.value = false;
};
const handleOk = () => {
  formRef.value
      .validateFields()
      .then(values => {
        console.log(formState)
        const newItem = {
          name: {
            first: '',
            last: formState.bossName
          },
          login: {
            username: formState.organizationName,
            uuid: Date.now()
          },
          phone: formState.phoneNumber,
        };
        organizationStore.addOrganization(newItem);
        open.value = false;
        formRef.value.resetFields();
      })
      .catch(info => {
        console.log('Validation failed:', info);
      });
};
const onDelete = (id: string) => {
  organizationStore.deleteOrganization(id);
};

const handleTableChange = (pag: { pageSize: number; current: number }) => {
  const paramsPage = {
    page: pag.current,
    pageSize: pag.pageSize,
  }
  organizationStore.changePagination(paramsPage);
};
const handleResizeColumn = (w, col) => {
  col.width = w;
};
const pagination = computed(() => ({
  pageSize: organizationStore.pageSize,
  current: organizationStore.current,
  total: organizationStore.SearchResults.length > 0 ? organizationStore.SearchResults.length : organizationStore.organizations.length,
}));
const loading = computed(() => (organizationStore.loading));
const columns = ([
  {
    dataIndex: 'organization',
    key: 'organization',
    title: 'Название',
    resizable: true,
    sorter: {
      compare: (a, b) => {
        const nameA = a.login.username;
        const nameB = b.login.username;

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      },
      multiple: 2,
    },
    width: 200,
  },
  {
    title: 'ФИО Директора',
    dataIndex: 'boss',
    key: 'boss',
    sorter: {
      compare: (a, b) => {
        const nameA = a.name.first + ' ' + a.name.last;
        const nameB = b.name.first + ' ' + b.name.last;

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      },
      multiple: 1,
    },
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
const searchOrganizationDebounced = debounce(organizationStore.searchOrganization, 700);
const searchedData = computed(() => {
  if (searchQuery.value.trim() !== '') {
    searchOrganizationDebounced(searchQuery.value);
    return organizationStore.SearchResults.length > 0 ? organizationStore.SearchResults : organizationStore.organizations;
  } else {
    return organizationStore.organizations;
  }
});

onMounted(() => {
  organizationStore.queryData({ results: 100 });
});


</script>
