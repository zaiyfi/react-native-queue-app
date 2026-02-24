import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useDispatch } from "react-redux";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppDispatch } from "../store/store";
import { createQueue } from "../store/slices/queueSlice";
import { Button, Input, Card } from "../components";
import { AdminStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<AdminStackParamList, "CreateQueue">;

const CreateQueueScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [maxSize, setMaxSize] = useState("100");
    const [averageServiceTime, setAverageServiceTime] = useState("5");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Queue name is required");
            return;
        }

        const maxSizeNum = parseInt(maxSize, 10);
        const serviceTimeNum = parseInt(averageServiceTime, 10);

        if (isNaN(maxSizeNum) || maxSizeNum < 1) {
            Alert.alert("Error", "Please enter a valid maximum size");
            return;
        }

        if (isNaN(serviceTimeNum) || serviceTimeNum < 1) {
            Alert.alert("Error", "Please enter a valid service time");
            return;
        }

        setLoading(true);
        try {
            await dispatch(
                createQueue({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    maxSize: maxSizeNum,
                    averageServiceTime: serviceTimeNum,
                })
            ).unwrap();

            Alert.alert("Success", "Queue created successfully!", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create queue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Card>
                <Text style={styles.title}>Create New Queue</Text>
                <Text style={styles.subtitle}>
                    Set up a new queue for your customers to join
                </Text>

                <Input
                    label="Queue Name *"
                    placeholder="e.g., Main Counter, Customer Service"
                    value={name}
                    onChangeText={setName}
                />

                <Input
                    label="Description"
                    placeholder="Optional description for the queue"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                />

                <Input
                    label="Maximum Queue Size"
                    placeholder="100"
                    value={maxSize}
                    onChangeText={setMaxSize}
                    keyboardType="numeric"
                />

                <Input
                    label="Average Service Time (minutes)"
                    placeholder="5"
                    value={averageServiceTime}
                    onChangeText={setAverageServiceTime}
                    keyboardType="numeric"
                />

                <View style={styles.actions}>
                    <Button
                        title="Create Queue"
                        onPress={handleCreate}
                        loading={loading}
                    />
                    <Button
                        title="Cancel"
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        style={styles.cancelButton}
                    />
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    actions: {
        marginTop: 20,
    },
    cancelButton: {
        marginTop: 12,
    },
});

export default CreateQueueScreen;
