import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import AuthNavigator from "./AuthNavigator";
import UserNavigator from "./UserNavigator";
import AdminNavigator from "./AdminNavigator";

// Simple type for our navigation state
type AppNavigatorParams = {
    Auth: undefined;
    User: undefined;
    Admin: undefined;
};

const Stack = createNativeStackNavigator<AppNavigatorParams>();

// For demo purposes, we're using a simple state
// In production, you'd want a proper way to determine user role
// For now, users can access both User and Admin via the app
const AppNavigator: React.FC = () => {
    const { token, role } = useSelector((state: RootState) => state.auth);

    if (!token) {
        return <AuthNavigator />;
    }

    // Navigate based on user role
    if (role === "admin") {
        return <AdminNavigator />;
    }

    // Default to user navigator
    return <UserNavigator />;
};

export default AppNavigator;
