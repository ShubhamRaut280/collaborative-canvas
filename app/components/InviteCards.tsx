import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Invite from '../lib/models/Invite';

// Card for when user RECEIVES an invitation
export const ReceiverInviteCard: React.FC<{
  invite: Invite;
  onAccept: (invite: Invite) => void;
  onDecline: (invite: Invite) => void;
}> = ({ invite, onAccept, onDecline }) => {
  return (
    <View style={styles.receiverCard}>
      <View style={styles.inviteHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#EBF4FF' }]}>
          <Ionicons name="people" size={24} color="#4F8EF7" />
        </View>
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteTitle}>Room Invitation</Text>
          <Text style={styles.inviteSubtitle}>You&apos;re invited to join</Text>
        </View>
      </View>

      <View style={styles.roomContainer}>
        <Text style={styles.roomName}>{invite.roomName}</Text>
        <Text style={styles.roomCode}>Room Code: {invite.roomcode}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => onDecline(invite)}
          activeOpacity={0.8}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => onAccept(invite)}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Card for when user SENDS an invitation
export const SenderInviteCard: React.FC<{ invite: Invite }> = ({ invite }) => {
  return (
    <View style={styles.senderCard}>
      <View style={styles.inviteHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#FFF4E5' }]}>
          <Ionicons name="paper-plane" size={24} color="#FF9500" />
        </View>
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteTitle}>Invitation Sent</Text>
          <Text style={styles.inviteSubtitle}>Waiting for response</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>

      <View style={[styles.roomContainer, { borderLeftColor: '#FF9500' }]}>
        <Text style={styles.roomName}>{invite.roomName}</Text>
        <Text style={styles.roomCode}>Room Code: {invite.roomcode}</Text>
        <Text style={styles.receiverText}>Invited: {invite.receiver}</Text>
      </View>

      <View style={styles.senderFooter}>
        <Ionicons name="time" size={16} color="#6B7280" />
        <Text style={styles.timeText}>Sent recently</Text>
      </View>
    </View>
  );
};

// Card for ACCEPTED invitations
export const AcceptedInviteCard: React.FC<{ invite: Invite }> = ({ invite }) => {
  return (
    <View style={styles.acceptedCard}>
      <View style={styles.inviteHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
        </View>
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteTitle}>Invitation Accepted</Text>
          <Text style={styles.inviteSubtitle}>
            {invite.receiver} joined your room
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#E8F5E8' }]}>
          <Text style={[styles.statusText, { color: '#22C55E' }]}>Accepted</Text>
        </View>
      </View>

      <View style={[styles.roomContainer, { borderLeftColor: '#22C55E' }]}>
        <Text style={styles.roomName}>{invite.roomName}</Text>
        <Text style={styles.roomCode}>Room Code: {invite.roomcode}</Text>
      </View>

    </View>
  );
};

// Card for DECLINED invitations
export const DeclinedInviteCard: React.FC<{ invite: Invite }> = ({ invite }) => {
  return (
    <View style={styles.declinedCard}>
      <View style={styles.inviteHeader}>
        <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </View>
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteTitle}>Invitation Declined</Text>
          <Text style={styles.inviteSubtitle}>
            {invite.receiver} declined your invitation
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: '#EF4444' }]}>Declined</Text>
        </View>
      </View>

      <View style={[styles.roomContainer, { borderLeftColor: '#EF4444' }]}>
        <Text style={styles.roomName}>{invite.roomName}</Text>
        <Text style={styles.roomCode}>Room Code: {invite.roomcode}</Text>
      </View>
{/* 
      <TouchableOpacity style={styles.resendButton} activeOpacity={0.8}>
        <Ionicons name="refresh" size={16} color="#6B7280" />
        <Text style={styles.resendText}>Send Again</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  // Base card styles
  receiverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  senderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFF4E5',
    borderTopWidth: 3,
    borderTopColor: '#FF9500',
  },
  acceptedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F5E8',
    borderTopWidth: 3,
    borderTopColor: '#22C55E',
  },
  declinedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderTopWidth: 3,
    borderTopColor: '#EF4444',
  },

  // Header styles
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  inviteSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Status badge
  statusBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Room info
  roomContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4F8EF7',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  receiverText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Button styles
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4F8EF7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Footer styles
  senderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Action buttons
  viewRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  viewRoomText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});


