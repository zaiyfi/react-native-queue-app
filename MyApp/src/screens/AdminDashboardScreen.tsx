import React, { useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootState, AppDispatch } from "../store/store";
import { fetchMyQueues } from "../store/slices/queueSlice";
import { logout } from "../store/slices/authSlice";
import { Card, Button, Loading, EmptyState } from "../components";
import { Queue } from "../types/queue";
import { AdminStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminDashboard">;

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { myQueues, loading } = useSelector((state: RootState) => state.queue);
    const { user } = useSelector((state: RootState) => state.auth);

    const loadData = useCallback(() => {
        dispatch(fetchMyQueues());
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleLogout = () => {
        dispatch(logout());
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "#34C759";
            case "paused":
                return "#FF9500";
            case "closed":
                return "#FF3B30";
            default:
                return "#ccc";
        }
    };

    const renderQueueItem = ({ item }: { item: Queue }) => (
        <Card style={styles.queueCard}>
            <TouchableOpacity
                onPress={() => navigation.navigate("ManageQueue", { queueId: item._id })}
                style={styles.queueContent}
            >
                <View style={styles.queueHeader}>
                    <Text style={styles.queueName}>{item.name}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(item.status) },
                        ]}
                    >
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>

                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.queueStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.waitingCount || 0}</Text>
                        <Text style={styles.statLabel}>Waiting</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.nowServingToken || '-'}</Text>
                        <Text style={styles.statLabel}>Now Serving</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{item.maxSize}</Text>
                        <Text style={styles.statLabel}>Max Size</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Card>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Admin Dashboard</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Create Queue Button */}
            <View style={styles.createContainer}>
                <Button
                    title="+ Create New Queue"
                    onPress={() => navigation.navigate("CreateQueue")}
                />
            </View>

            {/* My Queues List */}
            <Text style={styles.sectionTitle}>My Queues</Text>

            {loading && myQueues.length === 0 ? (
                <Loading />
            ) : myQueues.length === 0 ? (
                <EmptyState
                    title="No Queues Yet"
                    message="Create your first queue to start managing customers!"
                />
            ) : (
                <FlatList
                    data={myQueues}
                    keyExtractor={(item) => item._id}
                    renderItem={renderQueueItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadData} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    email: {
        fontSize: 14,
        color: "#666",
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: "#FF3B30",
        fontSize: 16,
    },
    createContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    queueCard: {
        marginBottom: 12,
    },
    queueContent: {
        width: "100%",
    },
    queueHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    queueName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    queueStats: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
    },
});

export default AdminDashboardScreen;
