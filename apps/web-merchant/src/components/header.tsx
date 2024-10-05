import { UserOutlined } from "@ant-design/icons";
import { Avatar, Layout, Menu, message, Popover } from "antd";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearMerchant } from "../redux/features/profileSlice";
import { useLogoutMutation } from "../redux/services/auth";
import { RootState } from "../redux/store";
import GlobalSearchBar from "./globalSearchBar";

const Header: React.FC = () => {
  const { Header } = Layout;
  enum HeaderTitles {
    Home = "Home",
    BusinessManagement = "Business Management",
  }

  const items = [
    { label: HeaderTitles.Home, key: HeaderTitles.Home },
    {
      label: HeaderTitles.BusinessManagement,
      key: HeaderTitles.BusinessManagement,
    },
  ];
  const navigate = useNavigate();
  const merchant = useSelector((state: RootState) => state.profile.merchant);

  const navigateToScreen = (key: string) => {
    if (key == HeaderTitles.Home) {
      navigate("/");
    } else if (key == HeaderTitles.BusinessManagement) {
      navigate("/business-management/issues");
    }
  };

  const [logoutMutation] = useLogoutMutation();

  const submitLogout = () => {
    logoutMutation()
      .unwrap()
      .then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("merchantId");
        message.success("Logout Successful!");
      })
      .catch((error) => message.error(error));
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
    <Header className="fixed top-0 z-10 flex w-full items-center bg-gray-100 shadow-sm">
      <Menu
        mode="horizontal"
        defaultSelectedKeys={["2"]}
        items={items}
        style={{ flex: 1, backgroundColor: "#F5F5F5", border: "none" }}
        onClick={(menuInfo) => navigateToScreen(menuInfo.key)}
      />
      <GlobalSearchBar />
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
          <Avatar
            icon={<UserOutlined />}
            className="group transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-lg"
          />
        )}
      </Popover>
    </Header>
  );
};

export default Header;
