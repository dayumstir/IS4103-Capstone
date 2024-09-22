import {
  Avatar,
  Button,
  Card,
  Form,
  FormProps,
  GetProp,
  Input,
  message,
  Modal,
  Upload,
  UploadProps,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  useEditProfileMutation,
  useGetProfileQuery,
} from "../redux/services/profile";
import { Buffer } from "buffer";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { RegisterFormValues } from "../interfaces/registerFormInterface";
import { EditProfileProps } from "../interfaces/editProfileInterface";
import {
  ResetPasswordProps,
  ResetPasswordValues,
} from "../interfaces/resetPasswordInterface";
import { useResetPasswordMutation } from "../redux/services/auth";

const ProfileScreen: React.FC = () => {
  const merchantId = localStorage.getItem("merchantId");
  if (!merchantId) {
    return;
  }

  const { data: profile, refetch } = useGetProfileQuery(merchantId);

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);

  const [name, setName] = useState("");
  const [profilePictureDisplay, setProfilePictureDisplay] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      if (profile.profile_picture) {
        const profilePictureBase64 = `data:image/png;base64,${Buffer.from(profile.profile_picture).toString("base64")}`;
        setProfilePictureDisplay(profilePictureBase64);
      }
      setEmail(profile.email);
      setContactNumber(profile.contact_number);
      setAddress(profile.address);
    }
  });

  return (
    <div>
      <div className="flex items-center">
        {profilePictureDisplay ? (
          <img
            src={profilePictureDisplay}
            alt="avatar1"
            className="h-36 w-36 object-cover"
          />
        ) : (
          <Avatar className="h-36 w-36 object-cover" icon={<UserOutlined />} />
        )}
        <div className="ml-4">
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
        <div className="ml-auto flex space-x-2">
          <Button
            type="primary"
            onClick={() => setIsResetPasswordModalOpen(true)}
          >
            Reset Password
          </Button>
          <Button
            type="primary"
            onClick={() => setIsEditProfileModalOpen(true)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {isEditProfileModalOpen && (
        <EditProfileModal
          refetch={refetch}
          merchantId={merchantId}
          initName={name}
          initAddress={address}
          initContactNumber={contactNumber}
          initProfileDisplay={profilePictureDisplay}
          isModalOpen={isEditProfileModalOpen}
          setModalOpen={setIsEditProfileModalOpen}
        />
      )}

      {isResetPasswordModalOpen && (
        <ResetPasswordModal
          merchantId={merchantId}
          isModalOpen={isResetPasswordModalOpen}
          setModalOpen={setIsResetPasswordModalOpen}
        />
      )}

      <div className="mt-5">
        <div className="flex space-x-4">
          <div className="flex-1">
            <p>Name</p>
            <Card>
              <p>{name}</p>
            </Card>
          </div>
          <div className="flex-1">
            <p>Email</p>
            <Card>
              <p>{email}</p>
            </Card>
          </div>
        </div>
        <div className="mt-5 flex space-x-4">
          <div className="flex-1">
            <p>Contact Number</p>
            <Card>
              <p>{contactNumber}</p>
            </Card>
          </div>
          <div className="flex-1">
            <p>Address</p>
            <Card>
              <p>{address}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditProfileModal = ({
  refetch,
  merchantId,
  initName,
  initContactNumber,
  initAddress,
  initProfileDisplay,
  isModalOpen,
  setModalOpen,
}: EditProfileProps) => {
  const [editProfileMutation, { isLoading, error }] = useEditProfileMutation();
  const [profilePictureDisplay, setProfilePictureDisplay] =
    useState(initProfileDisplay);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [form] = Form.useForm();
  const formData = new FormData();

  const onFinish: FormProps<RegisterFormValues>["onFinish"] = async (data) => {
    formData.set("name", data.name);
    formData.set("contact_number", data.contact_number);
    formData.set("address", data.address);
    profilePicture && formData.set("profile_picture", profilePicture);
    await editProfileMutation({ id: merchantId, body: formData });
    if (!isLoading) {
      setModalOpen(false);
    }
    if (error) {
      message.error("Edit Profile Failed! Please try again");
    }
    refetch();
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        // The result is a Base64 string
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      // Read the file as a Data URL (Base64)
      reader.readAsDataURL(file);
    });
  };

  const handleChange: UploadProps["onChange"] = async (info) => {
    if (info.file.originFileObj) {
      setProfilePicture(info.file.originFileObj);
      const base64String = await convertImageToBase64(info.file.originFileObj);
      setProfilePictureDisplay(base64String);
      return;
    }
    return;
  };
  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }

    return isJpgOrPng && isLt2M;
  };

  return (
    <Modal
      title="Edit Profile"
      open={isModalOpen}
      onOk={() => form.submit()}
      cancelText="Cancel"
      okText="Confirm"
      onCancel={() => setModalOpen(false)}
    >
      <Form name="basic" onFinish={onFinish} form={form} labelCol={{ span: 6 }}>
        <Form.Item<RegisterFormValues>
          name="profile_picture"
          label="Profile Picture"
        >
          <div className="flex items-center">
            {profilePictureDisplay ? (
              <img
                src={profilePictureDisplay}
                alt="avatar1"
                className="h-36 w-36 object-cover"
              />
            ) : (
              <Avatar
                className="h-36 w-36 object-cover"
                icon={<UserOutlined />}
              />
            )}
            <Upload
              className="ml-5"
              beforeUpload={beforeUpload}
              onChange={handleChange}
              customRequest={() => {}}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </div>
        </Form.Item>

        <Form.Item<RegisterFormValues>
          name="name"
          label="Name"
          initialValue={initName}
        >
          <Input />
        </Form.Item>
        <Form.Item<RegisterFormValues>
          name="contact_number"
          label="Contact Number"
          initialValue={initContactNumber}
        >
          <Input />
        </Form.Item>
        <Form.Item<RegisterFormValues>
          name="address"
          label="Address"
          initialValue={initAddress}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ResetPasswordModal = ({
  merchantId,
  isModalOpen,
  setModalOpen,
}: ResetPasswordProps) => {
  const [form] = Form.useForm();
  const [resetPasswordMutation] = useResetPasswordMutation();

  const onFinish: FormProps<ResetPasswordValues>["onFinish"] = async (data) => {
    await resetPasswordMutation({
      id: merchantId,
      body: data,
    })
      .unwrap()
      .then(() => {
        message.info("Reset Password Successful!");
        setModalOpen(false);
      })
      .catch((error) => message.error(error.data.error));
  };
  return (
    <Modal
      title="Reset Password"
      open={isModalOpen}
      onOk={() => form.submit()}
      cancelText="Cancel"
      okText="Confirm"
      onCancel={() => setModalOpen(false)}
    >
      <Form name="basic" onFinish={onFinish} form={form} labelCol={{ span: 6 }}>
        <Form.Item<ResetPasswordValues>
          name="oldPassword"
          label="Old Password"
          rules={[
            {
              required: true,
              message: "Please input your old password!",
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item<ResetPasswordValues>
          name="newPassword"
          label="New Password"
          rules={[
            {
              required: true,
              message: "Please input your new password!",
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProfileScreen;
