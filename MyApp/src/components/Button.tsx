import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger" | "outline";
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = "primary",
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case "secondary":
                return styles.secondary;
            case "danger":
                return styles.danger;
            case "outline":
                return styles.outline;
            default:
                return styles.primary;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case "outline":
                return styles.outlineText;
            default:
                return styles.text;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
    },
    primary: {
        backgroundColor: "#007AFF",
    },
    secondary: {
        backgroundColor: "#5856D6",
    },
    danger: {
        backgroundColor: "#FF3B30",
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#007AFF",
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    outlineText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default Button;
