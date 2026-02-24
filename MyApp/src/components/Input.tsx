import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TouchableOpacity,
} from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    style,
    isPassword,
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, error && styles.inputError, style]}
                    placeholderTextColor="#999"
                    secureTextEntry={isPassword && !isPasswordVisible}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Text style={styles.eyeText}>
                            {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    inputContainer: {
        position: "relative",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    inputError: {
        borderColor: "#FF3B30",
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: "50%",
        transform: [{ translateY: -12 }],
        padding: 4,
    },
    eyeText: {
        fontSize: 20,
    },
    error: {
        color: "#FF3B30",
        fontSize: 12,
        marginTop: 4,
    },
});

export default Input;
