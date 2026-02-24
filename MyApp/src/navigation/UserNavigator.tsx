import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/DashboardScreen";
import QueuesScreen from "../screens/QueuesScreen";
import MyQueueScreen from "../screens/MyQueueScreen";
import HistoryScreen from "../screens/HistoryScreen";
import { UserStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<UserStackParamList>();

const UserNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#007AFF",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
            }}
        >
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: "Queue App" }}
            />
            <Stack.Screen
                name="Queues"
                component={QueuesScreen}
                options={{ title: "Browse Queues" }}
            />
            <Stack.Screen
                name="MyQueue"
                component={MyQueueScreen}
                options={{ title: "My Queue" }}
            />
            <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ title: "Queue History" }}
            />
        </Stack.Navigator>
    );
};

export default UserNavigator;
