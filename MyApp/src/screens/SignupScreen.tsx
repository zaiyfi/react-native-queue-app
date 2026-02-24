import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AuthNavigator";
import { signup } from "../services/AuthServices";
import { Button, Input, Card } from "../components";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<string>("user");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignup = async () => {
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const result = await signup(email, password, role);

            if (result.success) {
                Alert.alert(
                    "Success",
                    "Account created! Please log in.",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.navigate("Login")
                        }
                    ]
                );
            } else {
                setError(result.message || "Signup failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Queue App</Text>
                    <Text style={styles.subtitle}>Create your account</Text>
                </View>

                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Sign Up</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                    />

                    <Input
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        isPassword
                    />

                    <Text style={styles.roleLabel}>Select Role</Text>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
                            onPress={() => setRole('user')}
                        >
                            <Text style={[styles.roleButtonText, role === 'user' && styles.roleButtonTextActive]}>User</Text>
                        </TouchableOpacity>

                    </View>

                    <Button
                        title="Create Account"
                        onPress={handleSignup}
                        loading={loading}
                        style={styles.signupButton}
                    />

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <Text
                            style={styles.loginLink}
                            onPress={() => navigation.navigate("Login")}
                        >
                            Login
                        </Text>
                    </View>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#007AFF",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    card: {
        padding: 24,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    errorContainer: {
        backgroundColor: "#FFE5E5",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
        textAlign: "center",
    },
    signupButton: {
        marginTop: 8,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    loginText: {
        fontSize: 14,
        color: "#666",
    },
    loginLink: {
        fontSize: 14,
        color: "#007AFF",
        fontWeight: "600",
    },
    roleLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginTop: 12,
        marginBottom: 8,
    },
    roleContainer: {
        flexDirection: "row",
        marginBottom: 16,
        gap: 12,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        alignItems: "center",
    },
    roleButtonActive: {
        borderColor: "#007AFF",
        backgroundColor: "#007AFF",
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    roleButtonTextActive: {
        color: "#fff",
    },
});

export default SignupScreen;
