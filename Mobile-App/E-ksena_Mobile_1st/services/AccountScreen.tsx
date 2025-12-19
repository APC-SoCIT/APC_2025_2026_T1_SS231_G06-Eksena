import React, { useState, useEffect } from 'react'
import { Alert, StyleSheet, View, Text, ScrollView, TextInput, Modal, TouchableOpacity } from 'react-native'
import { supabase } from '../utils/supbase-real'
import { Button } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  display_name: string
  phone_number: string
}

interface AccountScreenProps {
  session: Session | null
  onSignOut: () => void
}

export default function AccountScreen({ session, onSignOut }: AccountScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (session?.user?.id) {
      loadProfile()
    }
  }, [session])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile exists yet - create one
          const newProfile = {
            id: session?.user?.id,
            display_name: '',
            phone_number: '',
          }
          setProfile(newProfile as UserProfile)
          setShowProfileModal(true)
        } else {
          console.error('Error loading profile:', error.message)
          // Still show form with empty profile
          setProfile({
            id: session?.user?.id || '',
            display_name: '',
            phone_number: '',
          })
        }
      } else if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
        setPhoneNumber(data.phone_number || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Fallback: create empty profile
      setProfile({
        id: session?.user?.id || '',
        display_name: '',
        phone_number: '',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      if (!displayName.trim()) {
        Alert.alert('Error', 'Display name cannot be empty')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session?.user?.id,
          display_name: displayName,
          phone_number: phoneNumber,
          updated_at: new Date(),
        })

      if (error) throw error

      const updatedProfile = {
        id: session?.user?.id!,
        display_name: displayName,
        phone_number: phoneNumber,
      }
      setProfile(updatedProfile)
      setShowProfileModal(false)
      Alert.alert('Success', 'Profile updated successfully')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const updatePassword = async () => {
    try {
      if (!newPassword || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all password fields')
        return
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match')
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      Alert.alert('Success', 'Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordModal(false)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      onSignOut()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>No profile data available. Try signing out and in again.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <>
          <View style={styles.header}>
            <Text style={styles.title}>Account Settings</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profileItem}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{session?.user?.email}</Text>
            </View>

            <View style={styles.profileItem}>
              <Text style={styles.label}>Display Name</Text>
              <Text style={styles.value}>{profile.display_name || 'Not set'}</Text>
            </View>

            <View style={styles.profileItem}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>{profile.phone_number || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Button
              title="Edit Profile"
              onPress={() => setShowProfileModal(true)}
              buttonStyle={styles.editButton}
            />
            <Button
              title="Change Password"
              onPress={() => setShowPasswordModal(true)}
              buttonStyle={styles.editButton}
            />
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              buttonStyle={styles.signOutButton}
              titleStyle={{ color: '#fff' }}
            />
          </View>

          {/* Profile Setup/Edit Modal */}
          <Modal
            visible={showProfileModal}
            transparent
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {profile ? 'Edit Profile' : 'Complete Your Profile'}
                </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your display name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <Button
                title="Save"
                onPress={saveProfile}
                buttonStyle={styles.saveButton}
              />
              <Button
                title="Cancel"
                onPress={() => setShowProfileModal(false)}
                type="outline"
                buttonStyle={styles.cancelButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <Button
                title="Update"
                onPress={updatePassword}
                buttonStyle={styles.saveButton}
              />
              <Button
                title="Cancel"
                onPress={() => setShowPasswordModal(false)}
                type="outline"
                buttonStyle={styles.cancelButton}
              />
            </View>
              </View>
            </View>
          </Modal>
        </>
      </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  profileSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  profileItem: {
    marginVertical: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  buttonSection: {
    padding: 20,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  modalButtonContainer: {
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#0066cc',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 8,
  },
})
