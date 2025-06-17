
import React from "react";

import { useLocalSearchParams } from 'expo-router';
import DrawingCanvas from "@/components/DrawingCanvas";




export default function CanvasScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

    return (
        <>
            <DrawingCanvas id={id} name={name} />
        </>
    )
}