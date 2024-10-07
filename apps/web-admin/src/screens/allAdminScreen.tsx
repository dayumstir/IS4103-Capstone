import { useState } from "react";
import {
  Avatar,
  Form,
  Button,
  Table,
  Card,
  message,
  Modal,
  Empty,
  Select,
  FormInstance,
  Tag,
  Typography,
  Input,
  Pagination,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  useViewAllAdminQuery,
  useUpdateStatusMutation,
} from "../redux/services/adminService";
import { IAdmin } from "../interfaces/adminInterface";
import { Buffer } from "buffer";
import { Link } from "react-router-dom";
import { Descriptions } from "antd";
import { EyeOutlined } from "@ant-design/icons";

export default function AllAdminScreen() {
  const { Title } = Typography;
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<IAdmin | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdminType, setSelectedAdminType] = useState<
    string | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: admins, isLoading } = useViewAllAdminQuery();
  const [updateAdminStatus] = useUpdateStatusMutation();

  const handleEditAdmin = (admin: IAdmin) => {
    setEditingAdmin(admin);
    editForm.setFieldsValue({
      ...admin,
      admin: admin.name,
      email: admin.email,
      contact_number: admin.contact_number,
    });
    setIsModalOpen(true);
  };

  const handleUpdateAdmin = async (values: Omit<IAdmin, "admin_id">) => {
    if (!editingAdmin) {
      message.error("No admin selected for editing");
      return;
    }

    try {
      await updateAdminStatus({
        updatedAdminId: editingAdmin.admin_id,
        admin_type: values.admin_type1.toString(),
      }).unwrap();
      console.log(values.admin_type1);
      setIsModalOpen(false);
      setEditingAdmin(null);
      message.success(`Admin "${editingAdmin.name}" has been updated.`);
    } catch (error) {
      console.error("Error updating admin:", error);
      message.error("Failed to update admin");
    }
  };

  const filteredAdmins =
    admins?.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAdminType = selectedAdminType
        ? selectedAdminType === "" || admin.admin_type === selectedAdminType
        : true; // Adjusted line
      return matchesSearch && matchesAdminType;
    }) || [];

  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleAdminTypeChange = (value) => setSelectedAdminType(value);
  const handlePageChange = (page) => setCurrentPage(page);

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Admin Status",
      dataIndex: "admin_type",
      key: "admin_type",
      render: (text: string) => (
        <Tag
          color={
            text === "NORMAL"
              ? "green"
              : text === "UNVERIFIED"
                ? "orange"
                : "volcano"
          }
        >
          {text === "NORMAL" ? "ACTIVE" : text}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, admin: IAdmin) => (
        <Button
          className="mr-2"
          icon={<EyeOutlined />}
          onClick={() => handleEditAdmin(admin)}
        >
          View
        </Button>
      ),
    },
  ];

  const renderForm = (formInstance: FormInstance) => (
    <div className="rounded-lg bg-white p-4 shadow">
      {editingAdmin && (
        <div className="mb-6">
          <Title level={4}>Profile Picture</Title>
          {editingAdmin.profile_picture ? (
            <img
              src={`data:image/png;base64,${Buffer.from(editingAdmin.profile_picture).toString("base64")}`}
              alt="avatar"
              className="h-36 w-36 object-cover"
            />
          ) : (
            <Avatar
              className="h-36 w-36 object-cover"
              icon={<UserOutlined />}
            />
          )}
          <Descriptions
            title="Admin Details"
            bordered
            size="small"
            column={1}
            className="admin-details"
          >
            <Descriptions.Item label="Admin Name">
              {editingAdmin.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {editingAdmin.email}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {editingAdmin.username}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Number">
              {editingAdmin.contact_number}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {editingAdmin.address}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {new Date(editingAdmin.date_of_birth).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
      <Form
        form={formInstance}
        name="admin"
        onFinish={handleUpdateAdmin}
        layout="vertical"
      >
        <Form.Item
          name="admin_type1"
          label="Status"
          rules={[{ required: true, message: "Please select the status!" }]}
        >
          <Select>
            <Select.Option value="DEACTIVATED">DEACTIVATED</Select.Option>
            <Select.Option value="ACTIVATE">ACTIVATE</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update Status
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div className="w-full px-8 py-4">
      <Card
        className="mb-8 border border-gray-300"
        title="View and Manage Admins"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Input
              placeholder="Search by name, username or email"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ marginRight: 16 }}
            />
            <Select
              placeholder="Filter by Admin Type"
              onChange={handleAdminTypeChange}
              allowClear
              style={{ width: 200 }}
            >
              <Select.Option value="">All</Select.Option>
              <Select.Option value="NORMAL">ACTIVE</Select.Option>
              <Select.Option value="DEACTIVATED">DEACTIVATED</Select.Option>
              <Select.Option value="UNVERIFIED">UNVERIFIED</Select.Option>
            </Select>
          </div>
          <Link to="/admins/add">
            <Button type="primary">Add Admin</Button>
          </Link>
        </div>
        <Table
          dataSource={paginatedAdmins}
          columns={tableColumns}
          rowKey="admin_id"
          pagination={false}
          loading={isLoading}
          locale={{
            emptyText: <Empty description="No admin found" />,
          }}
        />
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredAdmins.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          style={{ marginTop: 16, textAlign: "right" }}
        />
      </Card>

      <Modal
        title="Admin Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        {renderForm(editForm)}
      </Modal>
    </div>
  );
}
