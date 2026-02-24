import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AuthNavigator";
import { login, seedAdmin } from "../services/AuthServices";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { Button, Input, Card } from "../components";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success && result.token && result.user) {
        dispatch(setCredentials({
          token: result.token,
          user: result.user
        }));
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Demo admin login - for development only
  const handleDemoAdminLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // First, seed the admin user
      await seedAdmin();

      // Then login with admin credentials
      const result = await login("admin@queue.com", "Admin@123");

      if (result.success && result.token && result.user) {
        dispatch(setCredentials({
          token: result.token,
          user: result.user
        }));
        Alert.alert("Success", "Logged in as admin!");
      } else {
        setError(result.message || "Admin login failed");
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
          <Text style={styles.subtitle}>Digital Queue Management</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>

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

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Text
              style={styles.signupLink}
              onPress={() => navigation.navigate("Signup")}
            >
              Sign Up
            </Text>
          </View>

          {/* Demo Admin Button - Development Only */}
          <View style={styles.demoContainer}>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoAdminLogin}
              disabled={loading}
            >
              <Text style={styles.demoButtonText}>
                🔐 Login as Demo Admin
              </Text>
              <Text style={styles.demoHint}>
                (admin@queue.com / Admin@123)
              </Text>
            </TouchableOpacity>
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
  loginButton: {
    marginTop: 8,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  demoContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  demoButton: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  demoHint: {
    fontSize: 11,
    color: '#856404',
    marginTop: 4,
  },
});

export default LoginScreen;
