import { DeleteFilled, InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  FormProps,
  GetProp,
  Image,
  Input,
  message,
  Modal,
  Select,
  UploadFile,
  UploadProps,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import { useState } from "react";
import {
  IIssue,
  IssueCategory,
} from "../../../../packages/interfaces/issueInterface";
import { useCreateIssueMutation } from "../redux/services/issue";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface CreateIssueModalProps {
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  transactionId?: string;
}
const CreateIssueModal = ({
  isModalOpen,
  setModalOpen,
  transactionId,
}: CreateIssueModalProps) => {
  const [form] = Form.useForm();
  const [createIssueMutation, { isLoading }] = useCreateIssueMutation();
  const merchant = useSelector((state: RootState) => state.profile.merchant);

  const initialValues = {
    category: transactionId && IssueCategory.TRANSACTION,
  };

  const [imagesDisplays, setImagesDisplay] = useState<string[]>(
    Array(4).fill(""),
  );
  const [images, setImages] = useState<(File | undefined)[]>(
    new Array(4).fill(undefined),
  ); // Initialize with 6 undefined values
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const beforeUpload = (file: FileType) => {
    if (!images.includes(undefined)) {
      message.error("Maximum of 4 photos is allowed");
      return;
    }

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

  const handleChange: UploadProps["onChange"] = async ({ file: newFile }) => {
    if (newFile && newFile.originFileObj) {
      const file = newFile.originFileObj as File;

      setImages((prevImages) => {
        const updatedImages = [...prevImages]; // Create a copy of the current images
        const emptyIndex = updatedImages.findIndex((img) => img === undefined); // Find the first empty index

        if (emptyIndex !== -1) {
          updatedImages[emptyIndex] = file; // Replace the first empty spot with the new base64 string
        }

        return updatedImages;
      });

      const base64String = await convertImageToBase64(newFile.originFileObj);
      setImagesDisplay((prevImages) => {
        const updatedImages = [...prevImages]; // Create a copy of the current images
        const emptyIndex = updatedImages.findIndex((img) => img === ""); // Find the first empty index

        if (emptyIndex !== -1) {
          updatedImages[emptyIndex] = base64String; // Replace the first empty spot with the new base64 string
        }

        return updatedImages;
      });
    }
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    fileList: fileList,
    beforeUpload(file, fileList) {
      if (fileList.length > 0) {
        fileList.forEach((file) => beforeUpload(file));
      } else if (file) {
        beforeUpload(file);
      }
    },
    onChange(info) {
      handleChange(info);
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const navigate = useNavigate();

  const onFinish: FormProps<IIssue>["onFinish"] = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    images.forEach((image) => {
      if (image) {
        formData.append("images", image); // Append each image without an index
      }
    });
    formData.append("category", data.category);
    transactionId && formData.append("transaction_id", transactionId);
    merchant
      ? formData.append("merchant_id", merchant.merchant_id)
      : message.error("Merchant ID not found");
    data.customer_id && formData.append("customer_id", data.customer_id);
    data.admin_id && formData.append("admin_id", data.admin_id);

    await createIssueMutation(formData)
      .unwrap()
      .then((data) => {
        setModalOpen(false);
        message.success(
          "Your issue has been created. Please expect at least 3 working days for us to get back. Thank you!",
        );
        navigate(`/business-management/issues/${data.issue_id}`);
      })
      .catch((error) => message.error(error.data.error));
  };

  return (
    <Modal
      title="Create Issue"
      open={isModalOpen}
      onOk={() => form.submit()}
      // okButtonProps={{ style: { display: "none" } }}
      cancelText="Cancel"
      okText="Create"
      onCancel={() => setModalOpen(false)}
    >
      <Form
        name="basic"
        labelCol={{ span: 6 }}
        onFinish={onFinish}
        autoComplete="off"
        form={form}
        initialValues={initialValues}
      >
        <Form.Item<IIssue>
          label="Title"
          name="title"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IIssue>
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IIssue>
          label="Category"
          name="category"
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            placeholder="Select a category"
            optionFilterProp="label"
            // onChange={(value:string)=>{

            // }}
            // onSearch={onSearch}
            options={Object.values(IssueCategory).map((category) => ({
              value: category,
              label: category.charAt(0) + category.slice(1).toLowerCase(), // Format label (e.g., "Account")
            }))}
          />
        </Form.Item>

        {transactionId && (
          <Form.Item<IIssue> label="Transaction ID" name="transaction_id">
            <Input disabled placeholder={transactionId} value={transactionId} />
          </Form.Item>
        )}

        <Form.Item label="Images">
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Maximum of 4 photos is
              allowed.
            </p>
          </Dragger>
          <div className="flex flex-wrap justify-between">
            {imagesDisplays &&
              imagesDisplays.map((imageDisplay, index) => {
                return (
                  <Card
                    key={index}
                    className="my-5"
                    style={{ width: 80, height: 120 }}
                    cover={
                      imageDisplay != "" && (
                        <div className="relative">
                          <Image
                            alt=""
                            src={imageDisplay}
                            height={80}
                            className="object-cover"
                          />
                          <Button
                            onClick={() => {
                              setImages((prevImages) => {
                                const newImages = [...prevImages];
                                newImages[index] = undefined;
                                return newImages;
                              });
                              setImagesDisplay((prevDisplays) => {
                                const newDisplays = [...prevDisplays];
                                newDisplays[index] = "";
                                return newDisplays;
                              });
                            }}
                            className="mt-1 w-full" // Margin top for spacing, full width
                          >
                            <DeleteFilled />
                          </Button>
                        </div>
                      )
                    }
                  ></Card>
                );
              })}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateIssueModal;
