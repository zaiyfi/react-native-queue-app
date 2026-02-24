import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface EmptyStateProps {
    title: string;
    message: string;
    icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>📋</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
        textAlign: "center",
    },
    message: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
});

export default EmptyState;
