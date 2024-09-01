import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Button } from "@ant-design/react-native";
import { store } from "./src/store";
import { Provider } from "react-redux";

export default function App() {
    return (
        <Provider store={store}>
            <View style={styles.container}>
                <Text style={styles.header}>Native</Text>
                <Button type="primary">primary</Button>
                <StatusBar style="auto" />
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        fontWeight: "bold",
        marginBottom: 20,
        fontSize: 36,
    },
});
