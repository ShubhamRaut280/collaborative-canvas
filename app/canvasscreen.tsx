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
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import { useLocalSearchParams, useRouter } from 'expo-router';
import { onChildAdded, push, ref, set } from 'firebase/database';
import { auth, rdb } from '../firebaseConfig';
import Stroke from "./models/Stroke";

const canvasBackgroundColor = "#fff";



export default function CanvasScreen() {
    const { width, height } = Dimensions.get("window");
    const [isFirstRender, setIsFirstRender] = useState(true);
    const router = useRouter();
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

    const paletteColors = ["red", "green", "blue", "yellow", "white"];
    const [activePaletteColorIndex, setActivePaletteColorIndex] = useState(0);
    const [paths, setPaths] = useState<Stroke[]>([]);
    const [curr, setCurr] = useState<number>(0);
    const currentPath = useRef<Stroke | null>(null);
    const [isEraserActive, setIsEraserActive] = useState(false);


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

        return () => {
            unsub();
        };
    }, []);


    const pan = Gesture.Pan()
        .runOnJS(true)
        .onStart((g) => {
            if (curr < paths.length) {
                setPaths((prev) => prev.slice(0, curr));
            }
            currentPath.current = {
                segments: [`M ${g.x} ${g.y}`],
                color: paletteColors[activePaletteColorIndex],
                createdAt: Date.now(),
                createdBy: auth.currentUser?.displayName || "Unknown",
            };
            setPaths((prev) => [...prev, currentPath.current!]);
            setCurr((prev) => prev + 1);
        })
        .onUpdate((g) => {
            if (currentPath.current) {
                currentPath.current.segments.push(`L ${g.x} ${g.y}`);
                // Update only the last path in the array
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
                currentPath.current = null; // clear after saving
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
            setIsEraserActive(false);
            setActivePaletteColorIndex(paletteColors.indexOf("white"));
        } else {
            setIsEraserActive(true);
            setActivePaletteColorIndex(paletteColors.indexOf("red"));
        }
    }

    const paletteVisible = useSharedValue(false);
    const animatedPaletteStyle = useAnimatedStyle(() => {
        return {
            top: withSpring(paletteVisible.value ? -275 : -100),
            height: withTiming(paletteVisible.value ? 200 : 50),
            opacity: withTiming(paletteVisible.value ? 100 : 0, { duration: 100 }),
        };
    });

    const animatedSwatchStyle = useAnimatedStyle(() => {
        return {
            top: withSpring(paletteVisible.value ? -50 : 0),
            height: paletteVisible.value ? 0 : 50,
            opacity: withTiming(paletteVisible.value ? 0 : 100, { duration: 100 }),
        };
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    router.back();
                    // router.push("/gesturedemo");
                }} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{name || 'Canvas'}</Text>
            </View>

            <View style={styles.swatchContainer}>
                <TouchableOpacity
                    onPress={() => {
                        paletteVisible.value = !paletteVisible.value;
                    }}
                >
                    <Animated.View
                        style={[
                            {
                                backgroundColor: paletteColors[activePaletteColorIndex],
                            },
                            styles.swatch,
                            animatedSwatchStyle,
                        ]}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={undoLast}>
                    <FontAwesome5
                        name="undo"
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={redoLast}>
                    <FontAwesome5
                        name="redo"
                        style={styles.icon}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleEraser}>
                    <FontAwesome5
                        name={isEraserActive ? "eraser" : "pencil-alt"}
                        style={styles.icon}
                    />
                </TouchableOpacity>


            </View>

            <GestureHandlerRootView>
                <View style={{ height, width }}>
                    <GestureDetector gesture={pan}>
                        <Canvas style={{ flex: 8 }}>
                            {paths.slice(0, curr).map((p, index) =>
                                Array.isArray(p.segments) && p.segments.length > 0 ? (
                                    <Path
                                        key={index}
                                        path={p.segments.join(" ")}
                                        strokeWidth={5}
                                        style="stroke"
                                        color={p.color}
                                    />
                                ) : null
                            )}
                        </Canvas>
                    </GestureDetector>
                    <View style={{ padding: 10, flex: 1, backgroundColor: "#edede9" }}>
                        <View style={{ flex: 1, flexDirection: "row" }}>
                            <Animated.View
                                style={[
                                    { padding: 10, position: "absolute", width: 60 },
                                    animatedPaletteStyle,
                                ]}
                            >
                                {paletteColors.map((c, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => {
                                            setActivePaletteColorIndex(i);
                                            paletteVisible.value = false;
                                        }}
                                    >
                                        <View
                                            style={[
                                                {
                                                    backgroundColor: c,
                                                },
                                                styles.paletteColor,
                                            ]}
                                        ></View>
                                    </TouchableOpacity>
                                ))}
                            </Animated.View>

                        </View>
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
});