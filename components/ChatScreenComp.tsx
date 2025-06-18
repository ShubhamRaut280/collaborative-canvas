import { Message } from '@/app/models/Message';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '@/firebaseConfig';

type Props = {
  messages: Message[]
  onSend: (messageText: string) => void
}

const ChatScreenComp = ({ messages, onSend }: Props) => {
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  const renderItem = ({ item }: { item: Message }) => {
    const date = new Date(item.createdAt);
    const time = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    return (
      <View style={styles.messageContainer}>
        <View style={styles.messageHeader}>
          <Text style={[styles.sender, { color: item.sender === auth.currentUser?.displayName ? '#08B728FF' : '#4287f5' }]}>{item.sender}</Text>
          <Text style={styles.timestamp}>{time}</Text>
        </View>
        <Text style={styles.content}>{item.content}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <KeyboardAvoidingView
        behavior="position"
        style={{ position: 'absolute', bottom: 20, left: 0, right: 0 }}
        keyboardVerticalOffset={88}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!input.trim()}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreenComp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  list: {
    padding: 12,
    paddingBottom: 80,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '85%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sender: {
    fontWeight: 'bold',
    color: '#4287f5',
    fontSize: 14,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
  },
  content: {
    fontSize: 16,
    color: '#222',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f4fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: '#4287f5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});