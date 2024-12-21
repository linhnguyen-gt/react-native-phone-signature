import React from 'react';
import { Modal, SafeAreaView, StyleSheet } from 'react-native';
import { Box, Text, Touchable } from '..';

type SignatureModalProps = {
  isVisible: boolean;
  onClose: () => void;
  renderSignaturePad: React.ReactNode;
  clearSignature: () => void;
  saveSignature: () => void;
  backgroundColorButton?: string;
};

const SignatureModal: React.FC<SignatureModalProps> = ({
  isVisible,
  onClose,
  renderSignaturePad,
  clearSignature,
  saveSignature,
  backgroundColorButton,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, styles.centeredModal]}>
        <Box width="90%" alignSelf="center">
          <Box
            backgroundColor="#FFFFFF"
            borderRadius={24}
            paddingTop={24}
            paddingHorizontal={20}
            paddingBottom={32}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={16}
            elevation={8}
          >
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              position="relative"
              marginBottom={20}
            >
              <Text
                fontSize={24}
                fontWeight="700"
                color="#1a1a1a"
                textAlign="center"
              >
                Your Signature
              </Text>
              <Touchable
                position="absolute"
                right={0}
                top={-4}
                padding={8}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text fontSize={24} color="#9CA3AF">
                  ✕
                </Text>
              </Touchable>
            </Box>

            <Text
              fontSize={15}
              color="#6B7280"
              textAlign="center"
              marginBottom={24}
            >
              Please sign within the box below
            </Text>

            <Box
              height={320}
              backgroundColor="#ffffff"
              borderRadius={16}
              shadowColor="#000"
              shadowOffset={{
                width: 0,
                height: 2,
              }}
              shadowOpacity={0.08}
              shadowRadius={8}
              elevation={3}
              borderWidth={1.5}
              borderColor="#E5E7EB"
              marginBottom={24}
              overflow="hidden"
            >
              {renderSignaturePad}
            </Box>

            <Box>
              <Box flexDirection="row" gap={12}>
                <Touchable
                  paddingVertical={16}
                  borderRadius={12}
                  alignItems="center"
                  justifyContent="center"
                  flex={1}
                  backgroundColor="#F3F4F6"
                  borderWidth={1.5}
                  borderColor="#E5E7EB"
                  onPress={clearSignature}
                >
                  <Text color="#374151" fontSize={16} fontWeight="600">
                    Clear
                  </Text>
                </Touchable>
                <Touchable
                  paddingVertical={16}
                  borderRadius={12}
                  alignItems="center"
                  justifyContent="center"
                  flex={1}
                  shadowOffset={{
                    width: 0,
                    height: 3,
                  }}
                  shadowOpacity={0.3}
                  shadowRadius={6}
                  elevation={5}
                  backgroundColor={backgroundColorButton}
                  shadowColor={backgroundColorButton}
                  onPress={saveSignature}
                >
                  <Text color="#FFFFFF" fontSize={16} fontWeight="700">
                    Save
                  </Text>
                </Touchable>
              </Box>
            </Box>
          </Box>
        </Box>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  centeredModal: {
    justifyContent: 'center',
  },
});

export default SignatureModal;
