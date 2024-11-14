import { UserOutlined, BellOutlined } from "@ant-design/icons";
import { Avatar, Badge, Layout, Menu, message, Popover } from "antd";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearMerchant } from "../redux/features/profileSlice";
import { useLogoutMutation } from "../redux/services/auth";
import { RootState } from "../redux/store";
import GlobalSearchBar from "./globalSearchBar";
import { useGetMerchantNotificationsQuery } from "../redux/services/notification";

const Header: React.FC = () => {
  const { Header } = Layout;
  enum HeaderTitles {
    Home = "Home",
    BusinessManagement = "Business Management",
    QRCode = "View QR Code",
  }

  const items = [
    { label: HeaderTitles.Home, key: HeaderTitles.Home },
    { label: HeaderTitles.QRCode, key: HeaderTitles.QRCode },
    {
      label: HeaderTitles.BusinessManagement,
      key: HeaderTitles.BusinessManagement,
    },
  ];

  const navigate = useNavigate();
  const merchant = useSelector((state: RootState) => state.profile.merchant);
  const { data: notifications } = useGetMerchantNotificationsQuery("");

  const unreadNotifications =
    notifications?.filter((notification) => !notification.is_read) || [];

  const navigateToScreen = (key: string) => {
    if (key == HeaderTitles.Home) {
      navigate("/");
    } else if (key == HeaderTitles.BusinessManagement) {
      navigate("/business-management/issues");
    } else if (key == HeaderTitles.QRCode) {
      navigate("/qrcode");
    }
  };

  const [logoutMutation] = useLogoutMutation();

  const submitLogout = () => {
    logoutMutation()
      .unwrap()
      .then(() => {
        message.success("Logout Successful!");
      })
      .catch((error) => message.error(error));
    localStorage.removeItem("token");
    localStorage.removeItem("merchantId");
    navigate("/login");
  };

  const merchantId = localStorage.getItem("merchantId");
  if (!merchantId) {
    navigate("/login");
    return null;
  }

  const [profilePictureDisplay, setProfilePictureDisplay] = useState(() => {
    if (merchant?.profile_picture) {
      const profilePictureBase64 = `data:image/png;base64,${Buffer.from(merchant.profile_picture).toString("base64")}`;
      return profilePictureBase64;
    }
    return "";
  });

  useEffect(() => {
    if (merchant?.profile_picture) {
      const profilePictureBase64 = `data:image/png;base64,${Buffer.from(merchant.profile_picture).toString("base64")}`;
      setProfilePictureDisplay(profilePictureBase64);
    }
  }, [merchant]);

  const dispatch = useDispatch();

  const popoverContent = (
    <div className="flex flex-col">
      <button
        onClick={() => navigate("/profile")}
        className="rounded p-2 hover:bg-gray-300"
      >
        Profile
      </button>
      <div className="my-2 border-t"></div>
      <button
        onClick={() => {
          submitLogout();
          dispatch(clearMerchant());
        }}
        className="rounded p-2 hover:bg-gray-300"
      >
        Logout
      </button>
    </div>
  );

  return (
    <Header className="fixed top-0 z-10 flex w-full items-center bg-gray-200 shadow-sm">
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        items={items}
        style={{ flex: 1, backgroundColor: "#e5e7eb", border: "none" }}
        onClick={(menuInfo) => navigateToScreen(menuInfo.key)}
      />
      <GlobalSearchBar />
      <div className="flex items-center gap-8">
        <Badge count={unreadNotifications.length} size="small">
          <BellOutlined
            className="cursor-pointer text-2xl text-gray-500"
            onClick={() => navigate("/notifications")}
          />
        </Badge>
        <Popover
          placement="bottomRight"
          content={popoverContent}
          arrow={false}
          trigger={"click"}
        >
          {profilePictureDisplay ? (
            <img
              src={profilePictureDisplay}
              alt="avatar1"
              className="group h-10 w-10 rounded-full object-cover transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-lg"
            />
          ) : (
            <>
              <Avatar
                icon={<UserOutlined />}
                className="group transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-lg"
              />
            </>
          )}
        </Popover>
      </div>
    </Header>
  );
};

export default Header;
