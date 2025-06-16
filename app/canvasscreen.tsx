import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
    Canvas,
    Path,
} from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";

import { useLocalSearchParams, useRouter } from 'expo-router';
import { onChildAdded, push, ref } from 'firebase/database';
import { auth, rdb } from '../firebaseConfig';
import Stroke from "./models/Stroke";
import { getSmoothPath } from "./utils/skia";
import { remove } from 'firebase/database';

const canvasBackgroundColor = "#fff";
const thicknessOptions = [5, 10, 20, 30];

export default function CanvasScreen() {
    const { width, height } = Dimensions.get("window");
    const router = useRouter();
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

    const paletteColors = ["red", "green", "blue", "yellow", "white"];
    const [activePaletteColorIndex, setActivePaletteColorIndex] = useState(0);
    const [paths, setPaths] = useState<Stroke[]>([]);
    const [curr, setCurr] = useState<number>(0);
    const currentPath = useRef<Stroke | null>(null);
    const [isEraserActive, setIsEraserActive] = useState(false);
    const [strokeWidth, setStrokeWidth] = useState(thicknessOptions[0]);
    const [showThicknessDropdown, setShowThicknessDropdown] = useState(false);
    const [isFirstRender, setIsFirstRender] = useState(true);
    const [paletteVisible, setPaletteVisible] = useState(false);

    const strokesRef = ref(rdb, `drawings/${id}/strokes`);

    const saveNewPathToRDB = (stroke: Stroke) => {
        push(strokesRef, stroke);
        setPaths(prev => [...prev, stroke]);
        setCurr(prev => prev + 1);
    };

    useEffect(() => {
        const unsub = onChildAdded(strokesRef, (snapshot) => {
            const newStroke = snapshot.val() as Stroke;
            if (isFirstRender || newStroke.createdBy !== auth.currentUser?.displayName) {
                setIsFirstRender(false);
                setPaths((prev) => [...prev, newStroke]);
                setCurr((prev) => prev + 1);
            }
        });
        return () => unsub();
    }, []);

    const pan = Gesture.Pan()
        .runOnJS(true)
        .onStart((g) => {
            if (curr < paths.length) {
                setPaths((prev) => prev.slice(0, curr));
            }
            currentPath.current = {
                points: [{ x: g.x, y: g.y }],
                color: isEraserActive ? canvasBackgroundColor : paletteColors[activePaletteColorIndex],
                createdAt: Date.now(),
                createdBy: auth.currentUser?.displayName || "Unknown",
                strokeWidth: strokeWidth,
            };
            setPaths((prev) => [...prev, currentPath.current!]);
            setCurr((prev) => prev + 1);
        })
        .onUpdate((g) => {
            if (currentPath.current) {
                currentPath.current.points.push({ x: g.x, y: g.y });
                setPaths((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...currentPath.current! };
                    return updated;
                });
            }
        })
        .onEnd(() => {
            if (currentPath.current) {
                saveNewPathToRDB(currentPath.current);
                currentPath.current = null;
            }
        })
        .minDistance(1);

    const undoLast = () => {
        setCurr((prev) => (prev > 0 ? prev - 1 : 0));
    };

    const redoLast = () => {
        setCurr((prev) => (prev < paths.length ? prev + 1 : prev));
    };

    const handleEraser = () => {
        setIsEraserActive(!isEraserActive);
        if (isEraserActive) {
            setActivePaletteColorIndex(paletteColors.indexOf("red"));
        } else {
            setActivePaletteColorIndex(paletteColors.indexOf("white"));
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{name || 'Canvas'}</Text>
            </View>

            <View style={styles.swatchContainer}>
                {!isEraserActive && (
                    <TouchableOpacity onPress={() => setPaletteVisible(!paletteVisible)}>
                        <View
                            style={[
                                { backgroundColor: paletteColors[activePaletteColorIndex] },
                                styles.swatch,
                            ]}
                        />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={undoLast}>
                    <FontAwesome5 name="undo" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={redoLast}>
                    <FontAwesome5 name="redo" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEraser}>
                    <FontAwesome5
                        name={isEraserActive ? "eraser" : "pencil-alt"}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                {/* Clear Canvas Button */}
                <TouchableOpacity onPress={() => {
                    setPaths([]);
                    setCurr(0);
                    // Remove all strokes from Firebase Realtime Database
                    remove(strokesRef);

                }}>
                    <FontAwesome5 name="trash" style={styles.icon} />
                </TouchableOpacity>
                {/* Thickness Dropdown */}
                <View style={styles.thicknessDropdownContainer}>
                    <TouchableOpacity
                        style={styles.thicknessDropdownButton}
                        onPress={() => setShowThicknessDropdown((v) => !v)}
                    >
                        <Text style={styles.thicknessDropdownText}>
                            {strokeWidth}px ▼
                        </Text>
                    </TouchableOpacity>
                    {showThicknessDropdown && (
                        <View style={styles.thicknessDropdownList}>
                            {thicknessOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.thicknessDropdownItem,
                                        strokeWidth === option && styles.thicknessDropdownItemSelected,
                                    ]}
                                    onPress={() => {
                                        setStrokeWidth(option);
                                        setShowThicknessDropdown(false);
                                    }}
                                >
                                    <Text style={styles.thicknessDropdownItemText}>{option}px</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            {/* Move the palette dialog here, outside of the canvas area */}
            {paletteVisible && (
                <View style={styles.paletteDialog}>
                    {paletteColors.map((c, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => {
                                setActivePaletteColorIndex(i);
                                setPaletteVisible(false);
                            }}
                        >
                            <View
                                style={[{ backgroundColor: c }, styles.paletteColor]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <GestureHandlerRootView>
                <View style={{ height, width }}>
                    <GestureDetector gesture={pan}>
                        <Canvas style={{ flex: 8 }}>
                            {paths.slice(0, curr).map((p, index) =>
                                Array.isArray(p.points) && p.points.length > 1 ? (
                                    <Path
                                        key={index}
                                        path={getSmoothPath(p.points)}
                                        strokeWidth={p.strokeWidth || 5}
                                        style="stroke"
                                        color={p.color}
                                    />
                                ) : null
                            )}
                        </Canvas>
                    </GestureDetector>
                    <View style={{ padding: 10, flex: 1, backgroundColor: "#edede9" }}>
                        {/* Remove paletteVisible from here */}
                    </View>
                </View>
            </GestureHandlerRootView>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: canvasBackgroundColor,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
    },
    icon: {
        fontSize: 40,
        textAlign: "center",
        marginHorizontal: 5,
    },
    paletteColor: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginVertical: 5,
        zIndex: 2,
    },
    swatch: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: "black",
        marginVertical: 5,
        zIndex: 1,
    },
    swatchContainer: {
        flexDirection: "row",
        flex: 0,
        padding: 10,
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    thicknessDropdownContainer: {
        marginLeft: 10,
        position: 'relative',
    },
    thicknessDropdownButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        minWidth: 60,
        alignItems: 'center',
    },
    thicknessDropdownText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    thicknessDropdownList: {
        position: 'absolute',
        top: 40,
        left: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 10,
        minWidth: 60,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    thicknessDropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    thicknessDropdownItemSelected: {
        backgroundColor: '#e6f0ff',
    },
    thicknessDropdownItemText: {
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
    },
    paletteDialog: {
        position: 'absolute',
        top: 120, // adjust as needed
        left: 20, // adjust as needed
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        zIndex: 100,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
});
