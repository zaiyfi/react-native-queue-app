import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import CreateQueueScreen from "../screens/CreateQueueScreen";
import ManageQueueScreen from "../screens/ManageQueueScreen";
import { AdminStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#5856D6",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
            }}
        >
            <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{ title: "Admin Dashboard" }}
            />
            <Stack.Screen
                name="CreateQueue"
                component={CreateQueueScreen}
                options={{ title: "Create Queue" }}
            />
            <Stack.Screen
                name="ManageQueue"
                component={ManageQueueScreen}
                options={{ title: "Manage Queue" }}
            />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
