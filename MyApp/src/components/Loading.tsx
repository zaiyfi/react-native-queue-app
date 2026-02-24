import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message, fullScreen = false }) => {
    return (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size="large" color="#007AFF" />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    fullScreen: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    message: {
        marginTop: 12,
        fontSize: 14,
        color: "#666",
    },
});

export default Loading;
