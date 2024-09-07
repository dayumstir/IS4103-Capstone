import React, { useState } from "react";
import { Text, View } from "react-native";
import { Icon, SearchBar, TabBar } from "@ant-design/react-native";

const BottomTabBar = () => {
  const [selectedTab, setSelectedTab] = useState("redTab");

  const renderContent = (pageText: string) => {
    return (
      <View className="flex items-center bg-white">
        <SearchBar placeholder="Search" showCancelButton />
        <Text className="mt-2">{pageText}</Text>
      </View>
    );
  };

  const onChangeTab = (tabName: string) => {
    setSelectedTab(tabName);
  };

  return (
    <TabBar
      unselectedTintColor="#949494"
      tintColor="#33A3F4"
      // barTintColor="#f5f5f5"
      barTintColor="black"
    >
      <TabBar.Item
        title="Life"
        icon={<Icon name="home" />}
        selected={selectedTab === "blueTab"}
        onPress={() => onChangeTab("blueTab")}
      >
        {renderContent("Life Tab")}
      </TabBar.Item>
      <TabBar.Item
        icon={<Icon name="ordered-list" />}
        title="Koubei"
        badge={3}
        selected={selectedTab === "redTab"}
        onPress={() => onChangeTab("redTab")}
      >
        {renderContent("Koubei Tab")}
      </TabBar.Item>
      <TabBar.Item
        icon={<Icon name="like" />}
        title="Friend"
        selected={selectedTab === "greenTab"}
        onPress={() => onChangeTab("greenTab")}
      >
        {renderContent("Friend Tab")}
      </TabBar.Item>
      <TabBar.Item
        icon={<Icon name="user" />}
        title="My"
        selected={selectedTab === "yellowTab"}
        onPress={() => onChangeTab("yellowTab")}
      >
        {renderContent("My Tab")}
      </TabBar.Item>
    </TabBar>
  );
};

export default BottomTabBar;
