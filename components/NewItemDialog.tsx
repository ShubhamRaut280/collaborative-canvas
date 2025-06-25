import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'


type props = {
    dialogVisible: boolean;
    handleDialogCancel: () => void;
    handleDialogSubmit: () => void;
    newName: string;
    setNewName: (name: string) => void;
    title: string;
    description: string;
    hint: string;
    submitButtonTitle?: string;
}

const NewItemDialog = ({ dialogVisible, handleDialogCancel, handleDialogSubmit, newName, setNewName, title, description, hint , submitButtonTitle } : props) => {
    return (
        <>
            <Modal
                visible={dialogVisible}
                transparent
                animationType="fade"
                onRequestClose={handleDialogCancel}
            >
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.dialog}>
                        <Text style={modalStyles.title}>{title}</Text>
                        <Text style={modalStyles.description}>{description}</Text>
                        <TextInput
                            placeholder={hint}
                            value={newName}
                            onChangeText={setNewName}
                            style={modalStyles.input}
                            placeholderTextColor="#b0b3b8"
                            autoFocus={Platform.OS !== 'web'}
                        />
                        <View style={modalStyles.buttonRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    modalStyles.button,
                                    { backgroundColor: pressed ? '#f0f0f0' : 'transparent' }
                                ]}
                                onPress={handleDialogCancel}
                            >
                                <Text style={modalStyles.cancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    modalStyles.button,
                                    { backgroundColor: pressed ? '#e6f0ff' : 'transparent' }
                                ]}
                                onPress={handleDialogSubmit}
                                disabled={!newName.trim()}
                            >
                                <Text style={[
                                    modalStyles.createText,
                                    { color: !newName.trim() ? '#b0b3b8' : '#4f8cff' }
                                ]}>
                                    {submitButtonTitle || 'Create'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal></>
    )
}

export default NewItemDialog


const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        width: 340,
        borderRadius: 16,
        backgroundColor: '#f8faff',
        padding: 24,
        shadowColor: '#4f8cff',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        color: '#2d3a4b',
        fontWeight: 'bold',
        fontSize: 22,
        textAlign: 'left',
        marginBottom: 4,
    },
    description: {
        color: '#6b7a90',
        fontSize: 15,
        marginBottom: 10,
        textAlign: 'left',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderColor: '#e0e4ed',
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        color: '#2d3a4b',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    button: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 8,
    },
    cancelText: {
        color: '#6b7a90',
        fontWeight: '500',
        fontSize: 16,
    },
    createText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});